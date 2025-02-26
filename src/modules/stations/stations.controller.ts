/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get } from "@nestjs/common";
import { StationsRepository } from "./interfaces/stations-repository";

@Controller("stations")
export class StationController {
  constructor(private readonly stationRepository: StationsRepository) {}

  @Get()
  async getHello(): Promise<any> {
    const stations = await this.stationRepository.listAll();
    return stations;
  }
}
