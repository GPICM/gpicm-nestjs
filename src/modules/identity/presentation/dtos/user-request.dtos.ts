import { Type } from "class-transformer";
import { IsLatitude, IsLongitude } from "class-validator";

export class UpdateLocationDto {
  @IsLatitude()
  @Type(() => Number)
  latitude: number;

  @IsLongitude()
  @Type(() => Number)
  longitude: number;
}
