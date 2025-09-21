import { PrismaClient } from "@prisma/client";
import { Injectable, Logger } from "@nestjs/common";

import { PrismaService } from "@/modules/shared/services/prisma-services";

import { Profile } from "@/modules/social/core/domain/entities/Profile";
import { ProfileRepository } from "@/modules/social/core/domain/interfaces/repositories/profile-repository";
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
