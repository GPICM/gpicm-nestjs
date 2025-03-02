import { ObjectId } from "mongodb";

export const WEATHER_RECORDS_COLLECTION_NAME = "weather_records";

export interface MongoWeatherRecord {
  _id: ObjectId;
  timestamp: Date;
  stationSlug: string;
  temperature: number | null;
  airHumidity: number | null;
  rainVolume: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  windGust: number | null;
  atmosphericPressure: number | null;
  createdAt: Date;
}
