import { Prisma } from "@prisma/client";
import { Achievement } from "@/modules/social/gamification/domain/entities/Achievement";
import { MediaSource } from "@/modules/assets/domain/object-values/media-source";
import { MediaSourceVariantKey } from "@/modules/assets/domain/object-values/media-source-variant";
import { AchievementCriterion } from "@/modules/social/gamification/domain/value-objects/AchievementCriterion";
import { AchievementReward } from "@/modules/social/gamification/domain/value-objects/AchievementReward";
import { Logger } from "@nestjs/common";

export const achievementInclude = Prisma.validator<Prisma.AchievementInclude>()(
  {}
);

type AchievementJoinModel = Prisma.AchievementGetPayload<{
  include: typeof achievementInclude;
}>;

export class PrismaAchievementAssembler {
  private static readonly logger = new Logger(PrismaAchievementAssembler.name);

  public static fromPrisma(
    prismaData?: AchievementJoinModel | null
  ): Achievement | null {
    if (!prismaData) {
      this.logger.warn("fromPrisma called with null or undefined data");
      return null;
    }

    this.logger.log(
      `Parsing Achievement from Prisma (id: ${prismaData.id}, name: ${prismaData.name})`
    );

    /* Load Image source */
    let imageThumbnailUrl = "";
    let imageSources: MediaSource | null = null;

    try {
      imageSources = MediaSource.fromJSON(
        prismaData.imageSources as Record<string, unknown> | null
      );

      if (imageSources) {
        imageThumbnailUrl =
          imageSources?.getVariant(MediaSourceVariantKey.sm)?.url || "";
      }
    } catch (error: unknown) {
      this.logger.error("Failed to parse imageSources for achievement", {
        id: prismaData.id,
        error,
      });
    }

    /* Load criteria */
    const criteria: AchievementCriterion[] = [];
    if (Array.isArray(prismaData.criteria) && prismaData.criteria?.length) {
      for (const criteriaNode of prismaData.criteria) {
        const parsedCriteria = AchievementCriterion.fromJSON(
          criteriaNode as Record<string, unknown> | null
        );
        if (parsedCriteria) {
          criteria.push(parsedCriteria);
        }
      }
    }

    /* Load rewards */
    const rewards: AchievementReward[] = [];
    if (Array.isArray(prismaData.rewards) && prismaData.rewards?.length) {
      for (const rewardsNode of prismaData.rewards) {
        const parsedReward = AchievementReward.fromJSON(
          rewardsNode as Record<string, unknown> | null
        );
        if (parsedReward) {
          rewards.push(parsedReward);
        }
      }
    }

    try {
      const achievement = new Achievement({
        id: prismaData.id,
        name: prismaData.name,
        description: prismaData.description,
        imageThumbnailUrl,
        imageBlurHash: null,
        imageSources,
        criteria,
        rewards,
      });

      this.logger.log(`Successfully parsed achievement ${prismaData.id}`);
      return achievement;
    } catch (error: unknown) {
      this.logger.error("Failed to construct Achievement entity", {
        id: prismaData.id,
        error,
      });
      return null;
    }
  }

  public static toPrismaCreateInput(
    achievement: Achievement
  ): Prisma.AchievementCreateInput {
    return {
      isActive: true,
      name: achievement.name,
      criteria: achievement.criteria,
      description: achievement.description,
      imageSources: achievement.imageSources ?? undefined,
      imageThumbnailUrl: achievement.imageThumbnailUrl,
      imageBlurHash: achievement.imageBlurHash,
      rewards: (achievement.rewards ?? undefined) as unknown as
        | Prisma.NullableJsonNullValueInput
        | Prisma.InputJsonValue
        | undefined,
    };
  }
}
