import {
  BaseRepositoryFindManyFilters,
  BaseRepositoryFindManyResult,
} from "@/modules/social/core/domain/interfaces/dto/base-repository-filters";
import { Achievement } from "@/modules/social/gamification/domain/entities/Achievement";

export interface AchievementsFindManyFilters
  extends BaseRepositoryFindManyFilters {
  profileId?: number;
}

export abstract class AchievementsRepository {
  abstract add(achievement: Achievement): Promise<void>;
  abstract findById(id: number): Promise<Achievement | null>;
  abstract listAll(
    filters?: AchievementsFindManyFilters
  ): Promise<BaseRepositoryFindManyResult<Achievement>>;
}
