import { ObjectId } from "mongodb";

export const REGION_DAILY_METRICS_COLLECTION_NAME = "region_daily_metrics";

export interface MongoRegionDailyMetrics {
  _id: ObjectId;
  date: Date;

  // Temperature
  latestTemperature: number | null;
  avgTemperature: number | null;
  minTemperature: number | null;
  maxTemperature: number | null;

  // Humidity
  latestAirHumidity: number | null;
  avgAirHumidity: number | null;
  minAirHumidity: number | null;
  maxAirHumidity: number | null;

  // Precipitation
  latestRainVolume: number | null;
  rainVolumeAcc: number | null;

  // Wind
  latestWindSpeed: number | null;
  avgWindSpeed: number | null;
  minWindSpeed: number | null;
  maxWindSpeed: number | null;

  latestWindDirection: number | null;
  avgWindDirection: number | null;

  // Metadata
  stationsCount: number;
  updatedAt: Date;
}
