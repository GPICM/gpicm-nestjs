import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { JsonArray } from "@prisma/client/runtime/library";

export class Achievement {
  public id: number | undefined;

  public readonly name: string;

  public readonly description: string;

  public readonly criteria: JsonArray;

  public readonly image: string | null;

  public readonly createdAt: Date;

  public readonly updatedAt: Date;

  constructor(args: NonFunctionProperties<Achievement>) {
    Object.assign(this, args);
  }
  public toJSON(): NonFunctionProperties<Achievement> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      criteria: this.criteria,
      image: this.image,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
