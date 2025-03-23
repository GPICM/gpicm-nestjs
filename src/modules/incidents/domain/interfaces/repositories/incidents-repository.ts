import { Incident } from "../../entities/Incident";

export abstract class IncidentsRepository {
  abstract add(Incident: Incident): Promise<void>;

  abstract findById(incidentId: string): Promise<Incident | null>;

  abstract listAll(): Promise<Incident[]>;
}
