import {
  Controller,
  Get,
  Inject,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { MongoDbWeatherRecordsRepository } from "./infra/repositories/mongodb/mongodb-weather-records-repository";
import { WeatherReportMetricsRequestQuery } from "./dtos/weather-reports-metrics-request";

@Controller("weather/reports")
export class WeatherReportsController {
  constructor(
    @Inject(MongoDbWeatherRecordsRepository)
    private readonly mongoDbWeatherRecordsRepository: MongoDbWeatherRecordsRepository
  ) {}

  @Get("/metrics")
  @UseInterceptors(CacheInterceptor)
  async findMetricByStations(
    @Query() query: WeatherReportMetricsRequestQuery
  ): Promise<any> {
    const { stationSlug, endDate: _endDate, startDate: _startDate } = query;

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
