/* eslint-disable prettier/prettier */
import { Controller, Get, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { JwtAuthGuard } from "@/modules/identity/presentation/meta";
import { InterpolatedMapsRepository } from "../../domain/interfaces/interpolated-maps-repository";
import { FilterInterpolatedMapsRequestDto } from "../dtos/filter-interpolated-maps-request.dto";

@Controller("maps")
@UseGuards(JwtAuthGuard)
export class InterpolatedMapsController {
  constructor(private readonly interpolatedMaps: InterpolatedMapsRepository) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  async finalAll(@Query() query: FilterInterpolatedMapsRequestDto): Promise<any> {
    const result = await this.interpolatedMaps.findMany({
      endDate: query.endDate,
      startDate: query.startDate,
      field: query.field,
    });
    return result;
  }
}
