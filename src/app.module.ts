import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { SharedModule } from "./modules/shared/shared.module";
import { StationsModule } from "./modules/stations/stations.module";

@Module({
  controllers: [AppController],
  providers: [],
  imports: [SharedModule, StationsModule],
})
export class AppModule {}
