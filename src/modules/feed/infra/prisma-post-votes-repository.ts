import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { PostVotesRepository } from "../domain/interfaces/repositories/post-votes-repository";
import { PostVote } from "../domain/entities/PostVote";
import { PrismaClient } from "@prisma/client";
import {
  PostVoteAssembler,
  postVoteInclude,
} from "./mappers/post-vote.assembler";

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
      this.logger.log(`Upserting vote for postId=${postVote.postId}`);
      await prisma.postVote.upsert({
        where: {
          postId_userId: { postId: postVote.postId, userId: postVote.user.id },
        },
        create: PostVoteAssembler.toPrismaCreate(postVote),
        update: PostVoteAssembler.toPrismaUpdate(postVote),
      });

      this.logger.log(
        `Vote upserted successfully for postId=${postVote.postId}`
      );
    } catch (error: unknown) {
      this.logger.error(`Failed to upsert vote for postId=${postVote.postId}`, {
        error,
      });
      throw new Error("Failed to upsert vote");
    }
  }

  async add(postVote: PostVote): Promise<void> {
    try {
      await this.prisma.postVote.create({
        data: PostVoteAssembler.toPrismaCreate(postVote),
      });
      this.logger.log(`Vote created for postId=${postVote.postId}`);
    } catch (error: unknown) {
      this.logger.error("Failed to create vote", { postVote, error });
      throw new Error("Failed to create vote");
    }
  }

  async update(postVote: PostVote): Promise<void> {
    try {
      await this.prisma.postVote.update({
        where: {
          postId_userId: { postId: postVote.postId, userId: postVote.user.id },
        },
        data: PostVoteAssembler.toPrismaUpdate(postVote),
      });
      this.logger.log(`Vote updated for postId=${postVote.postId}`);
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
  ): Promise<PostVote[]> {
    try {
      this.logger.log(
        `Fetching votes for postId=${postId}, limit=${limit}, offset=${offset}`
      );
      const votes = await this.prisma.postVote.findMany({
        where: { postId },
        orderBy: { createdAt: "desc" },
        include: postVoteInclude,
        skip: offset,
        take: limit,
      });
      return PostVoteAssembler.fromPrismaMany(votes);
    } catch (error: unknown) {
      this.logger.error(`Failed to fetch votes for postId=${postId}`, {
        error,
      });
      throw new Error("Failed to fetch votes");
    }
  }
}
