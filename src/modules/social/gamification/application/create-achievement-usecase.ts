import { Injectable } from "@nestjs/common";
import {
  AchievementCriterion,
  AchievementCriterionType,
  AchievementOperator,
} from "../domain/value-objects/AchievementCriterion";
import { AchievementReward } from "../domain/value-objects/AchievementReward";
import { Achievement } from "../domain/entities/Achievement";
import { AchievementsRepository } from "../domain/interfaces/repositories/achievements-repository";
import { MediaService } from "@/modules/assets/application/media.service";
import { error } from "console";
import { MediaSourceVariantKey } from "@/modules/assets/domain/object-values/media-source-variant";

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
  mediaId: string;
}

@Injectable()
export class CreateAchievementUseCase {
  constructor(
    private readonly repository: AchievementsRepository,
    private readonly mediaService: MediaService
  ) {}

  async execute(dto: CreateAchievementUseCaseDto): Promise<Achievement> {
  
    const media = await this.mediaService.findOneById(dto.mediaId);
    if(!media){
      throw new Error('Media not found')
    }    

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
      imageSources: media.sources,
      imageThumbnailUrl: media.sources?.getVariant(MediaSourceVariantKey.md)?.url ?? '',
      imageBlurHash: null,
    });

    await this.repository.add(newAchievement);

    return newAchievement;
  }
}
