import { ObjectId } from "mongodb";

export const REGION_DAILY_RANKINGS_COLLECTION_NAME = "region_daily_rankings";

export type RankingSummary = {
  stationSlug: string;
  value: number;
  timestamp: Date;
};

export interface MongoRegionDailyRanking {
  _id: ObjectId;
  date: Date;

  // Temperature
  byLatestTemperature: Array<RankingSummary>;
  byMaxTemperature: Array<RankingSummary>;
  byMinTemperature: Array<RankingSummary>;

  // Rain Volume
  byRainVolumeAcc: Array<RankingSummary>;

  // WindSpeed
  byMaxWindSpeed: Array<RankingSummary>;
  byLatestWindSpeed: Array<RankingSummary>;
  byLatestWindDirection: Array<RankingSummary>;

  // Air humidity
  byLatestAirHumidity: Array<RankingSummary>;

  // Atm
  byLatestAtmosphericPressure: Array<RankingSummary>;

  updatedAt: Date;
}
