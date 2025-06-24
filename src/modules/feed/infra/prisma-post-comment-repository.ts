import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { PostCommentRepository } from "../domain/interfaces/repositories/post-comment-repository";
import { PostComment } from "../domain/entities/PostComment";
import { CreateReplyCommentDto } from "../presentation/dtos/create-reply-comment.dto";

@Injectable()
export class PrismaPostCommentRepository implements PostCommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(comment: { postId: number; userId: number; content: string; user?: any; parentCommentId?: number | null }): Promise<PostComment> {
    const created = await this.prisma.postComment.create({
      data: {
        postId: comment.postId,
        userId: comment.userId,
        content: comment.content,
        parentId: comment.parentCommentId ?? null,
      },
    });
    return new PostComment({
      ...created,
      user: comment.user,
      parentCommentId: created.parentId ?? null,
    });
  }

  async findById(id: number): Promise<PostComment | null> {
    const found = await this.prisma.postComment.findUnique({ where: { id } });
    if (!found) return null;
    return new PostComment({
      ...found,
      parentCommentId: found.parentId ?? null,
    });
  }

  async findByPostId(postId: number): Promise<PostComment[]> {
    const comments = await this.prisma.postComment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
    });
    return comments.map(c =>
      new PostComment({
        ...c,
        parentCommentId: c.parentId ?? null,
      })
    );
  }

  async createReply(
    dto: { postId: number; userId: number; content: string; parentCommentId: number; user?: any }
  ): Promise<PostComment> {
    const created = await this.prisma.postComment.create({
      data: {
        postId: dto.postId,
        userId: dto.userId,
        content: dto.content,
        parentId: dto.parentCommentId,
      },
    });
    return new PostComment({
      ...created,
      user: dto.user,
      parentCommentId: created.parentId ?? null,
    });
  }

  async update(
    id: number,
    data: Partial<{ content: string }>
  ): Promise<PostComment> {
    const updated = await this.prisma.postComment.update({
      where: { id },
      data,
    });
    return new PostComment({
      ...updated,
      parentCommentId: updated.parentId ?? null,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.postComment.delete({ where: { id } });
  }
}