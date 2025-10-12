import { Inject, Injectable } from "@nestjs/common";
import { AchievementsRepository } from "../domain/interfaces/repositories/achievements-repository";
import { AchievementCriterionType } from "../domain/value-objects/AchievementCriterion";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { ProfileAchievementRepository } from "../domain/interfaces/repositories/profile-achievements-repository";
import { ProfileAchievement } from "../domain/entities/ProfileAchievement";
import { ProfileRepository } from "../../core/domain/interfaces/repositories/profile-repository";

@Injectable()
export class AchievementEngine {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService,

    @Inject(ProfileRepository)
    private readonly profileRepository: ProfileRepository,
    @Inject(AchievementsRepository)
    private readonly achievementRepo: AchievementsRepository,
    @Inject(ProfileAchievementRepository)
    private readonly profileAchievementRepo: ProfileAchievementRepository
  ) {}

  async execute(profileId: number): Promise<boolean> {
    const { records: achievements } = await this.achievementRepo.listAll({
      notInProfile: profileId,
      limit: 1000,
      offset: 0,
    });

    const profile = await this.profileRepository.findById(profileId);
    if (!profile) {
      return false;
    }

    const eligibleAchievements = achievements.filter((a) => {
      if (!a.criteria) return false;

      const { criteria } = a;

      return criteria.every((criterion) => {
        let valueToCheck = 0;

        switch (criterion.type) {
          case AchievementCriterionType.FOLLOWERS:
            valueToCheck = profile.followersCount;
            break;
          case AchievementCriterionType.POSTS_COUNT:
            valueToCheck = profile.postsCount;
            break;
          case AchievementCriterionType.COMMENTS_COUNT:
            valueToCheck = profile.commentsCount;
            break;
        }

        return criterion.matches(valueToCheck);
      });
    });

    if (eligibleAchievements.length === 0) return false;

    // Use async transaction correctly
    await this.prismaService.openTransaction(async (tx) => {
      for (const achievement of eligibleAchievements) {
        // Check again to prevent duplicates (just in case)
        const alreadyExists = await this.profileAchievementRepo.exists(
          profile.id,
          achievement.id
        );
        if (alreadyExists) continue;

        const profileAchievement = ProfileAchievement.fromAchievement(
          achievement,
          profile.id
        );

        await this.profileAchievementRepo.add(profileAchievement, {
          txContext: tx,
        });
      }
    });

    return true;
  }
}
