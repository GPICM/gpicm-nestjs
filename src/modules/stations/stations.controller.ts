/* eslint-disable prettier/prettier */
import { Controller, Get, Param, UseGuards, UseInterceptors } from "@nestjs/common";
import { StationsRepository } from "./interfaces/stations-repository";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { JwtAuthGuard } from "@/modules/identity/presentation/meta";

@Controller("stations")
@UseGuards(JwtAuthGuard)
export class StationController {
  constructor(private readonly stationRepository: StationsRepository) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  async finalAll(): Promise<any> {
    const stations = await this.stationRepository.listAll();
    return stations;
  }

  @Get(":slug")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(CacheInterceptor)
  async findOne(@Param("slug") slug: string): Promise<any> {
    const stations = await this.stationRepository.findBySlug(slug);
    return stations;
  }

}
