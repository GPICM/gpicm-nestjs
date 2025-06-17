/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { PostCommentRepository } from "../domain/interfaces/repositories/post-comment-repository";
import { PostComment, CommentType } from "../domain/entities/PostComment";

@Injectable()
export class PrismaPostCommentRepository implements PostCommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(comment: Omit<PostComment, "id" | "createdAt" | "updatedAt">): Promise<PostComment> {
    const created = await this.prisma.postComment.create({
      data: {
        postId: comment.postId,
        userId: comment.userId,
        content: comment.content,
        type: comment.type,
      },
    });
    return new PostComment({
      ...created,
      type: created.type as CommentType,
      user: comment.user,
    });
  }

  async findById(id: number): Promise<PostComment | null> {
    const found = await this.prisma.postComment.findUnique({ where: { id } });
    if (!found) return null;
    return new PostComment({
      ...found,
      type: found.type as CommentType,
    });
  }



  async update(
    id: number,
    data: Partial<Omit<PostComment, "id" | "createdAt" | "userId" | "postId">>
  ): Promise<PostComment> {
    const updated = await this.prisma.postComment.update({
      where: { id },
      data,
    });
    return new PostComment({
      ...updated,
      type: updated.type as CommentType,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.postComment.delete({ where: { id } });
  }
}
