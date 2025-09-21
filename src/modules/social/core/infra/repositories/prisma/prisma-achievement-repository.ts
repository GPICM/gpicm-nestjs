import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { Achievement } from "../../../domain/entities/Achievement";
import { AchievementsRepository } from "../../../domain/interfaces/repositories/achievements-repository";

@Injectable()
export class PrismaAchievementRepository implements AchievementsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async add(achievement: Achievement): Promise<void> {
    await this.prisma.achievement.create({
      data: {
        name: achievement.name,
        image: achievement.image,
        description: achievement.description,
        criteria: achievement.criteria,
      },
    });
  }

  findByFields(fields: Partial<Achievement>): Promise<Achievement[]> {
    return this.prisma.achievement
      .findMany({
        where: {
          ...fields,
          criteria: fields.criteria ? { equals: fields.criteria } : undefined,
        },
      })
      .then((results) =>
        results.map(
          (ach) =>
            new Achievement({
              ...ach,
              image: ach.image ?? "",
              criteria: Array.isArray(ach.criteria) ? ach.criteria : [],
            })
        )
      );
  }

  async findById(id: number): Promise<Achievement | null> {
    const found = await this.prisma.achievement.findUnique({ where: { id } });
    if (!found) return null;
    return new Achievement({
      ...found,
      image: found.image ?? "",
      criteria: Array.isArray(found.criteria) ? found.criteria : [],
    });
  }

  async listAll(filters?: {
    limit?: number;
    offset?: number;
  }): Promise<Achievement[]> {
    const { limit, offset } = filters || {};
    const achievements = await this.prisma.achievement.findMany({
      take: limit,
      skip: offset,
    });
    return achievements.map(
      (ach) =>
        new Achievement({
          ...ach,
          image: ach.image ?? "",
          criteria: Array.isArray(ach.criteria) ? ach.criteria : [],
        })
    );
  }
  async update(achievement: Achievement): Promise<void> {
    await this.prisma.achievement.update({
      where: { id: achievement.id },
      data: {
        name: achievement.name,
        description: achievement.description,
        image: achievement.image,
        criteria: achievement.criteria,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.achievement.delete({ where: { id } });
  }

  async findByProfileId(profileId: number): Promise<Achievement[]> {
    const achievements = await this.prisma.profileAchievement.findMany({
      where: { profileId },
      include: { Achievement: true },
    });
    return achievements.map(
      (pa) =>
        new Achievement({
          ...pa.Achievement,
          image: pa.Achievement.image ?? "",
          criteria: Array.isArray(pa.Achievement.criteria)
            ? pa.Achievement.criteria
            : [],
        })
    );
  }
}
