import { Transform } from "class-transformer";
import { IsDate, IsString } from "class-validator";

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

export class WeatherReportMetricsByStationRequestQuery {
  @IsDate({ message: "Data inválida" })
  @Transform((p) => (p.value === "" ? undefined : new Date(p.value)))
  startDate: Date;

  @IsDate({ message: "Data inválida" })
  @Transform((p) => (p.value === "" ? undefined : new Date(p.value)))
  endDate: Date;
}
