import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export class IncidentShallow {
  id: string;

  imageUrl: string | null;

  incidentDate: Date;

  incidentTypeSlug: string;

  constructor(args: NonFunctionProperties<IncidentShallow>) {
    Object.assign(this, args);
  }

  public toJSON() {
    const serialized: Record<string, unknown> = { ...this } as Record<
      string,
      unknown
    >;
    delete serialized.id;
    return serialized;
  }
}
