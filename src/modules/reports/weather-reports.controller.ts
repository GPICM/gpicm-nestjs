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

  @Get("/metrics/rain")
  @UseInterceptors(CacheInterceptor)
  async getRainMetrics(
    @Query() query: WeatherMetricsRequestQuery
  ): Promise<any> {
    const { startDate, endDate } = query;
    return this.mongoDbWeatherRecordsRepository.getAggregatedRainMetrics(
      startDate,
      endDate
    );
  }
}
