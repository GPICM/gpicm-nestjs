import { Injectable, Logger } from "@nestjs/common";

import { PrismaService } from "@/modules/shared/services/prisma-services";

import { PostCommentRepository } from "../domain/interfaces/repositories/post-comment-repository";
import { PostComment } from "../domain/entities/PostComment";
import {
  BaseRepositoryFindManyFilters,
  BaseRepositoryFindManyResult,
} from "../domain/interfaces/dto/base-repository-filters";
import { Prisma } from "@prisma/client";
import {
  PostCommentAssembler,
  postCommentInclude,
} from "./mappers/post-comment.assembler";

@Injectable()
export class PrismaPostCommentRepository implements PostCommentRepository {
  private readonly logger: Logger = new Logger(
    PrismaPostCommentRepository.name
  );

  constructor(private readonly prisma: PrismaService) {}

  public async updatePostCommentsCount(postId: number) {
    const count = await this.prisma.postComment.count({
      where: { postId, deletedAt: null },
    });

    await this.prisma.post.update({
      where: { id: postId },
      data: { commentsCount: count },
    });
  }

  public async add(comment: PostComment): Promise<void> {
    await this.prisma.postComment.create({
      data: PostCommentAssembler.toPrismaCreate(comment),
    });
  }

  public async update(comment: PostComment): Promise<void> {
    await this.prisma.postComment.update({
      where: { id: comment.id! },
      data: PostCommentAssembler.toPrismaUpdate(comment),
    });
  }

  public async findById(id: number): Promise<PostComment | null> {
    const found = await this.prisma.postComment.findFirst({
      where: { id, deletedAt: null },
      include: postCommentInclude,
    });

    if (!found) return null;
    return PostCommentAssembler.fromPrisma(found);
  }

  public async delete(id: number): Promise<void> {
    await this.prisma.postComment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  public async listAllByPostId(
    postId: number,
    filters: BaseRepositoryFindManyFilters & { parentId?: number },
    userId?: number
  ): Promise<BaseRepositoryFindManyResult<PostComment>> {
    const skip = filters.offset;
    const take = filters.limit;
    const sort = filters.sort ?? "createdAt";
    const order = filters.order ?? "desc";

    const where: Prisma.PostCommentWhereInput = {
      postId: postId,
    };

    if (filters.parentId) {
      where.parentId = filters.parentId;
    }

    const [prismaResult, count] = await Promise.all([
      this.prisma.postComment.findMany({
        where,
        take,
        skip,
        orderBy: { [sort]: order },
        include: postCommentInclude,
      }),
      this.prisma.postComment.count({ where }),
    ]);

    const records = PostCommentAssembler.fromPrismaMany(prismaResult);

    this.logger.log(
      `Listed ${records.length} posts comments out of total ${count}`
    );

    return { records, count };
  }
}
