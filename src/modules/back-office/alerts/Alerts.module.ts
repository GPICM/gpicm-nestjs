import { Module } from "@nestjs/common";

import { PrismaService } from "@/modules/shared/services/prisma-services";

import { CivilDefenseAlertsController } from "./alerts.controller";
import { CivilDefenseAlertsRepository } from "./domain/interfaces/alerts-repository";
import { PrismaCivilDefenseAlertsRepository } from "./infra/repositories/prisma-alerts-repository";
import { TelemetriaGpicmAlertsRepository } from "./infra/repositories/telemetria-gpicm-alerts-repository";
import { PartnerAlertsController } from "./partner-alerts.controller";

@Module({
  controllers: [CivilDefenseAlertsController, PartnerAlertsController],
  providers: [
    PrismaService,
    TelemetriaGpicmAlertsRepository,
    {
      provide: CivilDefenseAlertsRepository,
      useClass: PrismaCivilDefenseAlertsRepository,
    },
  ],
  imports: [],
})
export class AlertsModule {}
