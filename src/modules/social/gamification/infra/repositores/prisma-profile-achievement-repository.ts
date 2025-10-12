import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";

import { PrismaProfileAchievementAssembler } from "./mappers/prisma-profile-achievement.assembler";
import { ProfileAchievementRepository } from "../../domain/interfaces/repositories/profile-achievements-repository";
import { ProfileAchievement } from "../../domain/entities/ProfileAchievement";

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
}
