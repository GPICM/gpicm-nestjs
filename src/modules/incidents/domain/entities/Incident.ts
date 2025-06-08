import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { AuthorSummary } from "../object-values/AuthorSumary";
import { IncidentType } from "./IncidentType";

export enum IncidentStatus {
  PENDING = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3,
  CANCELED = 4,
}

export class Incident {
  id: string;

  title: string;

  description: string;

  status: number;

  imageUrl: string | null;

  address: string;

  latitude: number | null;

  longitude: number | null;

  incidentDate: Date;

  imagePreviewUrl: string | null;

  reporterName: string | null;

  observation: string | null;

  author: AuthorSummary;

  incidentType: IncidentType;

  constructor(args: NonFunctionProperties<Incident>) {
    Object.assign(this, args);
  }
}
