/* eslint-disable prettier/prettier */

import { Inject, Logger } from "@nestjs/common";
import { Db } from "mongodb";

import { MONGO_INTERPOLATED_MAP_COLLECTION_NAME, MongoInterpolatedMap } from "#database/mongodb/schemas/interpolated-map";
import { InterpolatedMapsRepository } from "../../../domain/interfaces/interpolated-maps-repository";
import { MongodbService } from "@/modules/shared/services/mongodb-service";
import { InterpolatedMap } from "../../../domain/entities/InterpolatedMap";

export class MongoDbInterpolatedMapsRepository implements InterpolatedMapsRepository {
  private readonly logger = new Logger(MongoDbInterpolatedMapsRepository.name);
  private db: Db;

  constructor(
    @Inject(MongodbService)
    private readonly mongoService: MongodbService
  ) {}

  public async findMany(filters: {
    field: string;
    startDate: Date;
    endDate: Date;
  }): Promise<InterpolatedMap[]> {
    try {
      const { endDate, field, startDate } = filters;

      this.db = this.mongoService.getDatabase();
      const collection = this.db.collection(
        MONGO_INTERPOLATED_MAP_COLLECTION_NAME
      );

      const mognoDbResult = await collection
        .aggregate<MongoInterpolatedMap>([
          {
            $match: {
              field,
              timestamp: {
                $gte: startDate,
                $lte: endDate,
              },
            },
          },
          { $sort: { timestamp: 1 } },
        ])
        .toArray();

      const result: InterpolatedMap[] = [];

      for (const data of mognoDbResult) {
        const parsed = new InterpolatedMap({
          id: data._id.toString(),
          field: data.field,
          geojsonCompressed: data.geojson_compressed,
          interval: data.interval,
          timeStamp: data.timestamp,
        });
        if (parsed) {
          result.push(parsed);
        }
      }
      return result;
    } catch (error) {
      this.logger.error("Failed to list stations", error);
      throw new Error("Failed to list stations");
    }
  }
}
