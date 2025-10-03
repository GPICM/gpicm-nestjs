import {
  Get,
  Param,
  Post,
  Body,
  Logger,
  UseGuards,
  Controller,
} from "@nestjs/common";

import { JwtAuthGuard } from "@/modules/identity/auth/presentation/meta";

import { AchievementService } from "../application/achievement.service";
import { ProfileService } from "../application/profile.service";
import { SocialProfileGuard } from "../infra/guards/SocialProfileGuard";
import { Profile } from "../domain/entities/Profile";
import { CurrentProfile } from "../infra/decorators/profile.decorator";

@Controller("social")
@UseGuards(JwtAuthGuard, SocialProfileGuard)
export class SocialController {
  private readonly logger = new Logger(SocialController.name);

  constructor(
    private readonly achievementService: AchievementService,
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

  @Post("/follow/:handle")
  async followUser(
    @Param("handle") handle: string,
    @CurrentProfile() profile: Profile
  ) {
    return await this.profileService.followUser(profile.id, handle);
  }

  @Post("/unfollow/:handle")
  async unfollowUser(
    @Param("handle") handle: string,
    @CurrentProfile() profile: Profile
  ) {
    return await this.profileService.unfollowUser(profile.id, handle);
  }

  @Get("/followers/:id")
  async getFollowers(@Param("id") id: number) {
    return await this.profileService.getFollowers(id);
  }

  @Get("/following/:id")
  async getFollowing(@Param("id") id: number) {
    return await this.profileService.getFollowing(id);
  }
}
