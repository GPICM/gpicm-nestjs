import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export enum AlertStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum GravityLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  VERY_HIGH = "VERY_HIGH",
  EXTREME = "EXTREME",
}

export class CivilDefenseAlerts {
  id: number;

  title: string;

  description: string;

  gravityLevel: GravityLevel;

  createdAt: Date | null;

  externalReference: string | null;

  publishAt: Date | null;

  expiresAt: Date | null;

  status: AlertStatus;

  constructor(args: NonFunctionProperties<CivilDefenseAlerts>) {
    Object.assign(this, args);
  }
}
