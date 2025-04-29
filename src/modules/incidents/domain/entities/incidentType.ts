import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { Incident } from "./Incident"; 

export class IncidentType {
  id: number;
  name: string;
  description: string;
  internalId: number;
  incidents?: Incident[];

  constructor(props: Partial<NonFunctionProperties<IncidentType>>) {
    Object.assign(this, props);
  }
}