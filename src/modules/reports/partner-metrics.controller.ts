import {
  Controller,
  Get,
  Inject,
  Param,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { MongoDbStationDailyMetricsRepository } from "./infra/repositories/mongodb/mongodb-stations-daily-metrics-repository";
import { PartnerApiKeyGuard } from "../identity/presentation/meta/guards/partner-api-key.guard";
import { Throttle } from "@nestjs/throttler";

@Controller("partners/metrics")
@UseGuards(PartnerApiKeyGuard)
export class PartnerMetricsController {
  constructor(
    @Inject(MongoDbStationDailyMetricsRepository)
    private readonly mongoDbStationDailyMetricsRepository: MongoDbStationDailyMetricsRepository
  ) {}

  @Get("/:stationSlug")
  @UseInterceptors(CacheInterceptor)
  @Throttle({ default: { limit: 6, ttl: 60000 } })
  findMetricsByStations(@Param("stationSlug") stationSlug: string): any {
    const nowStr = new Date().toISOString();
    return this.mongoDbStationDailyMetricsRepository.getLatestMetricsByStation(
      stationSlug,
      nowStr
    );
  }
}
