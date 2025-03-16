/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Db } from "mongodb";
import { MongodbService } from "@/modules/shared/services/mongodb-service";
import { Inject, Injectable } from "@nestjs/common";
import {
  MongoWeatherRecord,
  WEATHER_RECORDS_COLLECTION_NAME,
} from "#database/mongodb/schemas/weather-records";
import { TimeSeriesMetric } from "@/modules/reports/domain/entities/TimeSeriesMetrics";

export type Granularity =
  | "minutely"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

export interface AggregatedWeatherRecord {
  intervalStart: Date;
  stationSlug: string;
  avgTemperature: number | null;
  avgAirHumidity: number | null;
  totalRainVolume: number | null;
  avgWindSpeed: number | null;
  avgWindDirection: number | null;
  maxWindGust: number | null;
  avgAtmosphericPressure: number | null;
  count: number;
}

// New response type containing granularity information
export interface AggregatedWeatherResponse {
  granularity: Granularity;
  data: AggregatedWeatherRecord[];
}

@Injectable()
export class MongoDbWeatherRecordsRepository {
  private db: Db;

  constructor(
    @Inject(MongodbService)
    private readonly mongoService: MongodbService
  ) {}

  public async getAggregatedWeatherRecords(
    startDate: Date,
    endDate: Date,
    stationSlug: string
  ): Promise<AggregatedWeatherResponse> {
    try {
      this.db = this.mongoService.getDatabase();
      const collection = this.db.collection<MongoWeatherRecord>(
        WEATHER_RECORDS_COLLECTION_NAME
      );

      const matchStage = {
        $match: {
          timestamp: { $gte: startDate, $lt: endDate },
          stationSlug,
        },
      };

      // Get both config and granularity
      const { config: dateTruncConfig, granularity } =
        this.determineGranularity(startDate, endDate);

      const pipeline = [
        matchStage,
        { $addFields: { intervalStart: { $dateTrunc: dateTruncConfig } } },
        {
          $group: {
            _id: {
              intervalStart: "$intervalStart",
              stationSlug: "$stationSlug",
            },
            avgTemperature: { $avg: "$temperature" },
            avgAirHumidity: { $avg: "$airHumidity" },
            totalRainVolume: { $sum: "$rainVolume" },
            avgWindSpeed: { $avg: "$windSpeed" },
            avgWindDirection: { $avg: "$windDirection" },
            maxWindGust: { $max: "$windGust" },
            avgAtmosphericPressure: { $avg: "$atmosphericPressure" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            intervalStart: "$_id.intervalStart",
            stationSlug: "$_id.stationSlug",
            avgTemperature: 1,
            avgAirHumidity: 1,
            totalRainVolume: 1,
            avgWindSpeed: 1,
            avgWindDirection: 1,
            maxWindGust: 1,
            avgAtmosphericPressure: 1,
            count: 1,
          },
        },
        { $sort: { intervalStart: 1, stationSlug: 1 } },
      ];

      const data = await collection
        .aggregate<AggregatedWeatherRecord>(pipeline)
        .toArray();

      return { granularity, data }; // Return granularity with data
    } catch (error: unknown) {
      console.error("Failed to aggregate weather records", { error });
      throw new Error(
        `Failed to aggregate weather records: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  public async getAggregatedTimesSeriesMetrics(
    stationSlug: string,
    filters: {
      startDate: Date;
      endDate: Date;
    }
  ): Promise<{
    avgTemperature: TimeSeriesMetric;
    avgAirHumidity: TimeSeriesMetric;
    totalRainVolume: TimeSeriesMetric;
    avgWindSpeed: TimeSeriesMetric;
    maxWindGust: TimeSeriesMetric;
    avgAtmosphericPressure: TimeSeriesMetric;
    count: number;
  }> {
    try {
      const { endDate, startDate } = filters;

      this.db = this.mongoService.getDatabase();
      const collection = this.db.collection<MongoWeatherRecord>(
        WEATHER_RECORDS_COLLECTION_NAME
      );

      const matchStage = {
        $match: {
          timestamp: { $gte: startDate, $lt: endDate },
          stationSlug,
        },
      };

      const { config: dateTruncConfig } = this.determineGranularity(
        startDate,
        endDate
      );

      const pipeline = [
        matchStage,
        { $addFields: { intervalStart: { $dateTrunc: dateTruncConfig } } },
        {
          $group: {
            _id: {
              intervalStart: "$intervalStart",
              stationSlug: "$stationSlug",
            },
            avgTemperature: { $avg: "$temperature" },
            avgAirHumidity: { $avg: "$airHumidity" },
            totalRainVolume: { $sum: "$rainVolume" },
            avgWindSpeed: { $avg: "$windSpeed" },
            maxWindGust: { $max: "$windGust" },
            avgAtmosphericPressure: { $avg: "$atmosphericPressure" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            intervalStart: "$_id.intervalStart",

            stationSlug: "$_id.stationSlug",

            avgTemperature: { $round: ["$avgTemperature", 1] },

            avgAirHumidity: { $round: ["$avgAirHumidity", 1] },

            totalRainVolume: { $round: ["$totalRainVolume", 1] },

            avgWindSpeed: {
              $round: [{ $multiply: ["$avgWindSpeed", 3.6] }, 1],
            },

            maxWindGust: {
              $round: [{ $multiply: ["$maxWindGust", 3.6] }, 1],
            },
            avgAtmosphericPressure: {
              $round: [{ $divide: ["$avgAtmosphericPressure", 1013.25] }, 3],
            },
            count: 1,
          },
        },
        {
          $sort: {
            intervalStart: 1,
          },
        },
        {
          $group: {
            _id: "$stationSlug",
            avgTemperature: {
              $push: {
                timestamp: { $toLong: "$intervalStart" },
                value: { $ifNull: ["$avgTemperature", null] },
              },
            },
            avgAirHumidity: {
              $push: {
                timestamp: { $toLong: "$intervalStart" },
                value: { $ifNull: ["$avgAirHumidity", null] },
              },
            },
            totalRainVolume: {
              $push: {
                timestamp: { $toLong: "$intervalStart" },
                value: { $ifNull: ["$totalRainVolume", null] },
              },
            },
            avgWindSpeed: {
              $push: {
                timestamp: { $toLong: "$intervalStart" },
                value: { $ifNull: ["$avgWindSpeed", null] },
              },
            },
            maxWindGust: {
              $push: {
                timestamp: { $toLong: "$intervalStart" },
                value: { $ifNull: ["$maxWindGust", null] },
              },
            },
            avgAtmosphericPressure: {
              $push: {
                timestamp: { $toLong: "$intervalStart" },
                value: {
                  $ifNull: ["$avgAtmosphericPressure", null],
                },
              },
            },
            count: { $sum: "$count" },
          },
        },
        {
          $project: {
            _id: 0,
            slug: "$_id",
            avgTemperature: {
              $map: {
                input: "$avgTemperature",
                as: "temp",
                in: ["$$temp.timestamp", "$$temp.value"],
              },
            },
            avgAirHumidity: {
              $map: {
                input: "$avgAirHumidity",
                as: "humidity",
                in: ["$$humidity.timestamp", "$$humidity.value"],
              },
            },
            totalRainVolume: {
              $map: {
                input: "$totalRainVolume",
                as: "rain",
                in: ["$$rain.timestamp", "$$rain.value"],
              },
            },
            avgWindSpeed: {
              $map: {
                input: "$avgWindSpeed",
                as: "wind",
                in: ["$$wind.timestamp", "$$wind.value"],
              },
            },
            maxWindGust: {
              $map: {
                input: "$maxWindGust",
                as: "gust",
                in: ["$$gust.timestamp", "$$gust.value"],
              },
            },
            avgAtmosphericPressure: {
              $map: {
                input: "$avgAtmosphericPressure",
                as: "pressure",
                in: ["$$pressure.timestamp", "$$pressure.value"],
              },
            },
            count: 1,
          },
        },
      ];

      const result = await collection
        .aggregate<{
          avgTemperature: TimeSeriesMetric;
          avgAirHumidity: TimeSeriesMetric;
          totalRainVolume: TimeSeriesMetric;
          avgWindSpeed: TimeSeriesMetric;
          maxWindGust: TimeSeriesMetric;
          avgAtmosphericPressure: TimeSeriesMetric;
          count: number;
        }>(pipeline)
        .toArray();
      // Return the first result (or default if no data)
      return (
        result[0] || {
          avgTemperature: [],
          avgAirHumidity: [],
          totalRainVolume: [],
          avgWindSpeed: [],
          maxWindGust: [],
          avgAtmosphericPressure: [],
          count: 0,
        }
      );
    } catch (error: unknown) {
      console.error("Failed to aggregate weather records", { error });
      throw new Error(
        `Failed to aggregate weather records: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
  private determineGranularity(
    startDate: Date,
    endDate: Date
  ): { config: any; granularity: Granularity } {
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    let unit: string;
    const binSize = 1;

    if (diffDays <= 1) {
      unit = "hour";
    } else if (diffDays <= 7) {
      unit = "hour";
    } else if (diffDays <= 30) {
      unit = "day";
    } else if (diffDays <= 90) {
      unit = "week";
    } else if (diffDays <= 365) {
      unit = "month";
    } else {
      unit = "year";
    }

    // Map unit to granularity type
    const granularityMap: Record<string, Granularity> = {
      minute: "minutely",
      hour: "hourly",
      day: "daily",
      week: "weekly",
      month: "monthly",
      year: "yearly",
    };

    const config: any = {
      date: "$timestamp",
      unit,
      binSize,
    };

    if (unit === "week") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      config.startOfWeek = "monday";
    }

    return {
      config,
      granularity: granularityMap[unit],
    };
  }
}
