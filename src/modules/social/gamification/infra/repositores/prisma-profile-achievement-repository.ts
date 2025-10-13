import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";

import { PrismaProfileAchievementAssembler } from "./mappers/prisma-profile-achievement.assembler";
import {
  AchievementsFindManyFilters,
  ProfileAchievementRepository,
} from "../../domain/interfaces/repositories/profile-achievements-repository";
import { ProfileAchievement } from "../../domain/entities/ProfileAchievement";
import { BaseRepositoryFindManyResult } from "@/modules/social/core/domain/interfaces";
import { Prisma } from "@prisma/client";

@Injectable()
export class PrismaProfileAchievementRepository
  implements ProfileAchievementRepository
{
  private readonly logger = new Logger(PrismaProfileAchievementRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async add(entry: ProfileAchievement): Promise<void> {
    try {
      await this.prisma.profileAchievement.create({
        data: PrismaProfileAchievementAssembler.toPrismaCreateInput(entry),
      });
    } catch (error: unknown) {
      this.logger.error("Failed to add profile achievement", { error, entry });
      throw error;
    }
  }

  async findByProfile(profileId: number): Promise<ProfileAchievement[]> {
    try {
      const data = await this.prisma.profileAchievement.findMany({
        where: { profileId },
      });

      return (
        data
          // eslint-disable-next-line @typescript-eslint/unbound-method
          .map(PrismaProfileAchievementAssembler.fromPrisma)
          .filter((pa): pa is ProfileAchievement => pa !== null)
      );
    } catch (error: unknown) {
      this.logger.error(
        `Failed to fetch achievements for profile ${profileId}`,
        { error }
      );
      throw error;
    }
  }

  async exists(profileId: number, achievementId: number): Promise<boolean> {
    try {
      const count = await this.prisma.profileAchievement.count({
        where: { profileId, achievementId },
      });
      return count > 0;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to check existence of achievement ${achievementId} for profile ${profileId}`,
        { error }
      );
      throw error;
    }
  }

  public async listAll(
    filters?: AchievementsFindManyFilters
  ): Promise<BaseRepositoryFindManyResult<ProfileAchievement>> {
    try {
      this.logger.log("Listing all achievements");
      const { limit, offset, profileHandle } = filters || {};

      const where: Prisma.ProfileAchievementWhereInput = { };

      if (profileHandle) {
        where.Profile = {
          handle: profileHandle,
        };
      }

      const [count, data] = await Promise.all([
        this.prisma.profileAchievement.count({
          take: limit,
          skip: offset,
          where,
        }),
        this.prisma.profileAchievement.findMany({
          take: limit,
          skip: offset,
          where,
        }),
      ]);

      const records: ProfileAchievement[] = [];
      if (data.length) {
        for (const ach of data) {
          try {
            this.logger.log("Parsing profile achievement", { ach });
            const parsed = PrismaProfileAchievementAssembler.fromPrisma(ach);
            if (parsed) records.push(parsed);
          } catch (parseError: unknown) {
            this.logger.warn("Failed to parse individual achievement", {
              parseError,
              ach,
            });
            continue;
          }
        }
      }

      return { count, records };
    } catch (error: unknown) {
      this.logger.error("Failed to List all achievements", { error });
      throw error;
    }
  }
}
