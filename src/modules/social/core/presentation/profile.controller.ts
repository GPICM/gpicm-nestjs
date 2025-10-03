import {
  Get,
  Param,
  Logger,
  UseGuards,
  Controller,
  BadRequestException,
} from "@nestjs/common";

import {
  CurrentUser,
  JwtAuthGuard,
} from "@/modules/identity/auth/presentation/meta";
import { User } from "@/modules/identity/core/domain/entities/User";
import { ActiveUserGuard } from "@/modules/identity/auth/presentation/meta/guards/active-user.guard";

import { ProfileService } from "../application/profile.service";
import { SocialProfileGuard } from "../infra/guards/SocialProfileGuard";

@Controller("social/profile")
@UseGuards(JwtAuthGuard)
export class SocialProfileController {
  private readonly logger = new Logger(SocialProfileController.name);

  constructor(private readonly profileService: ProfileService) {}

  @Get("/")
  @UseGuards(ActiveUserGuard, SocialProfileGuard)
  async getMyProfileData(@CurrentUser() user: User) {
    try {
      this.logger.log(`Fetching basic data for current user: ${user.id}`);
      const profile = await this.profileService.getProfile(user.id);
      return profile;
    } catch (error: unknown) {
      this.logger.error("Failed to get user basic data", { error });
      throw new BadRequestException();
    }
  }

  // TODO: CHANGE TO PROFILE HANDLE LATER
  @Get("/user/:userPublicId")
  async getProfileByUserPublicId(@Param("userPublicId") userPublicId: string) {
    try {
      const profile =
        await this.profileService.getProfileByUserPublicId(userPublicId);
      return profile;
    } catch (error: unknown) {
      this.logger.error("Failed to get user basic data", { error });
      throw new BadRequestException();
    }
  }

  @Get("/:handle")
  async getProfile(@Param("handle") handle: string) {
    try {
      const profile = await this.profileService.getProfileByHandle(handle);
      return profile;
    } catch (error: unknown) {
      this.logger.error("Failed to get user basic data", { error });
      throw new BadRequestException();
    }
  }
}
