import { Db } from "mongodb";
import { MongodbService } from "@/modules/shared/services/mongodb-service";
import { Inject, Injectable } from "@nestjs/common";
import {
  REGION_DAILY_METRICS_COLLECTION_NAME,
  MongoRegionDailyMetrics,
} from "#database/mongodb/schemas/daily-metrics";

@Injectable()
export class MongoDbDailyMetricsRepository {
  private db: Db;

  constructor(
    @Inject(MongodbService)
    private readonly mongoService: MongodbService
  ) {}

  public async getLatest(): Promise<MongoRegionDailyMetrics | null> {
    try {
      this.db = this.mongoService.getDatabase();
      const collection = this.db.collection<MongoRegionDailyMetrics>(
        REGION_DAILY_METRICS_COLLECTION_NAME
      );

      const data = await collection
        .aggregate<MongoRegionDailyMetrics>([{ $sort: { date: -1 } }])
        .toArray();

      return data[0] ?? null;
    } catch (error: unknown) {
      console.error("Failed to get latest daily metrics", { error });
      throw new Error(
        `Failed to get latest daily metrics: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  public async getDailyMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<MongoRegionDailyMetrics | null> {
    try {
      this.db = this.mongoService.getDatabase();
      const collection = this.db.collection<MongoRegionDailyMetrics>(
        REGION_DAILY_METRICS_COLLECTION_NAME
      );

      const pipeline = [
        {
          $match: {
            date: { $gte: startDate, $lt: endDate },
          },
        },
        { $sort: { date: 1 } },
      ];

      const data = await collection
        .aggregate<MongoRegionDailyMetrics>(pipeline)
        .toArray();

      return data[0] ?? null;
    } catch (error: unknown) {
      console.error("Failed to aggregate weather records", { error });
      throw new Error(
        `Failed to aggregate weather records: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

}
