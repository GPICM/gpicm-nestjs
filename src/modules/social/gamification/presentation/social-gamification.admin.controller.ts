import {
  Post,
  Logger,
  UseGuards,
  Controller,
  BadRequestException,
  Body,
  Get,
  Param,
  Query,
} from "@nestjs/common";

import { JwtAuthGuard } from "@/modules/identity/auth/presentation/meta";
import { AchievementService } from "../application/achievement.service";
import { CreateAchievementBodyDto } from "./dtos/create-achievement.dto";
import { CreateAchievementUseCase } from "../application/create-achievement-usecase";
import { AdminGuard } from "@/modules/identity/auth/presentation/meta/guards/admin.guard";
import { ListAchievementsQueryDto } from "./dtos/list-achievements.dtos";

@Controller("/admin/social/achievements")
@UseGuards(JwtAuthGuard, AdminGuard)
export class SocialGamificationAdminController {
  private readonly logger = new Logger(SocialGamificationAdminController.name);

  constructor(
    private readonly achievementService: AchievementService,
    private readonly createAchievementUseCase: CreateAchievementUseCase
  ) {}

  @Post("/")
  createAchievement(@Body() body: CreateAchievementBodyDto) {
    try {
      return this.createAchievementUseCase.execute(body);
    } catch (error: unknown) {
      this.logger.error("Failed to create achievement", { error });
      throw new BadRequestException("Failde to created");
    }
  }

  @Get("/achievements/:id")
  async getAchievement(@Param("id") id: number) {
    return this.achievementService.findById(id);
  }

  @Get("/")
  async listAll(@Query() query: ListAchievementsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 16;
    return this.achievementService.listPaginated({ limit: limit, page });
  }
}
