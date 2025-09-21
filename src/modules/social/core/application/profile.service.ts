import { Profile } from "@/modules/social/core/domain/entities/Profile";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import {
  ProfileFollowRepository,
  ProfileRepository,
} from "../domain/interfaces/repositories/profile-repository";
import { EventPublisher } from "@/modules/shared/domain/interfaces/events";
import { ProfileFollowingEvent } from "../domain/interfaces/events";

@Injectable()
export class ProfileService {
  constructor(
    @Inject(ProfileRepository)
    private readonly profileRepository: ProfileRepository,
    @Inject(ProfileFollowRepository)
    private readonly profileFollowRepository: ProfileFollowRepository,
    @Inject(EventPublisher)
    private readonly eventsPublisher: EventPublisher
  ) {}

  async countFollowersByProfileId(profileId: number): Promise<number> {
    return await this.profileFollowRepository.countFollowersByProfileId(
      profileId
    );
  }

  async updateAvatar(userId: number, avatarUrl: string | null) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (profile) {
      profile.setAvatar(avatarUrl);
      await this.profileRepository.update(profile);
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

  async updateProfile(profile: Profile): Promise<Profile> {
    await this.profileRepository.update(profile);
    return profile;
  }

  async deleteProfile(id: number): Promise<void> {
    await this.profileRepository.delete(id);
  }

  async followUser(
    userProfileId: number,
    targetProfileHandle: string
  ): Promise<{ success: boolean; message: string }> {
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

    await this.eventsPublisher.publish<ProfileFollowingEvent>({
      event: "profile.followed",
      data: { profileId: userProfileId, targetProfileId: followingProfile.id },
    });

    return { success: true, message: "User followed successfully" };
  }

  async unfollowUser(
    userProfileId: number,
    targetProfileHandle: string
  ): Promise<{ success: boolean; message: string }> {
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

    await this.eventsPublisher.publish<ProfileFollowingEvent>({
      event: "profile.unfollowed",
      data: { profileId: userProfileId, targetProfileId: followingProfile.id },
    });

    return { success: true, message: "User unfollowed successfully" };
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
