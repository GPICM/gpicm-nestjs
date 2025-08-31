import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { AchievementService } from "../application/achievement.service";
import { UserService } from "../application/user.service";
import { User } from "../domain/entities/User";
import { ProfileService } from "../application/profile.service";
import { UserBasicData } from "../domain/value-objects/user-basic-data";
import { UserGuard } from "./meta/guards/user.guard";
import { CurrentUser } from "./meta/decorators/user.decorator";
import { JwtAuthGuard } from "./meta/guards/jwt-auth.guard";
import { Logger } from "@nestjs/common";
import { profile } from "console";
import { Profile } from "@prisma/client";

@Controller("social")
@UseGuards(JwtAuthGuard)
export class SocialController {
  private readonly logger = new Logger(SocialController.name);

  constructor(
    private readonly achievementService: AchievementService,
    private readonly userService: UserService,
    private readonly profileService: ProfileService
  ) {}

  @Post("/achievements")
  async createAchievement(@Body() body: any) {
    return this.achievementService.create(body);
  }

  @Get("/achievements/:id")
  async getAchievement(@Param("id") id: number) {
    return this.achievementService.findById(id);
  }

  @Get("/profile")
  @UseGuards(UserGuard)
  async getMyBasicData(@CurrentUser() user: User) {
    try {
      this.logger.log(`Fetching basic data for current user: ${user.id}`);
      const profile = await this.profileService.getProfile(user.id);
      this.logger.log(`Profile data retrieved: ${JSON.stringify(profile)}`);
      return await this.profileService.getProfile(user.id);
    } catch (error: unknown) {
      this.logger.error("Failed to get user basic data", { error });
      throw new BadRequestException();
    }
  }
}
