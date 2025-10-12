import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";

import { Profile } from "@/modules/social/core/domain/entities/Profile";
import { EventPublisher } from "@/modules/shared/domain/interfaces/events";

import {
  ProfileFollowRepository,
  ProfileRepository,
} from "../../core/domain/interfaces/repositories/profile-repository";
import { ProfileEvent } from "../../core/domain/interfaces/events";
import { UpdateProfileAvatarDto } from "../../core/presentation/dtos/profile-update-avatar-request.dto";
import { MediaService } from "@/modules/assets/application/media.service";
import { UserAvatar } from "@/modules/shared/domain/object-values/user-avatar";

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);
  constructor(
    @Inject(ProfileRepository)
    private readonly profileRepository: ProfileRepository,
    @Inject(ProfileFollowRepository)
    private readonly profileFollowRepository: ProfileFollowRepository,
    @Inject(EventPublisher)
    private readonly eventsPublisher: EventPublisher,
    @Inject(MediaService)
    private readonly mediaService: MediaService
  ) {}

  async countFollowersByProfileId(profileId: number): Promise<number> {
    return await this.profileFollowRepository.countFollowersByProfileId(
      profileId
    );
  }

  public async updateAvatar(
    profile: Profile,
    { avatarMediaId }: UpdateProfileAvatarDto
  ) {
    try {
      this.logger.log("Updating user location", { avatarMediaId });

      if (!avatarMediaId) {
        profile.setAvatar(null);
      } else {
        this.logger.log("Looking for avatar mediaId", {
          avatarMediaId,
        });

        const media = await this.mediaService.findOneById(avatarMediaId);

        if (media?.sources) {
          this.logger.log("Media Found, assigning avatar to user", {
            avatarMediaId,
          });

          profile.setAvatar(new UserAvatar(media.sources));
        }
      }

      await this.profileRepository.updateAvatar(profile);

      this.logger.log("User data updated successfully");
    } catch (error: unknown) {
      this.logger.error("Failed to update user data", { error });
      throw error;
    }
  }

  async refreshPostCount(userId: number): Promise<void> {
    await this.profileRepository.refreshPostCount(userId);
  }

  async getProfile(userId: number): Promise<Profile | null> {
    return await this.profileRepository.findByUserId(userId);
  }

  async getProfileByUserPublicId(userId: string): Promise<Profile | null> {
    return await this.profileRepository.findByUserPublicId(userId);
  }

  async getProfileByHandle(handle: string): Promise<Profile | null> {
    return await this.profileRepository.findByHandle(handle);
  }

  async updateProfile(profile: Profile): Promise<Profile> {
    await this.profileRepository.update(profile);
    return profile;
  }

  async deleteProfile(id: number): Promise<void> {
    await this.profileRepository.delete(id);
  }

  async followUser(
    userProfile: Profile,
    targetProfileHandle: string
  ): Promise<{ success: boolean; message: string }> {
    const { id: userProfileId } = userProfile;
    const followingProfile =
      await this.profileRepository.findByHandle(targetProfileHandle);

    if (!followingProfile) {
      throw new BadRequestException("Profile not found.");
    }

    if (userProfileId === followingProfile.id) {
      throw new BadRequestException("You cannot follow yourself.");
    }

    await this.profileFollowRepository.follow(
      userProfileId,
      followingProfile.id
    );

    await this.eventsPublisher.publish(
      new ProfileEvent("profile.followed", userProfile, followingProfile)
    );

    return { success: true, message: "User followed successfully" };
  }

  async unfollowUser(
    userProfile: Profile,
    targetProfileHandle: string
  ): Promise<{ success: boolean; message: string }> {
    const { id: userProfileId } = userProfile;

    const followingProfile =
      await this.profileRepository.findByHandle(targetProfileHandle);

    if (!followingProfile) {
      throw new BadRequestException("Profile not found.");
    }

    if (userProfileId === followingProfile.id) {
      throw new BadRequestException("You cannot follow yourself.");
    }

    await this.profileFollowRepository.unfollow(
      userProfileId,
      followingProfile.id
    );

    await this.eventsPublisher.publish(
      new ProfileEvent("profile.unfollowed", userProfile, followingProfile)
    );

    return { success: true, message: "User unfollowed successfully" };
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    return await this.profileFollowRepository.isFollowing(
      followerId,
      followingId
    );
  }

  async getFollowers(
    profileId: number,
    limit = 10,
    page = 1
  ): Promise<{
    records: Profile[];
    metadata: {
      total: number;
      limit: number;
      page: number;
      pagesCount: number;
      prevPage: number;
      nextPage: number;
      prevPageUrl: string;
      nextPageUrl: string;
      filters: Record<string, any>;
    };
  }> {
    const offset = (page - 1) * limit;
    const [records, total] = await Promise.all([
      this.profileFollowRepository.getFollowers(profileId, limit, offset),
      this.profileFollowRepository.countFollowersByProfileId(profileId),
    ]);
    const pagesCount = Math.max(1, Math.ceil(total / limit));
    const prevPage = page > 1 ? page - 1 : 1;
    const nextPage = page < pagesCount ? page + 1 : pagesCount;
    return {
      records,
      metadata: {
        total,
        limit,
        page,
        pagesCount,
        prevPage,
        nextPage,
        prevPageUrl: `/?page=${prevPage}`,
        nextPageUrl: `/?page=${nextPage}`,
        filters: {},
      },
    };
  }

  async getFollowing(
    profileId: number,
    limit = 10,
    page = 1
  ): Promise<{
    records: Profile[];
    metadata: {
      total: number;
      limit: number;
      page: number;
      pagesCount: number;
      prevPage: number;
      nextPage: number;
      prevPageUrl: string;
      nextPageUrl: string;
      filters: Record<string, any>;
    };
  }> {
    const offset = (page - 1) * limit;
    const [records, total] = await Promise.all([
      this.profileFollowRepository.getFollowing(profileId, limit, offset),
      this.profileFollowRepository.countFollowingByProfileId(profileId),
    ]);
    const pagesCount = Math.max(1, Math.ceil(total / limit));
    const prevPage = page > 1 ? page - 1 : 1;
    const nextPage = page < pagesCount ? page + 1 : pagesCount;
    return {
      records,
      metadata: {
        total,
        limit,
        page,
        pagesCount,
        prevPage,
        nextPage,
        prevPageUrl: `/?page=${prevPage}`,
        nextPageUrl: `/?page=${nextPage}`,
        filters: {},
      },
    };
  }
}
