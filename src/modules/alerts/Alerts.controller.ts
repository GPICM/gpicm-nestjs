import {
  Controller,
  Get,
} from "@nestjs/common";
import { CivilDefenseAlertsRepository } from "./domain/interfaces/alerts-repository";

@Controller("alerts")
export class CivilDefenseAlertsController {
  constructor(private readonly civilDefenseAlertsRepository: CivilDefenseAlertsRepository ) {}

  @Get()
  async findAll(){
    const civilDefenseAlerts = await this.civilDefenseAlertsRepository.listAll();
    return civilDefenseAlerts;
  }



}
