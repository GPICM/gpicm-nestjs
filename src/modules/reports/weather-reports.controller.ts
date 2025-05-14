import {
  Controller,
  Get,
  Inject,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { MongoDbWeatherRecordsRepository } from "./infra/repositories/mongodb/mongodb-weather-records-repository";
import { MongoDbDailyMetricsRepository } from "./infra/repositories/mongodb/mongodb-daily-metrics-repository";
import { JwtAuthGuard } from "@/modules/identity/presentation/meta";
import { WeatherMetricsRequestQuery } from "./dtos/weather-reports-metrics-request";
import { MongoDbStationDailyMetricsRepository } from "./infra/repositories/mongodb/mongodb-stations-daily-metrics-repository";

@Controller("weather")
@UseGuards(JwtAuthGuard)
export class WeatherReportsController {
  constructor(
    @Inject(MongoDbWeatherRecordsRepository)
    private readonly mongoDbWeatherRecordsRepository: MongoDbWeatherRecordsRepository,
    @Inject(MongoDbDailyMetricsRepository)
    private readonly mongoDbDailyMetricsRepository: MongoDbDailyMetricsRepository,
    @Inject(MongoDbStationDailyMetricsRepository)
    private readonly mongoDbStationDailyMetricsRepository: MongoDbStationDailyMetricsRepository
  ) {}

  @Get("/metrics")
  @UseInterceptors(CacheInterceptor)
  async findLatestGlobalMetrics(): Promise<any> {
    return this.mongoDbDailyMetricsRepository.getLatest();
  }

  @Get("/metrics/rain")
  @UseInterceptors(CacheInterceptor)
  async getRainMetrics(
    @Query() query: WeatherMetricsRequestQuery
  ): Promise<any> {
    const { startDate, endDate, stationSlugs } = query;

    return this.mongoDbWeatherRecordsRepository.getAggregatedRainMetrics(
      startDate,
      endDate,
      { stationSlugs }
    );
  }

  @Get("/metrics/rain/insights")
  @UseInterceptors(CacheInterceptor)
  async getRainMetricsInsights(): Promise<any> {
    return this.mongoDbStationDailyMetricsRepository.getRainInsights(
      new Date().toISOString()
    );
  }

  @Get("/metrics/temperature/insights")
  @UseInterceptors(CacheInterceptor)
  async getTemperatureMetricsInsights(): Promise<any> {
    return this.mongoDbStationDailyMetricsRepository.getTemperatureInsights(
      new Date().toISOString()
    );
  }
}
