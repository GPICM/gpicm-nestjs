import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsUrl,
  IsOptional,
} from "class-validator";
import { Type } from "class-transformer";

class AchievementCriteriaDto {
  @IsString()
  @IsNotEmpty()
  field: string;

  @IsString()
  @IsNotEmpty()
  operador: string;

  @IsNotEmpty()
  value: any;
}

export class CreateAchievementDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AchievementCriteriaDto)
  criteria: AchievementCriteriaDto[];

  @IsString()
  @IsUrl()
  @IsOptional()
  iconUrl?: string;
}
