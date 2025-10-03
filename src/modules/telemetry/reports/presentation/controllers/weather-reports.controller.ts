import {
  Controller,
  Get,
  Inject,
  Logger,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { MongoDbWeatherRecordsRepository } from "../../infra/repositories/mongodb/mongodb-weather-records-repository";
import { MongoDbDailyMetricsRepository } from "../../infra/repositories/mongodb/mongodb-daily-metrics-repository";
import { JwtAuthGuard } from "@/modules/identity/auth/presentation/meta";
import { WeatherMetricsRequestQuery } from "../dtos/weather-reports-metrics-request";
import { MongoDbStationDailyMetricsRepository } from "../../infra/repositories/mongodb/mongodb-stations-daily-metrics-repository";
import { MongoDbDailyRankingsRepository } from "../../infra/repositories/mongodb/mongodb-daily-rankings-repository";
import { MongoDbStationDailyPrecipitationMetricsRepository } from "../../infra/repositories/mongodb/mongodb-stations-daily-precipitation-metrics-repository";

@Controller("weather")
@UseGuards(JwtAuthGuard)
export class WeatherReportsController {
  private readonly logger = new Logger(WeatherReportsController.name);
  constructor(
    @Inject(MongoDbWeatherRecordsRepository)
    private readonly mongoDbWeatherRecordsRepository: MongoDbWeatherRecordsRepository,
    @Inject(MongoDbDailyMetricsRepository)
    private readonly mongoDbDailyMetricsRepository: MongoDbDailyMetricsRepository,
    @Inject(MongoDbDailyRankingsRepository)
    private readonly mongoDbDailyRankingsRepository: MongoDbDailyRankingsRepository,
    @Inject(MongoDbStationDailyMetricsRepository)
    private readonly mongoDbStationDailyMetricsRepository: MongoDbStationDailyMetricsRepository,
    @Inject(MongoDbStationDailyPrecipitationMetricsRepository)
    private readonly stationDailyPrecipitationMetricsRepository: MongoDbStationDailyPrecipitationMetricsRepository
  ) {}

  @Get("/metrics")
  @UseInterceptors(CacheInterceptor)
  async findLatestGlobalMetrics(): Promise<any> {
    return this.mongoDbDailyMetricsRepository.getLatest();
  }

  @Get("/metrics/region/:region")
  @UseInterceptors(CacheInterceptor)
  async findLatestRegionMetrics(): Promise<any> {
    return this.mongoDbDailyMetricsRepository.getLatest();
  }

  @Get("/metrics/region/:region/rankings")
  @UseInterceptors(CacheInterceptor)
  async findLatestRegionRankingMetrics(): Promise<any> {
    return this.mongoDbDailyRankingsRepository.getLatest();
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
    this.logger.log("Getting rain insights");
    return this.stationDailyPrecipitationMetricsRepository.getRainInsights(
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
