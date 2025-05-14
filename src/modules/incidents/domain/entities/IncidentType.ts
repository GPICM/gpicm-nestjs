import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export class IncidentType {
  public id?: number;
  public name: string;
  public slug: string;
  public imageUrl: string | null;
  public description: string;
  public internalId: number;

  constructor(props: NonFunctionProperties<IncidentType>) {
    Object.assign(this, props);
  }
}
