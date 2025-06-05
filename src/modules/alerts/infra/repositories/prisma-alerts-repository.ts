import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { CivilDefenseAlertsRepository } from "../../domain/interfaces/alerts-repository";
import { AlertStatus, CivilDefenseAlerts, GravityLevel } from "../../domain/entities/alerts";
import { CivilDefenseAlert } from "@prisma/client"

@Injectable()
export class PrismaCivilDefenseAlertsRepository implements CivilDefenseAlertsRepository {
  private readonly logger: Logger = new Logger(
    PrismaCivilDefenseAlertsRepository.name
  );

  constructor(private readonly prisma: PrismaService) {}

  public async listAll(): Promise<CivilDefenseAlerts[]> {
    try {
      this.logger.log("Fetching all civil defense alerts...");

      const resultData = await this.prisma.civilDefenseAlert.findMany({
        where: {status : AlertStatus.ACTIVE}
      });

      const mappedResult = resultData.map((v : CivilDefenseAlert) => {
        return new CivilDefenseAlerts({
                id: v.id,
                title: v.title,
                gravityLvl: v.gravityLvl as GravityLevel,
                description : v.description,
                status: v.status as AlertStatus,
                createdAt : v.createdAt
              })  
      })
      
      this.logger.log(`Total civil defense alerts found: ${resultData.length}`);

      return mappedResult;

    } catch (error: unknown) {
      this.logger.error("Failed to list civil defense alerts", { error });
      throw new Error("Failed to list civil defense alerts");
    }
  }
}
