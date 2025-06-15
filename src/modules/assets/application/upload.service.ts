/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { User } from "@/modules/identity/domain/entities/User";
import {
  BlobStorageRepository,
  BlobStorageRepositoryTypes,
} from "@/modules/shared/domain/interfaces/repositories/blob-storage-repository";
import { formatDateToNumber } from "@/modules/shared/utils/date-utils";
import { Inject, Logger } from "@nestjs/common";
import {
  ImageProcessor,
  ImageProcessorTypes,
} from "../interfaces/image-processor";
import { createHash, randomBytes } from "crypto";

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
    file: any,
    target: "users" | "posts"
  ): Promise<any> {
    this.logger.log("(uploadImage) Uploading image", { user, file });

    try {
      const buffer = Buffer.from(file.buffer);
      const result = await this.processImage(user, buffer);

      const imageGrouphash = createHash("sha256")
        .update(buffer)
        .update(Date.now().toString())
        .update(randomBytes(6))
        .digest("hex")
        .slice(0, 12);

      const uploadedLocations = await Promise.all(
        result.map(async ({ alias, buffer }) => {
          const filename = `${imageGrouphash}_${alias}.webp`;
          return await this.uploadFile(user, buffer, target, filename);
        })
      );

      return uploadedLocations;
    } catch (error) {
      this.logger.error("(uploadImage) Failed to upload image", error as Error);
      throw new Error("Failed to upload image. Please try again later.");
    }
  }

  public async processImage(
    user: User,
    buffer: Buffer
  ): Promise<ImageProcessorTypes.TransformedImage[]> {
    this.logger.log("(processImage) Processing image", { user });

    const userProfileImageConfig = new ImageProcessorTypes.ImageTransformConfig(
      {
        format: "webp",
        sizes: [
          {
            alias: "sm",
            maxWidth: 128,
          },
          {
            alias: "md",
            maxWidth: 320,
          },
          {
            alias: "lg",
            maxWidth: 512,
          },
        ],
      }
    );

    try {
      const result = await this.imageProcessor.process(
        buffer,
        userProfileImageConfig
      );

      return result;
    } catch (error) {
      this.logger.error("(uploadImage) Failed to upload image", error as Error);
      throw new Error("Failed to upload image. Please try again later.");
    }
  }
}
