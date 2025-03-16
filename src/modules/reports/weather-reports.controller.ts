import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { MongoDbWeatherRecordsRepository } from "./infra/repositories/mongodb/mongodb-weather-records-repository";
import { WeatherReportMetricsByStationRequestQuery } from "./dtos/weather-reports-metrics-request";
import { MongoDbDailyMetricsRepository } from "./infra/repositories/mongodb/mongodb-daily-metrics-repository";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("weather")
@UseGuards(JwtAuthGuard)
export class WeatherReportsController {
  constructor(
    @Inject(MongoDbWeatherRecordsRepository)
    private readonly mongoDbWeatherRecordsRepository: MongoDbWeatherRecordsRepository,
    @Inject(MongoDbDailyMetricsRepository)
    private readonly mongoDbDailyMetricsRepository: MongoDbDailyMetricsRepository
  ) {}

  @Get("/metrics")
  @UseInterceptors(CacheInterceptor)
  async findLatestGlobalMetrics(): Promise<any> {
    return this.mongoDbDailyMetricsRepository.getLatest();
  }

  // @Get("/metrics/stations/:stationSlug")
  // @UseInterceptors(CacheInterceptor)
  async findMetricByStations(
    @Param("stationSlug") stationSlug: string,
    @Query() query: WeatherReportMetricsByStationRequestQuery
  ): Promise<any> {
    const { endDate: _endDate, startDate: _startDate } = query;

    const startDate = new Date(_startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(_endDate);
    endDate.setHours(23, 59, 59, 999);

    return this.mongoDbWeatherRecordsRepository.getAggregatedWeatherRecords(
      startDate,
      endDate,
      stationSlug
    );
  }
}
