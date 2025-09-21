import { Profile } from "@/modules/social/core/domain/entities/Profile";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import {
  ProfileFollowRepository,
  ProfileRepository,
} from "../domain/interfaces/repositories/profile-repository";
import {
  generateBaseHandle,
  generateHandleCandidates,
} from "@/modules/shared/utils/handle-generator";
import { User } from "@/modules/identity/domain/entities/User";
import { SocialProfileEventsQueuePublisher } from "../domain/queues/social-profile-events-queue";

@Injectable()
export class ProfileService {
  constructor(
    @Inject(ProfileRepository)
    private readonly profileRepository: ProfileRepository,
    @Inject(ProfileFollowRepository)
    private readonly profileFollowRepository: ProfileFollowRepository,
    @Inject(SocialProfileEventsQueuePublisher)
    private readonly eventsQueuePublisher: SocialProfileEventsQueuePublisher
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

  async createProfile(
    user: User,
    options?: { txContext?: unknown }
  ): Promise<Profile> {
    const baseHandle = generateBaseHandle(user.name || "Usuario");
    const candidates = generateHandleCandidates(baseHandle, 10);

    let handle: string | null = null;

    for (const candidate of candidates) {
      const exists = await this.profileRepository.findByHandle(candidate);
      if (!exists) {
        handle = candidate;
        break;
      }
    }

    if (!handle) {
      handle = `${baseHandle}${Math.floor(Math.random() * 10000)}`;
    }

    const profile = Profile.fromUser(user, user.name || "Usuario", handle);
    await this.profileRepository.create(profile, options);

    return profile;
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

    await this.eventsQueuePublisher.publish({
      event: "follow",
      data: { profileId: userProfileId, resourceId: followingProfile.id },
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

    await this.eventsQueuePublisher.publish({
      event: "unfollow",
      data: { profileId: userProfileId, resourceId: followingProfile.id },
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
