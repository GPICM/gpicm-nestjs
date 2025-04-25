/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Db } from "mongodb";
import { MongodbService } from "@/modules/shared/services/mongodb-service";
import { Inject, Injectable } from "@nestjs/common";
import { DateTime } from "luxon";

import {
  STATION_DAILY_METRICS_COLLECTION_NAME,
  MongoStationDailyMetrics,
} from "#database/mongodb/schemas/station-daily-metrics";

@Injectable()
export class MongoDbStationDailyMetricsRepository {
  private db: Db;

  constructor(
    @Inject(MongodbService)
    private readonly mongoService: MongodbService
  ) {}

  public async getRainInsights(targetDateStr: string): Promise<
    Record<
      string,
      {
        last96h: number;
        last24h: number;
        last1h: number;
      }
    >
  > {
    try {
      this.db = this.mongoService.getDatabase();
      const collection = this.db.collection<MongoStationDailyMetrics>(
        STATION_DAILY_METRICS_COLLECTION_NAME
      );

      const timeZone = "America/Sao_Paulo";
      const now = DateTime.fromISO(targetDateStr).setZone(timeZone);

      const cutoff96h = now.minus({ hours: 96 });
      const cutoff24h = now.minus({ hours: 24 });

      const cutoff96hStartDay = cutoff96h.startOf("day");

      const docs = await collection
        .aggregate([
          {
            $match: {
              date: { $gte: cutoff96hStartDay.toUTC().toJSDate() },
            },
          },
          {
            $group: {
              _id: "$stationSlug",
              records: { $push: "$$ROOT" },
            },
          },
        ])
        .toArray();

      const rainInsightsByStation: Record<
        string,
        { last96h: number; last24h: number; last1h: number }
      > = {};

      for (const stationData of docs) {
        const { _id: stationSlug, records } = stationData;
        let rain96h = 0;
        let rain24h = 0;
        let rain1h = 0;

        for (let i = 0; i < records.length; i++) {
          const doc = records[i];
          const docDate = DateTime.fromJSDate(doc.date).setZone(timeZone);

          const isToday = docDate.hasSame(now, "day");

          if (isToday) {
            const currentHour = now.hour;
            rain1h = doc.rainVolumeAccPerHour?.[currentHour] ?? 0;
          }

          /* TODO: Validate later */
          if (i === records.length - 2 && docDate < cutoff24h) {
            const startHour = cutoff24h.hour;
            for (let h = startHour; h < 24; h++) {
              rain24h += doc.rainVolumeAccPerHour?.[h] ?? 0;
            }
          } else if (docDate >= cutoff24h) {
            rain24h += doc.rainVolumeAcc ?? 0;
          }

          /* if (docDate >= cutoff24h) {
            rain24h += doc.rainVolumeAcc ?? 0;
          } */

          if (i === 0 && docDate < cutoff96h) {
            const startHour = cutoff96h.hour;
            for (let h = startHour; h < 24; h++) {
              rain96h += doc.rainVolumeAccPerHour?.[h] ?? 0;
            }
          } else {
            rain96h += doc.rainVolumeAcc ?? 0;
          }
        }

        rainInsightsByStation[stationSlug] = {
          last96h: parseFloat(rain96h.toFixed(1)),
          last24h: parseFloat(rain24h.toFixed(1)),
          last1h: parseFloat(rain1h.toFixed(1)),
        };
      }

      return rainInsightsByStation;
    } catch (error: unknown) {
      console.error("Failed to aggregate weather records", { error });
      throw new Error(
        `Failed to aggregate weather records: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
