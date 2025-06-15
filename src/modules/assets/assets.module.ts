import { Global, Module } from "@nestjs/common";
import { SharedModule } from "../shared/shared.module";
import { AssetsController } from "./presentation/controllers/assets.controller";
import { UploadService } from "./application/upload.service";
import { BlobStorageRepository } from "../shared/domain/interfaces/repositories/blob-storage-repository";
import { LocalBlobStorageRepository } from "./infra/repositories/local-blob-storage-reppository";

@Global()
@Module({
  controllers: [AssetsController],
  providers: [
    UploadService,
    {
      provide: BlobStorageRepository,
      useFactory: () => new LocalBlobStorageRepository("public/assets"),
    },
  ],
  imports: [SharedModule],
  exports: [UploadService, BlobStorageRepository],
})
export class AssetsModule {}
