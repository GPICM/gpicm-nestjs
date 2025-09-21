import { Profile } from "@/modules/social/core/domain/entities/Profile";
import { Inject, Injectable } from "@nestjs/common";
import {
  ProfileFollowRepository,
  ProfileRepository,
} from "../interfaces/repositories/profile-repository";
import {
  generateBaseHandle,
  generateHandleCandidates,
} from "@/modules/shared/utils/handle-generator";
import { User } from "@/modules/identity/domain/entities/User";

@Injectable()
export class ProfileService {
  constructor(
    @Inject(ProfileRepository)
    private readonly profileRepository: ProfileRepository,
    @Inject(ProfileFollowRepository)
    private readonly profileFollowRepository: ProfileFollowRepository
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

  async refreshCommentCount(userId: number): Promise<void> {
    await this.profileRepository.refreshCommentCount(userId);
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
    followerId: number,
    followingId: number
  ): Promise<{ success: boolean; message: string }> {
    await this.profileFollowRepository.follow(followerId, followingId);
    return { success: true, message: "User followed successfully" };
  }

  async unfollowUser(
    followerId: number,
    followingId: number
  ): Promise<{ success: boolean; message: string }> {
    await this.profileFollowRepository.unfollow(followerId, followingId);
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
