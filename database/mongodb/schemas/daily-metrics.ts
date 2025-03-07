import { ObjectId } from "mongodb";

export const DAILY_METRICS_COLLECTION_NAME = "daily_metrics";

export interface MongoDailyMetrics {
  _id: ObjectId;
  date: Date;

  // Temperature
  avgTemperature: number | null;
  minTemperature: number | null;
  maxTemperature: number | null;

  // Humidity
  avgAirHumidity: number | null;

  // Precipitation
  rainVolume: number;
  rainVolumeAcc: number;
  rainVolumeAccLastHour: number;

  // Wind
  windSpeed: number;
  maxWindSpeed: number | null;
  minWindSpeed: number | null;

  windDirection: number;
  avgWindDirection: number | null;
  avgWindDirectionLastHour: number;

  // Metadata
  recordsCount: number;
  lastUpdate: Date;
}
