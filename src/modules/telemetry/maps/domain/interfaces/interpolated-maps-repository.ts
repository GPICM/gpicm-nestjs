import { Injectable } from "@nestjs/common";
import { InterpolatedMap } from "../entities/InterpolatedMap";

@Injectable()
export abstract class InterpolatedMapsRepository {
  abstract findMany(filters: {
    field: string;
    startDate: Date;
    endDate: Date;
  }): Promise<InterpolatedMap[]>;
}
