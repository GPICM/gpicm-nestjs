import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { PostVotesRepository } from "../domain/interfaces/repositories/post-votes-repository";
import { PostVote } from "../domain/entities/PostVote";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaPostVotesRepository implements PostVotesRepository {
  private readonly logger: Logger = new Logger(PrismaPostVotesRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  public async upsert(
    postVote: PostVote,
    options?: { transactionContext?: PrismaClient }
  ): Promise<void> {
    const prisma = options?.transactionContext ?? this.prisma;

    try {
      this.logger.log(
        `Upserting vote for postId=${postVote.postId}, userId=${postVote.userId}`
      );
      await prisma.postVote.upsert({
        where: {
          postId_userId: { postId: postVote.postId, userId: postVote.userId },
        },
        create: {
          postId: postVote.postId,
          userId: postVote.userId,
          value: postVote.value,
        },
        update: {
          value: postVote.value,
        },
      });

      this.logger.log(
        `Vote upserted successfully for postId=${postVote.postId}, userId=${postVote.userId}`
      );
    } catch (error: unknown) {
      this.logger.error(
        `Failed to upsert vote for postId=${postVote.postId}, userId=${postVote.userId}`,
        { error }
      );
      throw new Error("Failed to upsert vote");
    }
  }

  async add(postVote: PostVote): Promise<void> {
    try {
      await this.prisma.postVote.create({
        data: {
          postId: postVote.postId,
          userId: postVote.userId,
          value: postVote.value,
        },
      });
      this.logger.log(
        `Vote created for postId=${postVote.postId}, userId=${postVote.userId}`
      );
    } catch (error: unknown) {
      this.logger.error("Failed to create vote", { postVote, error });
      throw new Error("Failed to create vote");
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
      this.logger.log(
        `Vote updated for postId=${postVote.postId}, userId=${postVote.userId}`
      );
    } catch (error: unknown) {
      this.logger.error("Failed to update vote", { postVote, error });
      throw new Error("Failed to update vote");
    }
  }

  async delete(userId: number, postId: number): Promise<void> {
    try {
      await this.prisma.postVote.delete({
        where: {
          postId_userId: { postId, userId },
        },
      });
      this.logger.log(`Vote deleted for postId=${postId}, userId=${userId}`);
    } catch (error: unknown) {
      this.logger.error("Failed to delete vote", { postId, userId, error });
      throw new Error("Failed to delete vote");
    }
  }

  async findByPostId(
    postId: number,
    limit: number,
    offset: number
  ): Promise<{ userId: number; createdAt: Date }[]> {
    try {
      this.logger.log(
        `Fetching votes for postId=${postId}, limit=${limit}, offset=${offset}`
      );
      const votes = await this.prisma.postVote.findMany({
        where: { postId },
        select: { userId: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      });
      this.logger.log(`Fetched ${votes.length} votes for postId=${postId}`);
      return votes;
    } catch (error: unknown) {
      this.logger.error(`Failed to fetch votes for postId=${postId}`, {
        error,
      });
      throw new Error("Failed to fetch votes");
    }
  }

  async findLikedPostIdsByUser(
    userId: number,
    postIds: number[]
  ): Promise<number[]> {
    if (!postIds.length) {
      this.logger.log(
        `No postIds provided to find liked posts for userId=${userId}`
      );
      return [];
    }
    try {
      this.logger.log(
        `Fetching liked post IDs for userId=${userId} in posts: [${postIds.join(", ")}]`
      );
      const likes = await this.prisma.postVote.findMany({
        where: {
          userId,
          postId: { in: postIds },
        },
        select: { postId: true },
      });
      const likedPostIds = likes.map((like) => like.postId);
      this.logger.log(
        `Found ${likedPostIds.length} liked posts for userId=${userId}`
      );
      return likedPostIds;
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
