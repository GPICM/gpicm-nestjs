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

@Controller("partners/metrics")
@UseGuards(PartnerApiKeyGuard)
export class PartnerMetricsController {
  constructor(
    @Inject(MongoDbStationDailyMetricsRepository)
    private readonly mongoDbStationDailyMetricsRepository: MongoDbStationDailyMetricsRepository
  ) {}

  @Get("/:stationSlug")
  @UseInterceptors(CacheInterceptor)
  findMetricsByStations(@Param("stationSlug") stationSlug: string): any {
    const nowStr = new Date().toISOString();
    return this.mongoDbStationDailyMetricsRepository.getLatestMetricsByStation(
      stationSlug,
      nowStr
    );
  }
}
