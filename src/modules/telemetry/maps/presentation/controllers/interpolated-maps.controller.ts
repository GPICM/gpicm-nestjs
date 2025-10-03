/* eslint-disable prettier/prettier */
import { Controller, Get, Logger, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { JwtAuthGuard } from "@/modules/identity/auth/presentation/meta";
import { InterpolatedMapsRepository } from "../../domain/interfaces/interpolated-maps-repository";
import { FilterInterpolatedMapsRequestDto } from "../dtos/filter-interpolated-maps-request.dto";

@Controller("maps")
@UseGuards(JwtAuthGuard)
export class InterpolatedMapsController {

  private readonly logger: Logger = new Logger(
    InterpolatedMapsController.name
  );

  constructor(private readonly interpolatedMaps: InterpolatedMapsRepository) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  async findAll (@Query() query: FilterInterpolatedMapsRequestDto): Promise<any> {

    this.logger.log("InterpolatedMapsController -> findAll Started", { query });
    const result = await this.interpolatedMaps.findMany({
      endDate: query.endDate,
      startDate: query.startDate,
      field: query.field,
    });
    return result;
  }
}
