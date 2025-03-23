import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

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

  incidentType: number;

  imagePreviewUrl: string | null;

  reporterName: string | null;

  observation: string | null;

  authorId: number;

  constructor(args: NonFunctionProperties<Incident>) {
    Object.assign(this, args);
  }
}
