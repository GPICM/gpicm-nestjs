import { ObjectId } from "mongodb";

export const STATION_DAILY_PRECIPITATION_METRICS_COLLECTION_NAME =
  "station_daily_precipitation_metrics";

export interface MongoStationDailyPrecipitationMetrics {
  _id: ObjectId;
  date: Date;

  // Station
  stationSlug: string;
  stationDescription: string;
  stationAddress: string;

  // Precipitation
  latestRainVolume: number | null;
  rainVolumeAcc: number | null;
  rainVolumeAccPerHour: number[];

  // Metadata
  isOnline: boolean;
  recordsCount: number;
  lastRecordAt: Date;
  updatedAt: Date;
}
