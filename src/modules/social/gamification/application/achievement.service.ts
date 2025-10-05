import { Inject, Injectable } from "@nestjs/common";
import { Achievement } from "@/modules/social/gamification/domain/entities/Achievement";
import { AchievementsRepository } from "../domain/interfaces/repositories/achievements-repository";
import { PaginatedResponse } from "@/modules/shared/domain/protocols/pagination-response";

@Injectable()
export class AchievementService {
  constructor(
    @Inject(AchievementsRepository)
    private readonly achievementRepo: AchievementsRepository
  ) {}

  async findById(id: number): Promise<Achievement | null> {
    return this.achievementRepo.findById(id);
  }

  async listPaginated(dto: {
    page: number;
    limit: number;
  }): Promise<PaginatedResponse<Achievement>> {
    const { limit, page } = dto;

    const offset = limit * (page - 1);
    const { records, count: total } = await this.achievementRepo.listAll({
      limit,
      offset,
    });

    return new PaginatedResponse(records, total, limit, page, {});
  }
}
