import { APP_GUARD } from "@nestjs/core";
import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { SharedModule } from "./shared/shared.module";
import { IdentityModule } from "./identity/identity.module";
import { AppController } from "./app.controller";
import { IncidentsModule } from "./incidents/incidents.module";
import { AssetsModule } from "./assets/assets.module";
import { TelemetryModule } from "./telemetry/telemetry.module";
import { SocialModule } from "./social/social.module";
import { BackOfficeModule } from "./back-office/back-office.module";

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
    TelemetryModule,
    IdentityModule,
    IncidentsModule,
    AssetsModule,
    SocialModule,
    BackOfficeModule,
  ],
})
export class AppModule {}
