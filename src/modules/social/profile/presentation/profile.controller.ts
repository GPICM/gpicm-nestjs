import {
  Get,
  Param,
  Logger,
  UseGuards,
  Controller,
  BadRequestException,
  Body,
  Patch,
} from "@nestjs/common";

import {
  CurrentUser,
  JwtAuthGuard,
} from "@/modules/identity/auth/presentation/meta";
import { User } from "@/modules/identity/core/domain/entities/User";
import { ActiveUserGuard } from "@/modules/identity/auth/presentation/meta/guards/active-user.guard";
import { UpdateUserAvatarDto } from "@/modules/identity/auth/presentation/dtos/user-request.dtos";

import { ProfileService } from "../application/profile.service";
import { Profile } from "../../core/domain/entities/Profile";
import { CurrentProfile } from "../../core/infra/decorators/profile.decorator";
import { SocialProfileGuard } from "../../core/infra/guards/SocialProfileGuard";

@Controller("social/profile")
@UseGuards(JwtAuthGuard, ActiveUserGuard, SocialProfileGuard())
export class SocialProfileController {
  private readonly logger = new Logger(SocialProfileController.name);

  constructor(private readonly profileService: ProfileService) {}

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

  @Get("/me")
  getMe(@CurrentUser() user: User, @CurrentProfile() profile: Profile) {
    try {
      return { user, profile };
    } catch (error: unknown) {
      this.logger.error("Failed to get user basic data", { error });
      throw new BadRequestException();
    }
  }

  @Patch("/me/avatar")
  async updateUserAvatar(
    @CurrentProfile() profile: Profile,
    @Body() body: UpdateUserAvatarDto
  ): Promise<any> {
    try {
      this.logger.log("Updating user avatar", {
        profile,
        fields: Object.keys(body),
      });

      await this.profileService.updateAvatar(profile, body);

      return { success: true };
    } catch (error: unknown) {
      this.logger.error("Failed to update data", { error });
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
