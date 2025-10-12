import { ProfileAchievement } from "@/modules/social/gamification/domain/entities/ProfileAchievement";

export abstract class ProfileAchievementRepository {
  abstract add(entry: ProfileAchievement): Promise<void>;
  abstract findByProfile(profileId: number): Promise<ProfileAchievement[]>;
  abstract exists(profileId: number, achievementId: number): Promise<boolean>;
}
