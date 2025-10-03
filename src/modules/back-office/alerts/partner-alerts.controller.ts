import { Controller, Post, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { CivilDefenseAlertsRepository } from "./domain/interfaces/alerts-repository";
import { TelemetriaGpicmAlertsRepository } from "./infra/repositories/telemetria-gpicm-alerts-repository";
import { PartnerApiKeyGuard } from "@/modules/identity/auth/presentation/meta/guards/partner-api-key.guard";
import { PrismaService } from "@/modules/shared/services/prisma-services";

@Controller("alerts/webhook")
@UseGuards(PartnerApiKeyGuard)
export class PartnerAlertsController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly telemetriaGpicmAlertsRepository: TelemetriaGpicmAlertsRepository,
    private readonly civilDefenseAlertsRepository: CivilDefenseAlertsRepository
  ) {}

  @Post("/")
  @Throttle({ default: { limit: 6, ttl: 60000 } })
  public async webhook(): Promise<any> {
    const newAlerts = await this.telemetriaGpicmAlertsRepository.listAll();

    await this.prismaService.openTransaction(async (txContext) => {
      await this.civilDefenseAlertsRepository.inactiveAll({ txContext });

      if (newAlerts.length) {
        await Promise.all(
          newAlerts.map(async (newAlert) => {
            await this.civilDefenseAlertsRepository.upsert(newAlert, {
              txContext,
            });
          })
        );
      }
    });

    return Promise.resolve({ status: "Recebido" });
  }
}
