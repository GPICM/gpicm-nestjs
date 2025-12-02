/* eslint-disable @typescript-eslint/no-unsafe-return */
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
import { ProfileRepository } from "../../core/domain/interfaces/repositories/profile-repository";

@Controller("social/profile")
@UseGuards(JwtAuthGuard, ActiveUserGuard, SocialProfileGuard())
export class SocialProfileController {
  private readonly logger = new Logger(SocialProfileController.name);

  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly profileService: ProfileService
  ) {}

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

  @Get("/reputation-ranking")
  async ranking() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const profiles = await this.profileRepository.listTopProfiles();
      return profiles ?? [];
    } catch (error: unknown) {
      this.logger.error("Failed to list top profiles", { error });
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
