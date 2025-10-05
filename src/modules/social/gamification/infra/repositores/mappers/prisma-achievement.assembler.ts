import { Prisma } from "@prisma/client";
import { Achievement } from "@/modules/social/gamification/domain/entities/Achievement";
import { MediaSource } from "@/modules/assets/domain/object-values/media-source";
import { MediaSourceVariantKey } from "@/modules/assets/domain/object-values/media-source-variant";
import { AchievementCriterion } from "@/modules/social/gamification/domain/value-objects/AchievementCriterion";
import { AchievementReward } from "@/modules/social/gamification/domain/value-objects/AchievementReward";

export const achievementInclude = Prisma.validator<Prisma.AchievementInclude>()(
  {}
);

type AchievementJoinModel = Prisma.AchievementGetPayload<{
  include: typeof achievementInclude;
}>;

export class PrismaAchievementAssembler {
  public static fromPrisma(
    prismaData?: AchievementJoinModel | null
  ): Achievement | null {
    if (!prismaData) return null;

    /* Load Image source */
    let imageThumbnailUrl = "";
    const imageSources = MediaSource.fromJSON(
      prismaData.imageSources as Record<string, unknown> | null
    );

    if (imageSources) {
      imageThumbnailUrl =
        imageSources?.getVariant(MediaSourceVariantKey.sm)?.url || "";
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

    return new Achievement({
      id: prismaData.id,
      name: prismaData.name,
      description: prismaData.description,
      imageThumbnailUrl,
      imageBlurHash: null,
      imageSources,
      criteria,
      rewards,
    });
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
