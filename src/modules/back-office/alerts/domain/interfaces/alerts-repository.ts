import { Injectable } from "@nestjs/common";
import { CivilDefenseAlerts } from "../entities/alerts";

@Injectable()
export abstract class CivilDefenseAlertsRepository {
  abstract inactiveAll(options?: { txContext: unknown }): Promise<void>;

  abstract upsert(
    alert: CivilDefenseAlerts,
    options?: { txContext: unknown }
  ): Promise<void>;

  abstract listAll(): Promise<CivilDefenseAlerts[]>;
}
