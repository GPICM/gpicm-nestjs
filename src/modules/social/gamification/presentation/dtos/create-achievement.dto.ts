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
  type: AchievementCriterionType;

  @IsNumber()
  @IsInt()
  @Type(() => Number)
  value: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(AchievementOperator)
  operator: AchievementOperator;
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
  @ValidateNested({ each: true })
  @Type(() => CreateAchievementCriterionBodyDto)
  criteria: CreateAchievementCriterionBodyDto[];
}
