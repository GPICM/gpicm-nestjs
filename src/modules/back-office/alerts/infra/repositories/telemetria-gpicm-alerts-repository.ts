import z from "zod";
import https from "https";

import { Injectable, Logger } from "@nestjs/common";

import { HttpClient } from "@/modules/shared/domain/interfaces/http-client/http-client";

import {
  AlertStatus,
  CivilDefenseAlerts,
  GravityLevel,
} from "../../domain/entities/alerts";
import { CivilDefenseAlertsRepository } from "../../domain/interfaces/alerts-repository";
import { CivilDefenseAlertDtoSchema } from "./utils/telemetria-gpicm-utils";
import he from "he";

const UFRJ_TELEMETRIA_API_URL =
  "https://telemetria.macae.ufrj.br/Api/obterAlertasDefesaCivil";
@Injectable()
export class TelemetriaGpicmAlertsRepository
  implements Pick<CivilDefenseAlertsRepository, "listAll">
{
  private readonly logger: Logger = new Logger(
    TelemetriaGpicmAlertsRepository.name
  );

  constructor(private readonly httpClient: HttpClient) {}

  public async listAll(): Promise<CivilDefenseAlerts[]> {
    try {
      this.logger.log("Fetching civil defense alerts");

      const response = await this.httpClient.request({
        url: UFRJ_TELEMETRIA_API_URL,
        method: "GET",
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      });

      if (response.statusCode !== 200) {
        throw new Error("invalid response");
      }

      const rawAlerts = response.getData<unknown>();

      const alerts = z.array(CivilDefenseAlertDtoSchema).safeParse(rawAlerts);

      if (!alerts.success) {
        this.logger.error("Invalid alert contract", alerts.error.format());
        return [];
      }

      const parsedAlerts = alerts.data.map((alert) => {
        const publishAt = new Date(alert.start_at);
        const expiresAt = new Date(alert.valid_at);

        const status =
          new Date() >= publishAt && new Date() <= expiresAt
            ? AlertStatus.ACTIVE
            : AlertStatus.INACTIVE;

        const withoutTags = alert.description.replace(/<[^>]+>/g, "");

        const plainText = he.decode(withoutTags).replace(/\s+/g, " ").trim();

        return new CivilDefenseAlerts({
          id: -1,
          title: alert.title,
          description: plainText,
          gravityLevel: alert.gravity_level as GravityLevel,
          externalReference: alert.id,
          createdAt: new Date(alert.updated_at ?? Date.now()),
          publishAt,
          expiresAt,
          status,
        });
      });

      this.logger.log(
        `Total civil defense alerts mapped: ${parsedAlerts.length}`
      );

      return parsedAlerts;
    } catch (error: unknown) {
      this.logger.error("Failed to list civil defense alerts", { error });
      throw new Error("Failed to list civil defense alerts");
    }
  }
}
