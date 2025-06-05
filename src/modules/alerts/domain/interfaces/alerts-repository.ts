import { Injectable } from "@nestjs/common";
import { CivilDefenseAlerts } from "../entities/alerts";

@Injectable()
export abstract class CivilDefenseAlertsRepository {
  abstract listAll(): Promise<CivilDefenseAlerts[]>;
}
