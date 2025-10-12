import { Injectable, BadRequestException } from "@nestjs/common";

import { PrismaService } from "@/modules/shared/services/prisma-services";

import { Profile } from "@/modules/social/core/domain/entities/Profile";
import { ProfileFollowRepository } from "@/modules/social/core/domain/interfaces/repositories/profile-repository";
import {
  ProfileAssembler,
  profileInclude,
} from "./mappers/prisma-profile.assembler";

@Injectable()
export class PrismaProfileFollowRepository implements ProfileFollowRepository {
  constructor(private readonly prisma: PrismaService) {}

  async follow(followerId: number, followingId: number): Promise<void> {
    const alreadyFollowing = await this.isFollowing(followerId, followingId);

    if (alreadyFollowing) {
      throw new BadRequestException("You are already following this user.");
    }

    await this.prisma.profileFollow.create({
      data: { followerId, followingId },
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
    const alreadyFollowing = await this.isFollowing(followerId, followingId);

    if (!alreadyFollowing) {
      throw new BadRequestException("You are not following this user.");
    }

    await this.prisma.profileFollow.delete({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const follow = await this.prisma.profileFollow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return follow !== null;
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
