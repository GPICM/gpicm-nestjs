import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { PostLikesRepository } from "../domain/interfaces/repositories/post-likes-repository";

@Injectable()
export class PostLikesPrismaRepository implements PostLikesRepository {
  private readonly logger: Logger = new Logger(PostLikesPrismaRepository.name);

  constructor(
    private readonly prisma: PrismaService
  ) {}

  async create(postId: number, userId: number): Promise<void> {
    try {
      await this.prisma.postLikes.create({
        data: { postId, userId },
      });
      this.logger.log(`Like created: postId=${postId}, userId=${userId}`);
    } catch (error) {
      this.logger.error("Failed to create like", { postId, userId, error });
      throw new Error("Failed to create like");
    }
  }

  async delete(postId: number, userId: number): Promise<void> {
    try {
      await this.prisma.postLikes.delete({
        where: { postId_userId: { postId, userId } },
      });
      this.logger.log(`Like deleted: postId=${postId}, userId=${userId}`);
    } catch (error) {
      this.logger.error("Failed to delete like", { postId, userId, error });
      throw new Error("Failed to delete like");
    }
  }

  async exists(postId: number, userId: number): Promise<boolean> {
    try {
      const like = await this.prisma.postLikes.findUnique({
        where: { postId_userId: { postId, userId } },
      });
      return !!like;
    } catch (error) {
      this.logger.error("Failed to check like existence", { postId, userId, error });
      throw new Error("Failed to check like existence");
    }
  }

  async countByPost(postId: number): Promise<number> {
    try {
      return await this.prisma.postLikes.count({
        where: { postId },
      });
    } catch (error) {
      this.logger.error("Failed to count likes", { postId, error });
      throw new Error("Failed to count likes");
    }
  }

  async findByPost(postId: number, limit: number, offset: number): Promise<{ userId: number, createdAt: Date }[]> {
    return this.prisma.postLikes.findMany({
      where: { postId },
      select: { userId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });
  }

  async findLikedPostIdsByUser(userId: number, postIds: number[]): Promise<number[]> {
    if (!postIds.length) return [];
    try {
      const likes = await this.prisma.postLikes.findMany({
        where: {
          userId,
          postId: { in: postIds },
        },
        select: { postId: true },
      });
      return likes.map(like => like.postId);
    } catch (error) {
      this.logger.error("Failed to find liked post IDs", { userId, postIds, error });
      throw new Error("Failed to find liked post IDs");
    }
  }

}