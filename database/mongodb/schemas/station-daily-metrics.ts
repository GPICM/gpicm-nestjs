import { ObjectId } from "mongodb";

export const STATION_DAILY_METRICS_COLLECTION_NAME = "station_daily_metrics";

export interface MongoStationDailyMetrics {
  _id: ObjectId;
  date: Date;

  // Station
  stationSlug: string;

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

  rainVolumeAccPerHour: number[];
  windDirectionPerHour: number[];

  // Metadata
  recordsCount: number;
  lastRecordAt: Date;
  updatedAt: Date;
  isOnline: boolean;
}
