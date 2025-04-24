/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Transform } from "class-transformer";
import { IsArray, IsDate, IsString } from "class-validator";

export class WeatherReportMetricsRequestQuery {
  @IsString()
  stationSlug: string;

  @IsDate({ message: "Data inválida" })
  @Transform((p) => (p.value === "" ? undefined : new Date(p.value)))
  startDate: Date;

  @IsDate({ message: "Data inválida" })
  @Transform((p) => (p.value === "" ? undefined : new Date(p.value)))
  endDate: Date;
}

export class WeatherMetricsRequestQuery {
  @IsDate({ message: "Data inválida" })
  @Transform((p) => (p.value === "" ? undefined : new Date(p.value)))
  startDate: Date;

  @IsDate({ message: "Data inválida" })
  @Transform((p) => (p.value === "" ? undefined : new Date(p.value)))
  endDate: Date;

  @IsArray()
  @IsString({ each: true })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(",")))
  readonly stationSlugs: string[] = [];
}
