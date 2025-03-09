import { Transform } from "class-transformer";
import { IsDate } from "class-validator";

export class WeatherTimeSeriesMetricsRequestQuery {
  @IsDate({ message: "Data inválida" })
  @Transform((p) => (p.value === "" ? undefined : new Date(p.value)))
  startDate: Date;

  @IsDate({ message: "Data inválida" })
  @Transform((p) => (p.value === "" ? undefined : new Date(p.value)))
  endDate: Date;
}
