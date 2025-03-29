import { Module } from "@nestjs/common";
import { SharedModule } from "../shared/shared.module";
import { AssetsController } from "./presentation/controllers/assets.controller";

@Module({
  controllers: [AssetsController],
  providers: [],
  imports: [SharedModule],
  exports: [],
})
export class AssetsModule {}
