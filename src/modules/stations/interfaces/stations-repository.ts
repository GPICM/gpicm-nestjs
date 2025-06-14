import { Injectable } from "@nestjs/common";
import { Station } from "../domain/Station";

@Injectable()
export abstract class StationsRepository {
  abstract findById(stationId: number): Promise<Station | null>;

  abstract findBySlug(stationSlug: string): Promise<Station | null>;

  abstract listAll(): Promise<Station[]>;
}
