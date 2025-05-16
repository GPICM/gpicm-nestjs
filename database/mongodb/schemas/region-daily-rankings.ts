import { Db, ObjectId } from "mongodb";

export const REGION_DAILY_RANKINGS_COLLECTION_NAME = "region_daily_rankings";

export interface MongoRegionDailyRanking {
  _id: ObjectId;
  date: Date;

  byMaxTemperature: Array<{ stationSlug: string; value: number }>;
  byMinTemperature: Array<{ stationSlug: string; value: number }>;
  byRainVolumeAcc: Array<{ stationSlug: string; value: number }>;
  byMaxWindSpeed: Array<{ stationSlug: string; value: number }>;

  updatedAt: Date;
}
