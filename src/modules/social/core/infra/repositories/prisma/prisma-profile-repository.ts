import { PrismaClient } from "@prisma/client";
import { Injectable, Logger } from "@nestjs/common";

import { PrismaService } from "@/modules/shared/services/prisma-services";

import { Profile } from "@/modules/social/core/domain/entities/Profile";
import { ProfileRepository } from "@/modules/social/core/domain/interfaces/repositories/profile-repository";
import {
  ProfileAssembler,
  profileInclude,
} from "./mappers/prisma-profile.assembler";

@Injectable()
export class PrismaProfileRepository implements ProfileRepository {
  private readonly logger = new Logger(PrismaProfileRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByHandle(handle: string): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { handle },
      include: profileInclude,
    });

    if (!profile) return null;
    return ProfileAssembler.fromPrisma(profile);
  }

  async findById(id: number): Promise<Profile | null> {
    const data = await this.prisma.profile.findUnique({
      where: { id },
      include: profileInclude,
    });
    if (!data) return null;
    return ProfileAssembler.fromPrisma(data);
  }

  async findByUserId(userId: number): Promise<Profile | null> {
    const data = await this.prisma.profile.findUnique({
      where: { userId },
      include: profileInclude,
    });
    if (!data) return null;
    return ProfileAssembler.fromPrisma(data);
  }

  async findByUserPublicId(publicId: string): Promise<Profile | null> {
    const data = await this.prisma.profile.findFirst({
      where: { User: { publicId } },
      include: profileInclude,
    });
    if (!data) return null;

    return ProfileAssembler.fromPrisma(data);
  }

  public async updateAvatar(profile: Profile): Promise<void> {
    await this.prisma.profile.update({
      where: { id: profile.id },
      data: ProfileAssembler.toPrismaAvatarUpdateInput(profile),
    });
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

  async refreshPostCount(profileId: number): Promise<void> {
    const postsCount = await this.prisma.post.count({
      where: { authorId: profileId, deletedAt: null },
    });

    await this.prisma.profile.update({
      where: { id: profileId },
      data: { postsCount },
    });
  }

  async refreshCommentCount(profileId: number): Promise<void> {
    const commentCount = await this.prisma.postComment.count({
      where: { profileId, deletedAt: null },
    });

    await this.prisma.profile.update({
      where: { id: profileId },
      data: { commentsCount: commentCount },
    });
  }

  async refreshFollowersCounts(profileId: number): Promise<void> {
    const [followersCount, followingCount] = await Promise.all([
      this.prisma.profileFollow.count({
        where: { followerId: profileId },
      }),
      this.prisma.profileFollow.count({
        where: { followingId: profileId },
      }),
    ]);

    await this.prisma.profile.update({
      where: { id: profileId },
      data: {
        followersCount,
        followingCount,
      },
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
