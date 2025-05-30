import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";

import { SharedModule } from "./shared/shared.module";
import { StationsModule } from "./stations/stations.module";
import { ReportsModule } from "./reports/reports.module";
import { IdentityModule } from "./identity/identity.module";
import { AppController } from "./app.controller";
import { IncidentsModule } from "./incidents/incidents.module";
import { AssetsModule } from "./assets/assets.module";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";

@Module({
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 60000,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 1024,
        },
      ],
    }),
    SharedModule,
    StationsModule,
    ReportsModule,
    IdentityModule,
    IncidentsModule,
    AssetsModule,
  ],
})
export class AppModule {}
