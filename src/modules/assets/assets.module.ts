import { Global, Module } from "@nestjs/common";

import { BlobStorageRepository } from "../shared/domain/interfaces/repositories/blob-storage-repository";
import { LocalBlobStorageRepository } from "./infra/repositories/local-blob-storage-reppository";
import { AssetsController } from "./presentation/controllers/assets.controller";
import { UploadService } from "./application/upload.service";
import { S3Adapter } from "./infra/repositories/s3-adapter";
import { SharedModule } from "../shared/shared.module";

@Global()
@Module({
  controllers: [AssetsController],
  providers: [
    UploadService,
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
  exports: [UploadService, BlobStorageRepository],
})
export class AssetsModule {}
