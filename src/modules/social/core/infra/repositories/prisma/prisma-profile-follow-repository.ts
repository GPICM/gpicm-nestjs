import { Injectable, BadRequestException } from "@nestjs/common";

import { PrismaService } from "@/modules/shared/services/prisma-services";

import { Profile } from "@/modules/social/core/domain/entities/Profile";
import { ProfileFollowRepository } from "@/modules/social/core/interfaces/repositories/profile-repository";
import {
  ProfileAssembler,
  profileInclude,
} from "./mappers/prisma-profile.assembler";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaProfileFollowRepository implements ProfileFollowRepository {
  constructor(private readonly prisma: PrismaService) {}

  async follow(followerId: number, followingHandle: string): Promise<void> {
    const followerProfile = await this.prisma.profile.findUnique({
      where: { id: followerId },
    });

    const followingProfile = await this.prisma.profile.findUnique({
      where: { handle: followingHandle },
    });

    if (!followerProfile || !followingProfile) {
      throw new BadRequestException("Profile not found.");
    }

    if (!followerProfile.id == !followingProfile.id) {
      throw new BadRequestException("You cannot follow yourself.");
    }

    const followingId = followingProfile.id;

    const alreadyFollowing = await this.isFollowing(
      followerId,
      followingProfile.id
    );

    if (alreadyFollowing) {
      throw new BadRequestException("You are already following this user.");
    }

    await this.prisma.openTransaction(async (connection: PrismaClient) => {
      await connection.profileFollow.create({
        data: { followerId, followingId },
      });

      await connection.profile.update({
        where: { id: followerId },
        data: { followingCount: { increment: 1 } },
      });

      await connection.profile.update({
        where: { id: followingId },
        data: { followersCount: { increment: 1 } },
      });
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

  async unfollow(followerId: number, followingHandle: string): Promise<void> {
    const followingProfile = await this.prisma.profile.findUnique({
      where: { handle: followingHandle },
    });

    if (!followingProfile) {
      throw new BadRequestException("Profile not found.");
    }

    const alreadyFollowing = await this.isFollowing(
      followerId,
      followingProfile.id
    );

    if (!alreadyFollowing) {
      throw new BadRequestException("You are not following this user.");
    }

    const followingId = followingProfile.id;

    await this.prisma.openTransaction(async (connection: PrismaClient) => {
      await connection.profileFollow.delete({
        where: {
          followerId_followingId: { followerId, followingId },
        },
      });

      await connection.profile.update({
        where: { id: followerId },
        data: { followingCount: { decrement: 1 } },
      });

      await connection.profile.update({
        where: { id: followingId },
        data: { followersCount: { decrement: 1 } },
      });
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
      include: { Follower: { include: profileInclude } },
      take: limit,
      skip: offset,
    });

    return followers
      .map((f) => ProfileAssembler.fromPrisma(f.Follower))
      .filter((p) => !!p);
  }

  async getFollowing(
    profileId: number,
    limit?: number,
    offset?: number
  ): Promise<Profile[]> {
    const following = await this.prisma.profileFollow.findMany({
      where: { followerId: profileId },
      include: { Following: { include: profileInclude } },
      take: limit,
      skip: offset,
    });

    return following
      .map((f) => ProfileAssembler.fromPrisma(f.Following))
      .filter((p) => !!p);
  }

  async getFollowingCount(profileId: number): Promise<number> {
    return await this.prisma.profileFollow.count({
      where: { followerId: profileId },
    });
  }
}
