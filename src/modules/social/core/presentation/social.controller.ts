import {
  Get,
  Param,
  Post,
  Body,
  Logger,
  UseGuards,
  Controller,
  BadRequestException,
} from "@nestjs/common";

import {
  CurrentUser,
  JwtAuthGuard,
} from "@/modules/identity/presentation/meta";
import { User } from "@/modules/identity/domain/entities/User";
import { UserGuard } from "@/modules/identity/presentation/meta/guards/user.guard";

import { AchievementService } from "../application/achievement.service";
import { ProfileService } from "../application/profile.service";

@Controller("social")
@UseGuards(JwtAuthGuard)
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
    @CurrentUser() currentUser: User
  ) {
    return await this.profileService.followUser(currentUser.id, handle);
  }

  @Get("/followers/:id")
  async getFollowers(@Param("id") id: number) {
    return await this.profileService.getFollowers(id);
  }

  @Get("/following/:id")
  async getFollowing(@Param("id") id: number) {
    return await this.profileService.getFollowing(id);
  }

  @Post("/unfollow/:handle")
  async unfollowUser(
    @Param("handle") handle: string,
    @CurrentUser() currentUser: User
  ) {
    return await this.profileService.unfollowUser(currentUser.id, handle);
  }

  @Get("/profile")
  @UseGuards(UserGuard)
  async getMyProfileData(@CurrentUser() user: User) {
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
