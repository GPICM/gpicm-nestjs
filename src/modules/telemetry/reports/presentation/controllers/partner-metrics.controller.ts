import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { MongoDbStationDailyMetricsRepository } from "../../infra/repositories/mongodb/mongodb-stations-daily-metrics-repository";
import { PartnerApiKeyGuard } from "../../../../identity/auth/presentation/meta/guards/partner-api-key.guard";
import { Throttle } from "@nestjs/throttler";

@Controller("partners/observations")
@UseGuards(PartnerApiKeyGuard)
export class PartnerMetricsController {
  constructor(
    @Inject(MongoDbStationDailyMetricsRepository)
    private readonly mongoDbStationDailyMetricsRepository: MongoDbStationDailyMetricsRepository
  ) {}

  @Get("/:stationSlug")
  @UseInterceptors(CacheInterceptor)
  @Throttle({ default: { limit: 6, ttl: 60000 } })
  public async findMetricsByStations(
    @Param("stationSlug") stationSlug: string
  ): Promise<any> {
    const nowStr = new Date().toISOString();
    const metrics =
      await this.mongoDbStationDailyMetricsRepository.getLatestMetricsByStation(
        stationSlug,
        nowStr
      );

    if (!metrics) throw new NotFoundException();

    return metrics;
  }
}
