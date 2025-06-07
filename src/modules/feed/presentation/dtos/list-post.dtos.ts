import { Transform, Type } from "class-transformer";
import { IsDate, IsInt, IsOptional, IsString, Min } from "class-validator";

export class ListPostQueryDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  readonly page: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform((p) => (p.value === "" ? 16 : Number(p.value)))
  readonly limit: number = 16;

  @IsString()
  @IsOptional()
  readonly search: string = "";

  @IsDate({ message: "Invalid Date" })
  @IsOptional()
  @Transform((p) => (p.value === "" ? undefined : new Date(p.value)))
  startDate?: Date;

  @IsDate({ message: "Invalid Date" })
  @IsOptional()
  @Transform((p) => (p.value === "" ? undefined : new Date(p.value)))
  endDate?: Date;
}
