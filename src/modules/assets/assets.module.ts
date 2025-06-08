import { Module } from "@nestjs/common";
import { SharedModule } from "../shared/shared.module";
import { AssetsController } from "./presentation/controllers/assets.controller";
import { UploadService } from "./application/upload.service";

@Module({
  controllers: [AssetsController],
  providers: [UploadService],
  imports: [SharedModule],
  exports: [UploadService],
})
export class AssetsModule {}
