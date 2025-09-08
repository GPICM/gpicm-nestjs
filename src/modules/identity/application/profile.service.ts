import { Profile } from "@/modules/feed/domain/entities/Profile";
import { Injectable } from "@nestjs/common";
import {
  PrismaProfileFollowRepository,
  PrismaProfileRepository,
} from "@/modules/feed/infra/prisma-profile-repository";

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: PrismaProfileRepository,
    private readonly profileFollowRepository: PrismaProfileFollowRepository
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

  async createProfile(profile: Profile): Promise<Profile> {
    return await this.profileRepository.create(profile);
  }

  async updateProfile(profile: Profile): Promise<Profile> {
    return await this.profileRepository.update(profile);
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
