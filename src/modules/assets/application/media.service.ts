/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { User } from "@/modules/identity/domain/entities/User";

import { Inject, Logger } from "@nestjs/common";

import {
  Media,
  MediaScopeEnum,
  MediaStatusEnum,
  MediaTargetEnum,
  MediaTypeEnum,
} from "../domain/entities/Media";
import { MediaRepository } from "../interfaces/repositories/media-repository";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { UploadService } from "./upload.service";
import { imageTransformMap } from "../domain/constants";
import { MediaSource } from "../domain/object-values/media-source";

export class MediaService {
  private readonly logger: Logger = new Logger(MediaService.name);

  constructor(
    @Inject(MediaRepository)
    private readonly mediaRepository: MediaRepository,
    @Inject(UploadService)
    private readonly uploadService: UploadService,
    private readonly prismaService: PrismaService
  ) {}

  public async draft(
    user: User,
    scope: MediaScopeEnum,
    scopedId: number,
    type: MediaTypeEnum,
    target: MediaTargetEnum,
    options?: { transactionContext: unknown }
  ): Promise<Media> {
    this.logger.log("(uploadFile) Uploading file", { user });

    try {
      const media = Media.createDraft(scope, scopedId, type, target);
      await this.mediaRepository.add(media, options);

      return media;
    } catch (error) {
      this.logger.error("(uploadImage) Failed to upload image", error as Error);
      throw new Error("Failed to upload image. Please try again later.");
    }
  }

  public async draftMany(
    user: User,
    args: Array<{
      scope: MediaScopeEnum;
      scopedId: number;
      type: MediaTypeEnum;
      target: MediaTargetEnum;
    }>
  ): Promise<Media[]> {
    this.logger.log("(uploadFile) Uploading file", { user });

    try {
      let medias: Media[] = [];
      await this.prismaService.openTransaction(async (transactionContext) => {
        medias = await Promise.all(
          args.map((arg) => {
            return this.draft(
              user,
              arg.scope,
              arg.scopedId,
              arg.type,
              arg.target,
              { transactionContext }
            );
          })
        );
      });

      return medias;
    } catch (error) {
      this.logger.error("(uploadImage) Failed to upload image", error as Error);
      throw new Error("Failed to upload image. Please try again later.");
    }
  }

  public async uploadMedia(
    user: User,
    mediaId: number,
    file: any
  ): Promise<Media> {
    this.logger.log("(uploadFile) Uploading file", { user, file });

    try {
      const buffer = Buffer.from(file.buffer);

      const media = await this.mediaRepository.findById(mediaId, user.id!);
      if (!media) {
        throw new Error("Media not found");
      }

      media.setStatus(MediaStatusEnum.UPLOADING);
      await this.mediaRepository.update(media);

      if (media.type == MediaTypeEnum.IMAGE) {
        const transformConfig = imageTransformMap[media.target];

        const uploaded = await this.uploadService.uploadImage(
          user,
          buffer,
          String(media.target),
          transformConfig
        );

        const sources = uploaded.map((dto) => {
          return new MediaSource({
            size: 0,
            alias: dto.alias,
            url: dto.location,
          });
        });

        media.setSources(sources);
      } else {
        throw new Error("Media not supported yet");
      }

      media.setStatus(MediaStatusEnum.ACTIVE);
      await this.mediaRepository.update(media);

      return media;
    } catch (error) {
      this.logger.error("(uploadImage) Failed to upload image", error as Error);
      throw new Error("Failed to upload image. Please try again later.");
    }
  }
}
