import { Injectable } from "@nestjs/common";
import { PrismaAchievementRepository } from "@/modules/feed/infra/prisma-achievement-repository";
import { CreateAchievementDto } from "@/modules/feed/infra/dto/achievement.dto";
import { Achievement } from "@/modules/feed/domain/entities/Achievement";
import { JsonArray } from "@prisma/client/runtime/library";

@Injectable()
export class AchievementService {
  constructor(private readonly achievementRepo: PrismaAchievementRepository) {}

  async create(dto: CreateAchievementDto): Promise<void> {
    const achievement = new Achievement({
      id: undefined,
      name: dto.name,
      description: dto.description,
      criteria: JSON.parse(JSON.stringify(dto.criteria)) as JsonArray,
      image: dto.iconUrl ?? "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.achievementRepo.add(achievement);
  }

  async findById(id: number): Promise<Achievement | null> {
    return this.achievementRepo.findById(id);
  }

  async listAll(limit?: number, offset?: number): Promise<Achievement[]> {
    return this.achievementRepo.listAll({ limit, offset });
  }

  async update(id: number, dto: CreateAchievementDto): Promise<void> {
    const achievement = new Achievement({
      id,
      name: dto.name,
      description: dto.description,
      criteria: JSON.parse(JSON.stringify(dto.criteria)) as JsonArray,
      image: dto.iconUrl ?? "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.achievementRepo.update(achievement);
  }

  async delete(id: number): Promise<void> {
    await this.achievementRepo.delete(id);
  }
}
