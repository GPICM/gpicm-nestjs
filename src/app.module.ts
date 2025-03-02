import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";

import { AppController } from "./app.controller";
import { SharedModule } from "./modules/shared/shared.module";
import { StationsModule } from "./modules/stations/stations.module";
import { ReportsModule } from "./modules/reports/reports.module";

@Module({
  controllers: [AppController],
  providers: [],
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 60000,
    }),
    SharedModule,
    StationsModule,
    ReportsModule,
  ],
})
export class AppModule {}
