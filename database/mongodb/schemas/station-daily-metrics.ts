import { ObjectId } from "mongodb";

export const STATION_DAILY_METRICS_COLLECTION_NAME = "station_daily_metrics";

export interface MongoStationDailyMetrics {
  _id: ObjectId;
  date: Date;
  stationSlug: string;
  avgTemperature: number | null;
  minTemperature: number | null;
  maxTemperature: number | null;
  avgAirHumidity: number | null;
  rainVolume: number;
  rainVolumeAcc: number;
  rainVolumeAccLastHour: number;
  windSpeed: number;
  maxWindSpeed: number | null;
  minWindSpeed: number | null;
  windDirection: number;
  avgWindDirection: number | null;
  avgWindDirectionLastHour: number;
  recordsCount: number;
  lastUpdate: Date;
  isOnline: boolean;
}
