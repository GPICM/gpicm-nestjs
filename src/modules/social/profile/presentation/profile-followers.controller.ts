import {
  Get,
  Param,
  Post,
  Logger,
  UseGuards,
  Controller,
} from "@nestjs/common";

import { JwtAuthGuard } from "@/modules/identity/auth/presentation/meta";

import { ProfileService } from "../application/profile.service";
import { SocialProfileGuard } from "../../core/infra/guards/SocialProfileGuard";
import { Profile } from "../../core/domain/entities/Profile";
import { CurrentProfile } from "../../core/infra/decorators/profile.decorator";
import { ActiveUserGuard } from "@/modules/identity/auth/presentation/meta/guards/active-user.guard";

@Controller("social")
@UseGuards(JwtAuthGuard, ActiveUserGuard, SocialProfileGuard())
export class SocialFollowersController {
  private readonly logger = new Logger(SocialFollowersController.name);

  constructor(private readonly profileService: ProfileService) {}

  @Post("/follow/:handle")
  async followUser(
    @Param("handle") handle: string,
    @CurrentProfile() profile: Profile
  ) {
    return await this.profileService.followUser(profile, handle);
  }

  @Post("/unfollow/:handle")
  async unfollowUser(
    @Param("handle") handle: string,
    @CurrentProfile() profile: Profile
  ) {
    return await this.profileService.unfollowUser(profile, handle);
  }

  @Get("/followers/:id")
  async getFollowers(@Param("id") id: number) {
    return await this.profileService.getFollowers(id);
  }

  @Get("/following/:id")
  async getFollowing(@Param("id") id: number) {
    return await this.profileService.getFollowing(id);
  }

  @Get("/user/isFollowing/:userId")
  async isFollowing(
    @Param("userId") userId: number,
    @CurrentProfile() profile: Profile
  ) {
    return await this.profileService.isFollowing(profile.id, userId);
  }
}
