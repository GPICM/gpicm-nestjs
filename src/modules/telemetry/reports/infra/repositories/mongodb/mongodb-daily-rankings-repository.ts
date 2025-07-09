import { Db } from "mongodb";
import { MongodbService } from "@/modules/shared/services/mongodb-service";
import { Inject, Injectable } from "@nestjs/common";
import {
  MongoRegionDailyRanking,
  REGION_DAILY_RANKINGS_COLLECTION_NAME,
} from "#database/mongodb/schemas/region-daily-rankings";

@Injectable()
export class MongoDbDailyRankingsRepository {
  private db: Db;

  constructor(
    @Inject(MongodbService)
    private readonly mongoService: MongodbService
  ) {}

  public async getLatest(): Promise<MongoRegionDailyRanking | null> {
    try {
      this.db = this.mongoService.getDatabase();
      const collection = this.db.collection<MongoRegionDailyRanking>(
        REGION_DAILY_RANKINGS_COLLECTION_NAME
      );

      const data = await collection
        .aggregate<MongoRegionDailyRanking>([{ $sort: { date: -1 } }])
        .toArray();

      return data[0] ?? null;
    } catch (error: unknown) {
      console.error("Failed to get latest daily rankings etrics", { error });
      throw new Error(
        `Failed to get latest daily metrics: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
