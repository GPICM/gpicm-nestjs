/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { User } from "@/modules/identity/domain/entities/User";
import {
  BlobStorageRepository,
  BlobStorageRepositoryTypes,
} from "@/modules/shared/domain/interfaces/repositories/blob-storage-repository";
import { formatDateToNumber } from "@/modules/shared/utils/date-utils";
import { Inject, Logger } from "@nestjs/common";
import path from "path";

export class UploadService {
  private readonly logger: Logger = new Logger(UploadService.name);

  constructor(
    @Inject(BlobStorageRepository)
    private readonly blobRepository: BlobStorageRepository
  ) {}

  public async uploadImage(
    user: User,
    file: any,
    fileName?: string
  ): Promise<string> {
    this.logger.log("(uploadImage) Uploading image", { user, file });

    const numericDate = formatDateToNumber(new Date());

    const extension = path.extname(file.originalname) || ".bin";

    const resolvedFileName = `${user.publicId}${fileName ? `_${fileName}` : ""}_${numericDate}${extension}`;

    const addParams: BlobStorageRepositoryTypes.AddParams = {
      key: resolvedFileName,
      contentType: file.mimetype,
      buffer: Buffer.from(file.buffer),
    };

    try {
      this.logger.log("(uploadImage) Storing image blob", { fileName });
      await this.blobRepository.add(addParams);

      this.logger.log("(uploadImage) Generating image url", {});
      const imageUrl = `${process.env.ASSETS_HOST}/${fileName}`;

      return imageUrl;
    } catch (error) {
      this.logger.error("(uploadImage) Failed to upload image", error as Error);
      throw new Error("Failed to upload image. Please try again later.");
    }
  }
}
