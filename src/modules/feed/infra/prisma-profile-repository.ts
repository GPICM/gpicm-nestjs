import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { Profile } from "@/modules/feed/domain/entities/Profile";
import { User } from "@/modules/identity/domain/entities/User";
import {
  ProfileRepository,
  ProfileFollowRepository,
} from "@/modules/feed/domain/interfaces/repositories/profile-repository";

@Injectable()
export class PrismaProfileRepository implements ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Profile | null> {
    const data = await this.prisma.profile.findUnique({ where: { id } });
    return data ? new Profile(data) : null;
  }

  async findByUserId(userId: number): Promise<Profile | null> {
    const data = await this.prisma.profile.findUnique({ where: { userId } });
    return data ? new Profile(data) : null;
  }

  async create(profile: Profile): Promise<Profile> {
    const data = await this.prisma.profile.create({
      data: {
        userId: profile.userId,
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
    await this.prisma.profileFollow.create({
      data: { followerId, followingId },
    });

    // Atualizar contadores
    await this.prisma.profile.update({
      where: { id: followerId },
      data: { followingCount: { increment: 1 } },
    });

    await this.prisma.profile.update({
      where: { id: followingId },
      data: { followersCount: { increment: 1 } },
    });
  }

  async unfollow(followerId: number, followingId: number): Promise<void> {
    await this.prisma.profileFollow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });

    // Atualizar contadores
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

  async getFollowingCount(profileId: number): Promise<number> {
    return await this.prisma.profileFollow.count({
      where: { followerId: profileId },
    });
  }
}
