import { Injectable, Logger } from "@nestjs/common";

import mysql from "mysql2/promise";

import { CivilDefenseAlertDtoSchema } from "./utils/telemetria-gpicm-utils";
import { CivilDefenseAlertsRepository } from "../../domain/interfaces/alerts-repository";
import {
  AlertStatus,
  CivilDefenseAlerts,
  GravityLevel,
} from "../../domain/entities/alerts";

@Injectable()
export class MariaDbCivilDefenseAlertsRepository
  implements Pick<CivilDefenseAlertsRepository, "listAll">
{
  private readonly logger: Logger = new Logger(
    MariaDbCivilDefenseAlertsRepository.name
  );

  private connection: mysql.Connection;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      this.connection = await mysql.createConnection(
        String(process.env.UFRJ_LEGACY_MY_SQL_DATABASE_URL)
      );
      this.logger.log("Connected to MariaDB successfully");
    } catch (error: unknown) {
      this.logger.error("Failed to connect to MariaDB", { error });
      throw error;
    }
  }

  public async listAll(): Promise<CivilDefenseAlerts[]> {
    try {
      if (!this.connection) {
        await this.init();
      }

      this.logger.log("Fetching civil defense alerts from MariaDB");

      const [rows] = await this.connection.execute(
        "SELECT * FROM civil_defense_alerts"
      );

      const parsedAlerts: CivilDefenseAlerts[] = [];

      for (const row of rows as any[]) {
        const result = CivilDefenseAlertDtoSchema.safeParse(row);

        if (!result.success) {
          this.logger.warn("Skipping invalid database row", { result });
          continue;
        }

        const r = result.data;

        const publishAt = r.start_at ? new Date(r.start_at) : new Date();
        const expiresAt = r.valid_at ? new Date(r.valid_at) : null;

        const status =
          publishAt &&
          expiresAt &&
          new Date() >= publishAt &&
          new Date() <= expiresAt
            ? AlertStatus.ACTIVE
            : AlertStatus.INACTIVE;

        const plainDescription = r.description.replace(/<[^>]+>/g, "");

        parsedAlerts.push(
          new CivilDefenseAlerts({
            id: -1,
            title: r.title,
            description: plainDescription,
            gravityLevel: r.gravity_level as GravityLevel,
            externalReference: r.id,
            createdAt: new Date(),
            publishAt,
            expiresAt,
            status,
          })
        );
      }

      this.logger.log(
        `Total civil defense alerts fetched: ${parsedAlerts.length}`
      );
      return parsedAlerts;
    } catch (error: unknown) {
      this.logger.error("Failed to list civil defense alerts", { error });
      throw new Error("Failed to list civil defense alerts");
    }
  }
}
