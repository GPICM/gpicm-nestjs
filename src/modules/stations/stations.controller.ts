import { Controller, Get, UseInterceptors } from "@nestjs/common";
import { StationsRepository } from "./interfaces/stations-repository";
import { CacheInterceptor } from "@nestjs/cache-manager";

@Controller("stations")
export class StationController {
  constructor(private readonly stationRepository: StationsRepository) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  async finalAll(): Promise<any> {
    const stations = await this.stationRepository.listAll();
    return stations;
  }
}
