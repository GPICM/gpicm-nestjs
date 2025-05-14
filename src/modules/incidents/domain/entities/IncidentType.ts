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
    this.slug = this.generateSlug(props.name);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-");
  }
}
