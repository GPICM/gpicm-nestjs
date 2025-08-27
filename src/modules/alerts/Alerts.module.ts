import { Module } from "@nestjs/common";
import { CivilDefenseAlertsController } from "./Alerts.controller";
import { CivilDefenseAlertsRepository } from "./domain/interfaces/alerts-repository";
import { PrismaCivilDefenseAlertsRepository } from "./infra/repositories/prisma-alerts-repository";
import { PrismaService } from "../shared/services/prisma-services";
import { PartnerAlertsController } from "./partner-alerts.controller";
import { TelemetriaGpicmAlertsRepository } from "./infra/repositories/telemetria-gpicm-alerts-repository";
import { MariaDbCivilDefenseAlertsRepository } from "./infra/repositories/mariadb-telemetria-gpicm-alerts-repository";

@Module({
  controllers: [CivilDefenseAlertsController, PartnerAlertsController],
  providers: [
    PrismaService,
    TelemetriaGpicmAlertsRepository,
    MariaDbCivilDefenseAlertsRepository,
    {
      provide: CivilDefenseAlertsRepository,
      useClass: PrismaCivilDefenseAlertsRepository,
    },
  ],
  imports: [],
})
export class AlertsModule {}
