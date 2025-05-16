import { Module } from "@nestjs/common";
import { WeatherReportsController } from "./weather-reports.controller";
import { MongoDbWeatherRecordsRepository } from "./infra/repositories/mongodb/mongodb-weather-records-repository";
import { MongoDbDailyMetricsRepository } from "./infra/repositories/mongodb/mongodb-daily-metrics-repository";
import { WeatherTimeSeriesMetricsController } from "./weather-time-series-metrics.controller";
import { MongoDbStationDailyMetricsRepository } from "./infra/repositories/mongodb/mongodb-stations-daily-metrics-repository";
import { PartnerMetricsController } from "./partner-metrics.controller";
import { MongoDbDailyRankingsRepository } from "./infra/repositories/mongodb/mongodb-daily-rankings-repository";

@Module({
  controllers: [
    WeatherReportsController,
    WeatherTimeSeriesMetricsController,
    PartnerMetricsController,
  ],
  providers: [
    MongoDbDailyMetricsRepository,
    MongoDbDailyRankingsRepository,
    MongoDbWeatherRecordsRepository,
    MongoDbStationDailyMetricsRepository,
  ],
  imports: [],
})
export class ReportsModule {}
