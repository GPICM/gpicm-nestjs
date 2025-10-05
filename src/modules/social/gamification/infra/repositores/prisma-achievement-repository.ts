import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { Achievement } from "../../domain/entities/Achievement";
import {
  AchievementsFindManyFilters,
  AchievementsRepository,
} from "../../domain/interfaces/repositories/achievements-repository";
import { PrismaAchievementAssembler } from "./mappers/prisma-achievement.assembler";
import { BaseRepositoryFindManyResult } from "@/modules/social/core/domain/interfaces";

@Injectable()
export class PrismaAchievementRepository implements AchievementsRepository {
  private readonly logger = new Logger(PrismaAchievementRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async add(achievement: Achievement): Promise<void> {
    try {
      const data = PrismaAchievementAssembler.toPrismaCreateInput(achievement);
      const created = await this.prisma.achievement.create({ data });

      achievement.setId(created.id);
    } catch (error: unknown) {
      this.logger.error("Failed to add achievement", { error, achievement });
      throw error;
    }
  }

  async findById(id: number): Promise<Achievement | null> {
    try {
      const data = await this.prisma.achievement.findUnique({ where: { id } });
      if (!data) return null;

      try {
        return PrismaAchievementAssembler.fromPrisma(data);
      } catch (parseError: unknown) {
        this.logger.error(`Failed to parse achievement with id ${id}`, {
          parseError,
          data,
        });
        return null;
      }
    } catch (error: unknown) {
      this.logger.error(`Failed to find achievement by id ${id}`, { error });
      throw error;
    }
  }

  async listAll(
    filters?: AchievementsFindManyFilters
  ): Promise<BaseRepositoryFindManyResult<Achievement>> {
    try {
      this.logger.log("Listing all achievements");
      const { limit, offset } = filters || {};

      const [count, data] = await Promise.all([
        this.prisma.achievement.count({
          take: limit,
          skip: offset,
        }),
        this.prisma.achievement.findMany({
          take: limit,
          skip: offset,
        }),
      ]);

      const records: Achievement[] = [];
      if (data.length) {
        for (const ach of data) {
          try {
            this.logger.log("Parsing achievement", { ach });
            const parsed = PrismaAchievementAssembler.fromPrisma(ach);
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
