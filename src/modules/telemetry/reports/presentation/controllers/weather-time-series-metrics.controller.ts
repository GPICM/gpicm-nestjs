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
import { MongoDbWeatherRecordsRepository } from "../../infra/repositories/mongodb/mongodb-weather-records-repository";
import { WeatherTimeSeriesMetricsRequestQuery } from "../dtos/weather-time-series-metrics-request";
import { JwtAuthGuard } from "@/modules/identity/presentation/meta";

@Controller("weather/time-series")
@UseGuards(JwtAuthGuard)
export class WeatherTimeSeriesMetricsController {
  constructor(
    @Inject(MongoDbWeatherRecordsRepository)
    private readonly mongoDbWeatherRecordsRepository: MongoDbWeatherRecordsRepository
  ) {}

  @Get("/metrics/stations/:stationSlug")
  @UseInterceptors(CacheInterceptor)
  async findMetricByStations(
    @Param("stationSlug") stationSlug: string,
    @Query() query: WeatherTimeSeriesMetricsRequestQuery
  ): Promise<any> {
    const { endDate, startDate } = query;

    return this.mongoDbWeatherRecordsRepository.getAggregatedTimesSeriesMetrics(
      stationSlug,
      {
        startDate,
        endDate,
      }
    );
  }
}
