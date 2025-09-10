import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { Profile } from "@/modules/feed/domain/entities/Profile";
import { Logger } from "@nestjs/common";
import {
  ProfileRepository,
  ProfileFollowRepository,
} from "@/modules/feed/domain/interfaces/repositories/profile-repository";
import { BadRequestException } from "@nestjs/common";

@Injectable()
export class PrismaProfileRepository implements ProfileRepository {
  private readonly logger = new Logger(PrismaProfileRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Profile | null> {
    const data = await this.prisma.profile.findUnique({ where: { id } });
    return data ? new Profile(data) : null;
  }

  async findByUserId(userId: number): Promise<Profile | null> {
    this.logger.log(`PRISMA: WORKED: ${userId}`);
    const data = await this.prisma.profile.findUnique({ where: { userId } });
    return data ? new Profile(data) : null;
  }

  async create(profile: Profile): Promise<Profile> {
    const data = await this.prisma.profile.create({
      data: {
        userId: profile.userId,
        bio: profile.bio,
        displayName: profile.displayName,
        profileImage: profile.profileImage,
        latitude: profile.latitude,
        longitude: profile.longitude,
        followersCount: profile.followersCount,
        followingCount: profile.followingCount,
      },
    });
    return new Profile(data);
  }

  async refreshPostCount(userId: number): Promise<void> {
    await this.prisma.profile.update({
      where: { userId },
      data: { postCounts: { increment: 1 } },
    });
  }

  async refreshCommentCount(userId: number): Promise<void> {
    const commentCount = await this.prisma.postComment.count({
      where: { userId, deletedAt: null },
    });

    await this.prisma.profile.update({
      where: { userId },
      data: { commentCounts: commentCount },
    });
  }

  async update(profile: Profile): Promise<Profile> {
    const data = await this.prisma.profile.update({
      where: { id: profile.id },
      data: {
        bio: profile.bio,
        profileImage: profile.profileImage,
        latitude: profile.latitude,
        longitude: profile.longitude,
        followersCount: profile.followersCount,
        followingCount: profile.followingCount,
      },
    });
    return new Profile(data);
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
