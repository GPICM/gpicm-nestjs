/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { User } from "@/modules/identity/domain/entities/User";

import { Inject, Logger } from "@nestjs/common";

import {
  Media,
  MediaStatusEnum,
  MediaStorageProviderEnum,
  MediaTypeEnum,
} from "../domain/entities/Media";
import { MediaRepository } from "../interfaces/repositories/media-repository";
import { UploadService } from "./upload.service";
import { resolveImageTransformConfig } from "../domain/constants";

import { ImageTargetEnum } from "../domain/enums/image-target-enum";
import { ImageProcessor } from "../interfaces/image-processor";

export class MediaService {
  private readonly logger: Logger = new Logger(MediaService.name);

  constructor(
    @Inject(MediaRepository)
    private readonly mediaRepository: MediaRepository,
    @Inject(UploadService)
    private readonly uploadService: UploadService,
    @Inject(ImageProcessor)
    private readonly imageProcessor: ImageProcessor
  ) {}

  public async uploadMedia(
    user: User,
    buffer: Buffer,
    type: MediaTypeEnum,
    contentType: string,
    options?: {
      caption?: string;
      altText?: string;
      imageTargetConfig?: ImageTargetEnum;
    }
  ): Promise<Media> {
    const userId = user.id;
    this.logger.log("(uploadFile) Uploading file", {
      type,
      userId,
      contentType,
      options,
    });

    try {
      const media = Media.Create(
        user,
        type,
        contentType,
        options?.caption,
        options?.altText
      );

      media.startUpload(
        process.env.NODE_ENV === "production"
          ? MediaStorageProviderEnum.S3
          : MediaStorageProviderEnum.LOCAL
      );
      await this.mediaRepository.add(media);

      if (media.type == MediaTypeEnum.IMAGE) {
        const transformConfig = resolveImageTransformConfig(
          options?.imageTargetConfig
        );

        const processed = await this.imageProcessor.process(
          buffer,
          transformConfig
        );

        const mediaSource = await this.uploadService.uploadImage(
          user,
          media.filename,
          processed
        );

        media.setSources(mediaSource);
        media.setContentType(transformConfig.getContentType());
      } else {
        throw new Error("Media type not supported yet");
      }

      media.setStatus(MediaStatusEnum.ACTIVE);
      await this.mediaRepository.update(media);

      return media;
    } catch (error) {
      this.logger.error("(uploadImage) Failed to upload image", error as Error);
      throw new Error("Failed to upload image. Please try again later.");
    }
  }

  public async findManyByIds(user: User, ids: string[]): Promise<Media[]> {
    const userId = user.id;

    this.logger.log("(findManyById) Finding medias by ids", {
      userId,
      ids,
    });

    try {
      const medias = await this.mediaRepository.findManyByIds(ids);

      return medias;
    } catch (error: unknown) {
      this.logger.error("(findManyById) Failed to find medias", { error });
      throw new Error("Failed to find medias");
    }
  }
}
