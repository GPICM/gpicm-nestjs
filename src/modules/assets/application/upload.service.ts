/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { User } from "@/modules/identity/domain/entities/User";
import {
  BlobStorageRepository,
  BlobStorageRepositoryTypes,
} from "@/modules/shared/domain/interfaces/repositories/blob-storage-repository";
import { Inject, Logger } from "@nestjs/common";

export class UploadService {
  private readonly logger: Logger = new Logger(UploadService.name);

  constructor(
    @Inject(BlobStorageRepository)
    private readonly blobRepository: BlobStorageRepository
  ) {}

  private async uploadImage(user: User, file: any) {
    this.logger.log("(uploadImage) Uploading image", { user, file });

    const fileKey = `${user.id}_${Date.now()}_${file.originalname}`;
    const addParams: BlobStorageRepositoryTypes.AddParams = {
      key: fileKey,
      contentType: file.mimetype,
      buffer: Buffer.from(file.buffer),
    };

    this.logger.log("(uploadImage) Storing image blob", { fileKey });

    await this.blobRepository.add(addParams);

    this.logger.log("(uploadImage) Generating image url", {});

    const imageUrl = `${process.env.ASSETS_HOST}/${fileKey}`;

    return imageUrl;
  }
}
