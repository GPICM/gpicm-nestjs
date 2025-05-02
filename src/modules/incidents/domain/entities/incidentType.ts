import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export class IncidentType {
  id: number;
  name: string;
  description: string;
  internalId: number;

  constructor(props: NonFunctionProperties<IncidentType>) {
    Object.assign(this, props);
  }
}