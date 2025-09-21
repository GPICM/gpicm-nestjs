import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { CivilDefenseAlertsRepository } from "../../domain/interfaces/alerts-repository";
import {
  AlertStatus,
  CivilDefenseAlerts,
  GravityLevel,
} from "../../domain/entities/alerts";
import { CivilDefenseAlert, PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaCivilDefenseAlertsRepository
  implements CivilDefenseAlertsRepository
{
  private readonly logger: Logger = new Logger(
    PrismaCivilDefenseAlertsRepository.name
  );

  constructor(private readonly prisma: PrismaService) {}

  public async inactiveAll(options?: {
    txContext: PrismaClient;
  }): Promise<void> {
    try {
      this.logger.log("Adding new alert");

      const prisma = options?.txContext ?? this.prisma.getConnection();

      await prisma.civilDefenseAlert.updateMany({
        data: { status: AlertStatus.INACTIVE },
      });
    } catch (error: unknown) {
      this.logger.error("Failed to list civil defense alerts", { error });
      throw new Error("Failed to list civil defense alerts");
    }
  }

  public async upsert(
    alert: CivilDefenseAlerts,
    options?: { txContext: PrismaClient }
  ): Promise<void> {
    try {
      this.logger.log("Adding new alert");

      const prisma = options?.txContext ?? this.prisma.getConnection();

      await prisma.civilDefenseAlert.upsert({
        where: {
          externalReference: alert.externalReference,
        },
        create: {
          title: alert.title,
          description: alert.description,
          gravityLevel: alert.gravityLevel,
          externalReference: alert.externalReference,
          status: alert.status,
          expiresAt: alert.expiresAt ?? undefined,
          publishAt: alert.publishAt ?? undefined,
          createdAt: alert.createdAt ?? undefined,
        },
        update: {
          title: alert.title,
          description: alert.description,
          gravityLevel: alert.gravityLevel,
          externalReference: alert.externalReference,
          status: alert.status,
          expiresAt: alert.expiresAt ?? undefined,
          publishAt: alert.publishAt ?? undefined,
        },
      });
    } catch (error: unknown) {
      this.logger.error("Failed to list civil defense alerts", { error });
      throw new Error("Failed to list civil defense alerts");
    }
  }

  public async listAll(): Promise<CivilDefenseAlerts[]> {
    try {
      this.logger.log("Fetching all civil defense alerts...");

      const now = new Date();
      const resultData = await this.prisma.civilDefenseAlert.findMany({
        where: {
          status: AlertStatus.ACTIVE,
          publishAt: { lte: now },
          OR: [{ expiresAt: { gte: now } }, { expiresAt: null }],
        },
      });

      const mappedResult = resultData.map((v: CivilDefenseAlert) => {
        return new CivilDefenseAlerts({
          id: v.id,
          title: v.title,
          gravityLevel: v.gravityLevel as GravityLevel,
          description: v.description,
          status: v.status as AlertStatus,
          externalReference: v.externalReference,
          createdAt: v.createdAt,
          expiresAt: v.expiresAt,
          publishAt: v.publishAt,
        });
      });

      this.logger.log(`Total civil defense alerts found: ${resultData.length}`);

      return mappedResult;
    } catch (error: unknown) {
      this.logger.error("Failed to list civil defense alerts", { error });
      throw new Error("Failed to list civil defense alerts");
    }
  }
}
