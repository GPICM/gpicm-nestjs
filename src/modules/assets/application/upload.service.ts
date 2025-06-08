/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { User } from "@/modules/identity/domain/entities/User";
import {
  BlobStorageRepository,
  BlobStorageRepositoryTypes,
} from "@/modules/shared/domain/interfaces/repositories/blob-storage-repository";
import { formatDateToNumber } from "@/modules/shared/utils/date-utils";
import { Inject, Logger } from "@nestjs/common";

export class UploadService {
  private readonly logger: Logger = new Logger(UploadService.name);

  constructor(
    @Inject(BlobStorageRepository)
    private readonly blobRepository: BlobStorageRepository
  ) {}

  public async uploadImage(user: User, file: any, index = 1): Promise<string> {
    this.logger.log("(uploadImage) Uploading image", { user, file });

    const numericDate = formatDateToNumber(new Date());

    const fileKey = `${user.publicId}_${file.originalname}_${numericDate}-${index}`;
    const addParams: BlobStorageRepositoryTypes.AddParams = {
      key: fileKey,
      contentType: file.mimetype,
      buffer: Buffer.from(file.buffer),
    };

    try {
      this.logger.log("(uploadImage) Storing image blob", { fileKey });
      await this.blobRepository.add(addParams);

      this.logger.log("(uploadImage) Generating image url", {});
      const imageUrl = `${process.env.ASSETS_HOST}/${fileKey}`;

      return imageUrl;
    } catch (error) {
      this.logger.error("(uploadImage) Failed to upload image", error as Error);
      throw new Error("Failed to upload image. Please try again later.");
    }
  }

}
