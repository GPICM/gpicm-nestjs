/* eslint-disable prettier/prettier */
import { MongodbService } from "@/modules/shared/services/mongodb-service";
import { Station } from "../../../domain/Station";
import { StationsRepository } from "../../../interfaces/stations-repository";
import { Inject, Logger } from "@nestjs/common";
import { Db } from "mongodb";
import {
  MongoDbStationMapper,
  MongoStationProjection,
} from "./mappers/mongodb-station.mapper";
import { STATION_DAILY_METRICS_COLLECTION_NAME } from "#database/mongodb/schemas/station-daily-metrics";

export class MongoDbStationsRepository implements StationsRepository {
  private readonly logger = new Logger(MongoDbStationsRepository.name);
  private db: Db;

  constructor(
    @Inject(MongodbService)
    private readonly mongoService: MongodbService
  ) {}

  public async findById(stationId: number): Promise<Station | null> {
    try {
      this.db = this.mongoService.getDatabase();
      const collection = this.db.collection("stations");

      const result = await collection.findOne<MongoStationProjection>({
        internalId: stationId,
      });

      return MongoDbStationMapper.fromMongo(result);
    } catch (error) {
      this.logger.error("Failed to find station", error);
      throw new Error("Failed to find station by id");
    }
  }

  public async findBySlug(stationSlug: string): Promise<Station | null> {
    try {
      this.db = this.mongoService.getDatabase();
      const collection = this.db.collection("stations");

      const result = await collection
        .aggregate<MongoStationProjection>([
          {
            $match: {
              slug: stationSlug,
            },
          },
          {
            $lookup: {
              from: STATION_DAILY_METRICS_COLLECTION_NAME,
              let: { stationSlug: "$slug" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$stationSlug", "$$stationSlug"] },
                  },
                },
                { $sort: { date: -1 } },
                { $limit: 1 },
              ],
              as: "latestMetrics",
            },
          },
          {
            $unwind: {
              path: "$latestMetrics",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              isOnline: {
                $cond: {
                  if: { $ne: ["$latestMetrics.isOnline", null] },
                  then: "$latestMetrics.isOnline",
                  else: false,
                },
              },
            },
          },
        ])
        .next();

      if (!result) return null;

      return MongoDbStationMapper.fromMongo(result);
    } catch (error) {
      this.logger.error("Failed to find station", error);
      throw new Error("Failed to find station by slug");
    }
  }


  public async listAll(): Promise<Station[]> {
    try {
      this.db = this.mongoService.getDatabase();
      const collection = this.db.collection("stations");

      const result = await collection
        .aggregate<MongoStationProjection>([
          { $match: { isActive: true } },
          {
            $lookup: {
              from: STATION_DAILY_METRICS_COLLECTION_NAME,
              let: { stationSlug: "$slug" },
              pipeline: [
                {
                  $match: { $expr: { $eq: ["$stationSlug", "$$stationSlug"] } },
                },
                { $sort: { date: -1 } },
                { $limit: 1 },
              ],
              as: "latestMetrics",
            },
          },
          {
            $unwind: {
              path: "$latestMetrics",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              isOnline: {
                $cond: {
                  if: { $ne: ["$latestMetrics.isOnline", null] },
                  then: "$latestMetrics.isOnline",
                  else: false,
                },
              },
            },
          },
          { $sort: { isOnline: -1 } },
        ])
        .toArray();

      const stations: Station[] = [];

      for (const data of result) {
        const station = MongoDbStationMapper.fromMongo(data);
        if (station) {
          stations.push(station);
        }
      }
      return stations;
    } catch (error) {
      this.logger.error("Failed to list stations", error);
      throw new Error("Failed to list stations");
    }
  }
}
