import { Prisma } from "@prisma/client";
import { ProfileAchievement } from "@/modules/social/gamification/domain/entities/ProfileAchievement";
import { Logger } from "@nestjs/common";
import { AchievementCriterion } from "../../../domain/value-objects/AchievementCriterion";
import { AchievementReward } from "../../../domain/value-objects/AchievementReward";

export const profileAchievementInclude =
  Prisma.validator<Prisma.ProfileAchievementInclude>()({
    Achievement: true,
  });

type ProfileAchievementJoinModel = Prisma.ProfileAchievementGetPayload<{
  include: typeof profileAchievementInclude;
}>;

export class PrismaProfileAchievementAssembler {
  private static readonly logger = new Logger(
    PrismaProfileAchievementAssembler.name
  );

  public static fromPrisma(
    prismaData?: ProfileAchievementJoinModel | null
  ): ProfileAchievement | null {
    if (!prismaData) {
      this.logger.warn("fromPrisma called with null or undefined data");
      return null;
    }

    this.logger.log(
      `Parsing ProfileAchievement from Prisma (id: ${prismaData.id}, profileId: ${prismaData.profileId}, achievementId: ${prismaData.achievementId})`
    );

    /* Load criteria */
    const criteriaSnapshot: AchievementCriterion[] = [];
    if (
      Array.isArray(prismaData.criteriaSnapshot) &&
      prismaData.criteriaSnapshot?.length
    ) {
      for (const criteriaNode of prismaData.criteriaSnapshot) {
        const parsedCriteria = AchievementCriterion.fromJSON(
          criteriaNode as Record<string, unknown> | null
        );
        if (parsedCriteria) {
          criteriaSnapshot.push(parsedCriteria);
        }
      }
    }

    /* Load rewards */
    const rewardsSnapshot: AchievementReward[] = [];
    if (
      Array.isArray(prismaData.rewardsSnapshot) &&
      prismaData.rewardsSnapshot?.length
    ) {
      for (const rewardsNode of prismaData.rewardsSnapshot) {
        const parsedReward = AchievementReward.fromJSON(
          rewardsNode as Record<string, unknown> | null
        );
        if (parsedReward) {
          rewardsSnapshot.push(parsedReward);
        }
      }
    }

    try {
      const entity = new ProfileAchievement({
        id: prismaData.id,
        handle: prismaData.handle,
        profileId: prismaData.profileId,
        achievementId: prismaData.achievementId,
        criteriaSnapshot,
        rewardsSnapshot,
        createdAt: prismaData.createdAt,
        name: prismaData.Achievement.name,
        description: prismaData.Achievement.description,
        imageThumbnailUrl: prismaData.Achievement.imageThumbnailUrl,
      });

      return entity;
    } catch (error: unknown) {
      this.logger.error("Failed to construct ProfileAchievement entity", {
        id: prismaData.id,
        error,
      });
      return null;
    }
  }

  /**
   * Convert domain entity to Prisma create input
   */
  public static toPrismaCreateInput(
    profileAchievement: ProfileAchievement
  ): Prisma.ProfileAchievementCreateInput {
    return {
      Achievement: {
        connect: { id: profileAchievement.achievementId },
      },
      Profile: {
        connect: { id: profileAchievement.profileId },
      },
      handle: profileAchievement.handle,
      criteriaSnapshot: profileAchievement.criteriaSnapshot,
      rewardsSnapshot: profileAchievement.rewardsSnapshot as unknown as
        | Prisma.JsonArray
        | Prisma.InputJsonValue,
    };
  }
}
