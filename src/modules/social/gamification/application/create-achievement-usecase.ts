import { Injectable } from "@nestjs/common";
import {
  AchievementCriterion,
  AchievementCriterionType,
  AchievementOperator,
} from "../domain/value-objects/AchievementCriterion";
import {
  AchievementReward,
  ReputationReward,
} from "../domain/value-objects/AchievementReward";
import { Achievement } from "../domain/entities/Achievement";
import { AchievementsRepository } from "../domain/interfaces/repositories/achievements-repository";

export interface CreateAchievementCriterionDto {
  operator: AchievementOperator;
  type: AchievementCriterionType;
  value: number;
  description?: string;
}

export interface CreateAchievementUseCaseDto {
  name: string;
  description: string;
  reputationReward: number;
  criteria: CreateAchievementCriterionDto[];
}

@Injectable()
export class CreateAchievementUseCase {
  constructor(private readonly repository: AchievementsRepository) {}

  async execute(dto: CreateAchievementUseCaseDto): Promise<Achievement> {
    const criteria = dto.criteria.map((crt) => {
      return new AchievementCriterion({
        operator: crt.operator,
        type: crt.type,
        value: crt.value,
        description: crt.description,
      });
    });

    const rewards: Array<AchievementReward> = [
      new AchievementReward({
        amount: dto.reputationReward,
        type: "REPUTATION",
      }),
    ];

    const newAchievement = new Achievement({
      id: -1,
      name: dto.name,
      description: dto.description,
      criteria,
      rewards,
      imageSources: null,
      imageThumbnailUrl: null,
      imageBlurHash: null,
    });

    await this.repository.add(newAchievement);

    return newAchievement;
  }
}
