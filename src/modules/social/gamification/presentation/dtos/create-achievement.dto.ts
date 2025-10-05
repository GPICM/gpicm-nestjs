/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Type } from "class-transformer";
import {
  IsInt,
  IsEnum,
  IsArray,
  IsNumber,
  IsString,
  IsNotEmpty,
  ValidateNested,
  ArrayMinSize,
} from "class-validator";
import {
  CreateAchievementCriterionDto,
  CreateAchievementUseCaseDto,
} from "../../application/create-achievement-usecase";
import {
  AchievementOperator,
  AchievementCriterionType,
} from "../../domain/value-objects/AchievementCriterion";

export class CreateAchievementCriterionBodyDto
  implements CreateAchievementCriterionDto
{
  @IsNumber()
  @IsInt()
  @Type(() => Number)
  value: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(AchievementOperator)
  operator: AchievementOperator;

  @IsString()
  @IsNotEmpty()
  @IsEnum(AchievementCriterionType)
  type: AchievementCriterionType;
}

export class CreateAchievementBodyDto implements CreateAchievementUseCaseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Type(() => Number)
  reputationReward: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateAchievementCriterionBodyDto)
  criteria: CreateAchievementCriterionBodyDto[];
}
