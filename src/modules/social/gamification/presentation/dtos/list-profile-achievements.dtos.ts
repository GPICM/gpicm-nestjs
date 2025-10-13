import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class ListProfileAchievementsQueryDto {
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
}
