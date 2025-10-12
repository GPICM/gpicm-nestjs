import { Prisma, PrismaClient } from "@prisma/client";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";

import { PostVotesRepository } from "../domain/interfaces/repositories/post-votes-repository";
import { PostVote } from "../domain/entities/PostVote";
import {
  PostVoteAssembler,
  postVoteInclude,
} from "./mappers/post-vote.assembler";
import {
  BaseRepositoryFindManyFilters,
  BaseRepositoryFindManyResult,
} from "../../core/domain/interfaces/dto/base-repository-filters";

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
          postId_profileId: {
            postId: postVote.postId,
            profileId: postVote.profile.id,
          },
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
          postId_profileId: {
            postId: postVote.postId,
            profileId: postVote.profile.id,
          },
        },
        data: PostVoteAssembler.toPrismaUpdate(postVote),
      });
      this.logger.log(`Vote updated for postId=${postVote.postId}`);
    } catch (error: unknown) {
      this.logger.error("Failed to update vote", { postVote, error });
      throw new Error("Failed to update vote");
    }
  }

  async delete(profileId: number, postId: number): Promise<void> {
    try {
      await this.prisma.postVote.delete({
        where: {
          postId_profileId: {
            postId: postId,
            profileId: profileId,
          },
        },
      });
      this.logger.log(
        `Vote deleted for postId=${postId}, profileId=${profileId}`
      );
    } catch (error: unknown) {
      this.logger.error("Failed to delete vote", { postId, profileId, error });
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

  public async listAllByPostId(
    postId: number,
    filters: BaseRepositoryFindManyFilters
  ): Promise<BaseRepositoryFindManyResult<PostVote>> {
    try {
      const skip = filters.offset;
      const take = filters.limit;
      const sort = filters.sort ?? "createdAt";
      const order = filters.order ?? "desc";

      const where: Prisma.PostVoteWhereInput = {
        postId: postId,
      };

      if (filters.search) {
        where.OR = [{ Profile: { displayName: { contains: filters.search } } }];
      }

      this.logger.log(
        `Listing posts votes with filters: skip=${skip}, take=${take}, sort=${sort}, order=${order}, search=${filters.search ?? "none"}`
      );

      const [prismaResult, count] = await Promise.all([
        this.prisma.postVote.findMany({
          where,
          take,
          skip,
          orderBy: { [sort]: order },
          include: { ...postVoteInclude },
        }),
        this.prisma.postVote.count({ where }),
      ]);

      const records = PostVoteAssembler.fromPrismaMany(prismaResult);

      this.logger.log(
        `Listed ${records.length} posts votes out of total ${count}`
      );

      return { records, count };
    } catch (error: unknown) {
      this.logger.error("Failed to list posts votes", { error });
      throw new Error("Failed to list posts votes");
    }
  }

  public async refreshPostScore(postId: number): Promise<void> {
    try {
      this.logger.log("Refreshing post score");
      const [upVotes, downVotes] = await Promise.all([
        this.prisma.postVote.count({ where: { postId, value: 1 } }),
        this.prisma.postVote.count({ where: { postId, value: -1 } }),
      ]);

      this.logger.log(`Result: ${upVotes} ${downVotes}`);

      await this.prisma.post.update({
        where: { id: postId },
        data: {
          upVotes,
          downVotes,
          score: upVotes - downVotes,
        },
      });
    } catch (error: unknown) {
      this.logger.error("Failed to refresh posts votes", { error });
      throw new Error("Failed to refresh posts votes");
    }
  }
}
