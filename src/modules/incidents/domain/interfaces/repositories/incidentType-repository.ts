import { IncidentType } from "../../entities/IncidentType";

export abstract class IncidentTypeRepository {
  abstract add(incidentType: IncidentType): Promise<void>;

  abstract update(incidentType: IncidentType): Promise<void>;

  abstract delete(incidentTypeId: number): Promise<void>;

  abstract findById(incidentTypeId: number): Promise<IncidentType | null>;

  abstract listAll(): Promise<IncidentType[]>;
}
