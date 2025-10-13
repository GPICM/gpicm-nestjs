import {
  Logger,
  UseGuards,
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  Inject,
} from "@nestjs/common";

import { JwtAuthGuard } from "@/modules/identity/auth/presentation/meta";
import { AdminGuard } from "@/modules/identity/auth/presentation/meta/guards/admin.guard";
import { ProfileRepository } from "../../core/domain/interfaces/repositories/profile-repository";
import { ListProfileAchievementsQueryDto } from "./dtos/list-profile-achievements.dtos";
import { ProfileAchievementRepository } from "../domain/interfaces/repositories/profile-achievements-repository";
import { PaginatedResponse } from "@/modules/shared/domain/protocols/pagination-response";

@Controller("/social/achievements")
@UseGuards(JwtAuthGuard, AdminGuard)
export class SocialGamificationController {
  private readonly logger = new Logger(SocialGamificationController.name);

  constructor(
    private readonly profileRepository: ProfileRepository,
    @Inject(ProfileAchievementRepository)
    private readonly profileAchievementRepository: ProfileAchievementRepository
  ) {}

  @Get("/profile/:handle")
  async listForProfile(
    @Param("handle") profileHandle: string,
    @Query() query: ListProfileAchievementsQueryDto
  ) {
    const author = await this.profileRepository.findByHandle(profileHandle);
    if (!author) throw new NotFoundException("Author not found");

    this.logger.log(`Fetching all posts by author ${profileHandle}`);

    const page = query.page ?? 1;
    const limit = query.limit ?? 16;
    const offset = limit * (page - 1);

    const { records, count: total } =
      await this.profileAchievementRepository.listAll({
        limit,
        offset,
        search: query.search,
        profileHandle,
      });

    return new PaginatedResponse(records, total, limit, page, {});
  }
}
