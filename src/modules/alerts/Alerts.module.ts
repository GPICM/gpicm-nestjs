import { Module } from "@nestjs/common";
import { CivilDefenseAlertsController } from "./Alerts.controller";
import { CivilDefenseAlertsRepository } from "./domain/interfaces/alerts-repository";
import { PrismaCivilDefenseAlertsRepository } from "./infra/repositories/prisma-alerts-repository";
import { PrismaService } from "../shared/services/prisma-services";
import { PartnerAlertsController } from "./partner-alerts.controller";

@Module({
  controllers: [CivilDefenseAlertsController, PartnerAlertsController],
  providers: [
    PrismaService,
    {
      provide: CivilDefenseAlertsRepository,
      useClass: PrismaCivilDefenseAlertsRepository,
    },
  ],
  imports: [],
})
export class AlertsModule {}
