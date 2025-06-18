import { User } from "@/modules/identity/domain/entities/User";
import {
  BlobStorageRepository,
  BlobStorageRepositoryTypes,
} from "@/modules/shared/domain/interfaces/repositories/blob-storage-repository";
import { Inject, Logger } from "@nestjs/common";
import { MediaSource } from "../domain/object-values/media-source";
import {
  MediaSourceVariant,
  MediaSourceVariantKey,
} from "../domain/object-values/media-source-variant";
import { extension } from "mime-types";

export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @Inject(BlobStorageRepository)
    private readonly blobRepository: BlobStorageRepository
  ) {}

  public async uploadFile(
    user: User,
    buffer: Buffer,
    fileName: string
  ): Promise<BlobStorageRepositoryTypes.BlobMetadata> {
    const userId = user.id!;
    this.logger.log(
      `[uploadFile] Preparing to upload for user ${userId}: ${fileName} (size: ${buffer.length} bytes)`
    );

    try {
      const result = await this.blobRepository.add({ fileName, buffer });
      this.logger.log(`[uploadFile] Successfully uploaded: ${fileName}`, {
        storageKey: result.storageKey,
        location: result.location,
        size: result.size,
      });
      return result;
    } catch (error: unknown) {
      this.logger.error(`[uploadFile] Failed to upload file: ${fileName}`, {
        error,
      });
      throw new Error("Failed to upload image. Please try again later.");
    }
  }

  public async uploadImage(
    user: User,
    baseFilename: string,
    contentType: string,
    sources: Array<{ buffer: Buffer; alias: string }>
  ): Promise<MediaSource> {
    const userId = user.id!;
    this.logger.log(
      `[uploadImage] Starting image upload for user ${userId} with ${sources.length} variants`
    );

    try {
      const mediaSource = new MediaSource();
      const ext = extension(contentType);

      await Promise.all(
        sources.map(async ({ alias, buffer }) => {
          const filename = `${baseFilename}_${alias}.${ext}`;
          this.logger.log(
            `[uploadImage] Uploading variant: ${alias} → ${filename} (size: ${buffer.length} bytes)`
          );

          const result = await this.uploadFile(user, buffer, filename);

          this.logger.log("Upload result", { result });

          const variant = new MediaSourceVariant({
            size: result.size,
            url: result.location,
            storageKey: result.storageKey,
          });

          mediaSource.set(alias as MediaSourceVariantKey, variant);
        })
      );

      this.logger.log(
        `[uploadImage] Finished uploading all image variants for base name: ${baseFilename}`
      );
      return mediaSource;
    } catch (error: unknown) {
      this.logger.error(
        "[uploadImage] Failed to upload one or more image variants",
        { error }
      );
      throw new Error("Failed to upload image. Please try again later.");
    }
  }

  public async uploadGenericBuffer(
    user: User,
    baseFilename: string,
    contentType: string,
    buffer: Buffer
  ): Promise<MediaSource> {
    const userId = user.id!;
    this.logger.log(`[uploadGenericBuffer] Starting upload for user ${userId}`);

    try {
      const ext = extension(contentType);
      const fileName = `${baseFilename}.${ext}`;

      const result = await this.uploadFile(user, buffer, fileName);

      const mediaSource = new MediaSource();
      const variant = new MediaSourceVariant({
        size: result.size,
        url: result.location,
        storageKey: result.storageKey,
      });

      mediaSource.set(MediaSourceVariantKey.base, variant);

      this.logger.log(
        `[uploadGenericBuffer] Finished uploading for: ${baseFilename}`
      );
      return mediaSource;
    } catch (error: unknown) {
      this.logger.error("[uploadGenericBuffer] Failed to upload", { error });
      throw new Error("Failed to upload. Please try again later.");
    }
  }
}
