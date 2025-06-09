import {
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { StationsRepository } from "./interfaces/stations-repository";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { JwtAuthGuard } from "@/modules/identity/presentation/meta";

@Controller("stations")
@UseGuards(JwtAuthGuard)
export class StationController {
  constructor(private readonly stationRepository: StationsRepository) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  async findAll(): Promise<any> {
    const stations = await this.stationRepository.listAll();
    return stations;
  }
}
