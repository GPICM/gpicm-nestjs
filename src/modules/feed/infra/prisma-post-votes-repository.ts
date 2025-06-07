import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { PostVotesRepository } from "../domain/interfaces/repositories/post-votes-repository";
import { PostVote } from "../domain/entities/PostVote";

@Injectable()
export class PrismaPostVotesRepository implements PostVotesRepository {
  private readonly logger: Logger = new Logger(PrismaPostVotesRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async add(postVote: PostVote): Promise<void> {
    try {
      await this.prisma.postVote.create({
        data: {
          postId: postVote.postId,
          userId: postVote.userId,
          value: postVote.value,
        },
      });
      this.logger.log(`Like created`);
    } catch (error: unknown) {
      this.logger.error("Failed to create like", { postVote, error });
      throw new Error("Failed to create like");
    }
  }

  async update(postVote: PostVote): Promise<void> {
    try {
      await this.prisma.postVote.update({
        where: {
          postId_userId: { postId: postVote.postId, userId: postVote.userId },
        },
        data: {
          value: postVote.value,
        },
      });
      this.logger.log(`Like created`);
    } catch (error: unknown) {
      this.logger.error("Failed to create like", { postVote, error });
      throw new Error("Failed to create like");
    }
  }

  async delete(postVote: PostVote): Promise<void> {
    try {
      await this.prisma.postVote.delete({
        where: {
          postId_userId: { postId: postVote.postId, userId: postVote.userId },
        },
      });
      this.logger.log(`Like deleted:`);
    } catch (error: unknown) {
      this.logger.error("Failed to delete like", { postVote, error });
      throw new Error("Failed to delete like");
    }
  }

  async findByPostId(
    postId: number,
    limit: number,
    offset: number
  ): Promise<{ userId: number; createdAt: Date }[]> {
    return this.prisma.postVote.findMany({
      where: { postId },
      select: { userId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    });
  }

  async findLikedPostIdsByUser(
    userId: number,
    postIds: number[]
  ): Promise<number[]> {
    if (!postIds.length) return [];
    try {
      const likes = await this.prisma.postVote.findMany({
        where: {
          userId,
          postId: { in: postIds },
        },
        select: { postId: true },
      });
      return likes.map((like) => like.postId);
    } catch (error: unknown) {
      this.logger.error("Failed to find liked post IDs", {
        userId,
        postIds,
        error,
      });
      throw new Error("Failed to find liked post IDs");
    }
  }
}
