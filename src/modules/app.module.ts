import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";

import { SharedModule } from "./shared/shared.module";
import { StationsModule } from "./stations/stations.module";
import { ReportsModule } from "./reports/reports.module";
import { IdentityModule } from "./identity/identity.module";
import { AppController } from "./app.controller";
import { IncidentsModule } from "./incidents/incidents.module";

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
    IdentityModule,
    IncidentsModule
  ],
})
export class AppModule {}
