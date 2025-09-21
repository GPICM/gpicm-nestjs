import { PrismaClient } from "@prisma/client";
import { Injectable, Logger, BadRequestException } from "@nestjs/common";

import { PrismaService } from "@/modules/shared/services/prisma-services";

import { Profile } from "@/modules/social/core/domain/entities/Profile";
import {
  ProfileRepository,
  ProfileFollowRepository,
} from "@/modules/social/core/interfaces/repositories/profile-repository";
import { ProfileAssembler } from "./mappers/prisma-profile.assembler";

@Injectable()
export class PrismaProfileRepository implements ProfileRepository {
  private readonly logger = new Logger(PrismaProfileRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByHandle(handle: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { handle },
    });

    if (!profile) return null;
    return ProfileAssembler.fromPrisma(profile);
  }

  async findById(id: number): Promise<Profile | null> {
    const data = await this.prisma.profile.findUnique({ where: { id } });
    if (!data) return null;
    return ProfileAssembler.fromPrisma(data);
  }

  async findByUserId(userId: number): Promise<Profile | null> {
    const data = await this.prisma.profile.findUnique({ where: { userId } });
    if (!data) return null;
    return ProfileAssembler.fromPrisma(data);
  }

  public async create(
    profile: Profile,
    options?: { txContext?: PrismaClient }
  ): Promise<void> {
    const connection = options?.txContext ?? this.prisma.getConnection();
    const created = await connection.profile.create({
      data: ProfileAssembler.toPrismaCreateInput(profile),
    });

    profile.setId(created.id);
  }

  // TODO: REFACTOR THIS TO COUNT TABLES
  async refreshPostCount(userId: number): Promise<void> {
    await this.prisma.profile.update({
      where: { userId },
      data: { postsCount: { increment: 1 } },
    });
  }

  async refreshCommentCount(userId: number): Promise<void> {
    const commentCount = await this.prisma.postComment.count({
      where: { userId, deletedAt: null },
    });

    await this.prisma.profile.update({
      where: { userId },
      data: { commentsCount: commentCount },
    });
  }

  async update(profile: Profile): Promise<void> {
    await this.prisma.profile.update({
      where: { id: profile.id },
      data: ProfileAssembler.toPrismaUpdateInput(profile),
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.profile.delete({ where: { id } });
  }
}

@Injectable()
export class PrismaProfileFollowRepository implements ProfileFollowRepository {
  constructor(private readonly prisma: PrismaService) {}

  async follow(followerId: number, followingId: number): Promise<void> {
    if (followerId === followingId) {
      throw new BadRequestException("You cannot follow yourself.");
    }

    const followerProfile = await this.prisma.profile.findUnique({
      where: { id: followerId },
    });
    const followingProfile = await this.prisma.profile.findUnique({
      where: { id: followingId },
    });

    if (!followerProfile || !followingProfile) {
      throw new BadRequestException("Profile not found.");
    }

    const alreadyFollowing = await this.isFollowing(followerId, followingId);
    if (alreadyFollowing) {
      throw new BadRequestException("You are already following this user.");
    }

    await this.prisma.profileFollow.create({
      data: { followerId, followingId },
    });

    await this.prisma.profile.update({
      where: { id: followerId },
      data: { followingCount: { increment: 1 } },
    });

    await this.prisma.profile.update({
      where: { id: followingId },
      data: { followersCount: { increment: 1 } },
    });
  }

  async countFollowingByProfileId(profileId: number): Promise<number> {
    return this.prisma.profileFollow.count({
      where: { followerId: profileId },
    });
  }

  async countFollowersByProfileId(profileId: number): Promise<number> {
    return this.prisma.profileFollow.count({
      where: { followingId: profileId },
    });
  }

  async unfollow(followerId: number, followingId: number): Promise<void> {
    if (followerId === followingId) {
      throw new BadRequestException("You cannot unfollow yourself.");
    }

    const alreadyFollowing = await this.isFollowing(followerId, followingId);
    if (!alreadyFollowing) {
      throw new BadRequestException("You are not following this user.");
    }

    await this.prisma.profileFollow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });

    await this.prisma.profile.update({
      where: { id: followerId },
      data: { followingCount: { decrement: 1 } },
    });

    await this.prisma.profile.update({
      where: { id: followingId },
      data: { followersCount: { decrement: 1 } },
    });
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const follow = await this.prisma.profileFollow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return !!follow;
  }

  async getFollowersCount(profileId: number): Promise<number> {
    return await this.prisma.profileFollow.count({
      where: { followingId: profileId },
    });
  }

  async getFollowers(
    profileId: number,
    limit?: number,
    offset?: number
  ): Promise<Profile[]> {
    const followers = await this.prisma.profileFollow.findMany({
      where: { followingId: profileId },
      include: { Follower: true },
      take: limit,
      skip: offset,
    });
    return followers.map((follow) => new Profile(follow.Follower));
  }

  async getFollowing(
    profileId: number,
    limit?: number,
    offset?: number
  ): Promise<Profile[]> {
    const following = await this.prisma.profileFollow.findMany({
      where: { followerId: profileId },
      include: { Following: true },
      take: limit,
      skip: offset,
    });
    return following.map((follow) => new Profile(follow.Following));
  }

  async getFollowingCount(profileId: number): Promise<number> {
    return await this.prisma.profileFollow.count({
      where: { followerId: profileId },
    });
  }
}
