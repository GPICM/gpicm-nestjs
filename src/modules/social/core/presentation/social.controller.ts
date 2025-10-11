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
import { SocialProfileGuard } from "../infra/guards/SocialProfileGuard";
import { Profile } from "../domain/entities/Profile";
import { CurrentProfile } from "../infra/decorators/profile.decorator";

@Controller("social")
@UseGuards(JwtAuthGuard, SocialProfileGuard)
export class SocialController {
  private readonly logger = new Logger(SocialController.name);

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
}
