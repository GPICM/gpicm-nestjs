/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { User } from "@/modules/identity/domain/entities/User";
import {
  BlobStorageRepository,
  BlobStorageRepositoryTypes,
} from "@/modules/shared/domain/interfaces/repositories/blob-storage-repository";
import { formatDateToNumber } from "@/modules/shared/utils/date-utils";
import { Inject, Logger } from "@nestjs/common";
import { ImageProcessor } from "../interfaces/image-processor";
import { createHash, randomBytes } from "crypto";
import { DEFAULT_IMAGE_CONFIG } from "../domain/constants";
import { ImageTransformConfig } from "../domain/object-values/image-transform-config";

export class UploadService {
  private readonly logger: Logger = new Logger(UploadService.name);

  constructor(
    @Inject(BlobStorageRepository)
    private readonly blobRepository: BlobStorageRepository,
    @Inject(ImageProcessor)
    private readonly imageProcessor: ImageProcessor
  ) {}

  public async uploadFile(
    user: User,
    buffer: Buffer,
    folder: string,
    fileName: string
  ): Promise<string> {
    this.logger.log("(uploadFile) Uploading file", { user, buffer });

    try {
      const numericDate = formatDateToNumber(new Date());

      const resolvedFileName = `${user.publicId}_${numericDate}_${fileName}`;

      const addParams: BlobStorageRepositoryTypes.AddParams = {
        folder,
        key: resolvedFileName,
        buffer: Buffer.from(buffer),
      };

      this.logger.log("(uploadFile) Storing blob", { fileName });
      const result = await this.blobRepository.add(addParams);

      return result.location;
    } catch (error) {
      this.logger.error("(uploadImage) Failed to upload image", error as Error);
      throw new Error("Failed to upload image. Please try again later.");
    }
  }

  public async uploadImage(
    user: User,
    buffer: Buffer,
    target: string,
    config?: ImageTransformConfig
  ): Promise<Array<{ location: string; alias: string }>> {
    this.logger.log("(uploadImage) Uploading image", { user, buffer });

    try {
      const transformConfig = config ?? DEFAULT_IMAGE_CONFIG;
      const result = await this.imageProcessor.process(buffer, transformConfig);

      const imageGrouphash = createHash("sha256")
        .update(result[0].buffer)
        .update(Date.now().toString())
        .update(randomBytes(6))
        .digest("hex")
        .slice(0, 12);

      const uploadedLocations = await Promise.all(
        result.map(async ({ alias, buffer: innerBuffer }) => {
          const filename = `${imageGrouphash}_${alias}.webp`;

          const result = await this.uploadFile(
            user,
            innerBuffer,
            target,
            filename
          );
          return { location: result, alias };
        })
      );

      return uploadedLocations;
    } catch (error) {
      this.logger.error("(uploadImage) Failed to upload image", error as Error);
      throw new Error("Failed to upload image. Please try again later.");
    }
  }
}
