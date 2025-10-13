import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { AchievementReward } from "../value-objects/AchievementReward";
import { AchievementCriterion } from "../value-objects/AchievementCriterion";
import { Achievement } from "./Achievement";

export class ProfileAchievement {
  public id: number;
  public handle: string;
  public profileId: number;
  public achievementId: number;
  public criteriaSnapshot: AchievementCriterion[];
  public rewardsSnapshot: AchievementReward[];
  public createdAt: Date;

  // Virtual
  name: string;
  description: string;
  imageThumbnailUrl: string | null;

  constructor(args: NonFunctionProperties<ProfileAchievement>) {
    Object.assign(this, args);
  }

  /**
   * Factory method to create a ProfileAchievement from an Achievement and profileId
   */
  public static fromAchievement(
    achievement: Achievement,
    profileId: number
  ): ProfileAchievement {
    return new ProfileAchievement({
      id: -1, // will be set by DB
      profileId,
      name: achievement.name,
      description: achievement.description,
      imageThumbnailUrl: achievement.imageThumbnailUrl,
      achievementId: achievement.id,
      handle: `${profileId}-${achievement.id}-${Date.now()}`,
      criteriaSnapshot: achievement.criteria ?? [],
      rewardsSnapshot: achievement.rewards ?? [],
      createdAt: new Date(),
    });
  }
}
