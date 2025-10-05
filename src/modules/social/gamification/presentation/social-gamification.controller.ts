import {
  Post,
  Logger,
  UseGuards,
  Controller,
  BadRequestException,
  Body,
} from "@nestjs/common";

import { JwtAuthGuard } from "@/modules/identity/auth/presentation/meta";
import { SocialProfileGuard } from "../../core/infra/guards/SocialProfileGuard";
import { AchievementService } from "../application/achievement.service";
import { CreateAchievementBodyDto } from "./dtos/create-achievement.dto";
import { CreateAchievementUseCase } from "../application/create-achievement-usecase";

@Controller("social/achievements")
@UseGuards(JwtAuthGuard, SocialProfileGuard)
export class SocialGamificationController {
  private readonly logger = new Logger(SocialGamificationController.name);

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

  /*   @Get("/achievements/:id")
  async getAchievement(@Param("id") id: number) {
    return this.achievementService.findById(id);
  }


  @Get("/achievements/:id")
  async listAll(@Param("id") id: number) {
    return this.achievementService.findById(id);
  } */
}
