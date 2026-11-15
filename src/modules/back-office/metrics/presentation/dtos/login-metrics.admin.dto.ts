import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export const LOGIN_METRICS_MIN_DAYS = 7;
export const LOGIN_METRICS_MAX_DAYS = 365;
export const LOGIN_METRICS_DEFAULT_DAYS = 30;

export class LoginMetricsAdminQueryDto {
  /** Tamanho do período da série diária, contando o dia de hoje. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(LOGIN_METRICS_MIN_DAYS)
  @Max(LOGIN_METRICS_MAX_DAYS)
  days?: number;
}
