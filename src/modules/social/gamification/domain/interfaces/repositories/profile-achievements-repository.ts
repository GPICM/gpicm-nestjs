import {
  BaseRepositoryFindManyFilters,
  BaseRepositoryFindManyResult,
} from "@/modules/social/core/domain/interfaces";
import { ProfileAchievement } from "@/modules/social/gamification/domain/entities/ProfileAchievement";

export interface AchievementsFindManyFilters
  extends BaseRepositoryFindManyFilters {
  profileHandle?: string;
}

export abstract class ProfileAchievementRepository {
  abstract add(
    entry: ProfileAchievement,
    options?: { txContext: unknown }
  ): Promise<void>;
  abstract findByProfile(profileId: number): Promise<ProfileAchievement[]>;
  abstract exists(profileId: number, achievementId: number): Promise<boolean>;

  abstract listAll(
    filters?: AchievementsFindManyFilters
  ): Promise<BaseRepositoryFindManyResult<ProfileAchievement>>;
}
