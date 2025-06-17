import { Global, Module } from "@nestjs/common";

import { BlobStorageRepository } from "../shared/domain/interfaces/repositories/blob-storage-repository";
import { LocalBlobStorageRepository } from "./infra/repositories/local-blob-storage-reppository";
import { AssetsController } from "./presentation/controllers/assets.controller";
import { UploadService } from "./application/upload.service";
import { S3Adapter } from "./infra/repositories/s3-adapter";
import { SharedModule } from "../shared/shared.module";
import { MediaController } from "./presentation/controllers/media.controller";
import { ImageProcessor } from "./interfaces/image-processor";
import { SharpAdapter } from "./infra/sharp-adapter";
import { MediaRepository } from "./interfaces/repositories/media-repository";
import { PrismaMediaRepository } from "./infra/repositories/prisma-media-repository";
import { MediaService } from "./application/media.service";

@Global()
@Module({
  controllers: [AssetsController, MediaController],
  providers: [
    UploadService,
    MediaService,
    { provide: ImageProcessor, useClass: SharpAdapter },
    {
      provide: MediaRepository,
      useClass: PrismaMediaRepository,
    },
    {
      provide: BlobStorageRepository,
      useFactory: () => {
        if (process.env.NODE_ENV === "production") {
          return new S3Adapter(String(process.env.AWS_S3_ASSETS_BUCKET));
        } else {
          return new LocalBlobStorageRepository("public/assets");
        }
      },
    },
  ],
  imports: [SharedModule],
  exports: [UploadService, MediaService, BlobStorageRepository, ImageProcessor],
})
export class AssetsModule {}
