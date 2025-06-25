import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { PostCommentRepository } from "../domain/interfaces/repositories/post-comment-repository";
import { PostComment, PartialUserForComment } from "../domain/entities/PostComment";

@Injectable()
export class PrismaPostCommentRepository implements PostCommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async updatePostCommentsCount(postId: number) {
    const count = await this.prisma.postComment.count({
      where: { postId, deletedAt: null },
    });
    await this.prisma.post.update({
      where: { id: postId },
      data: { commentsCount: count },
    });
  }

  async add(comment: PostComment): Promise<PostComment> {
    const created = await this.prisma.postComment.create({
      data: {
        postId: comment.postId,
        userId: comment.userId,
        content: comment.content,
        parentId: comment.parentCommentId ?? null,
      },
    });
    await this.updatePostCommentsCount(created.postId);
    return new PostComment({
      ...created,
      user: comment.user,
      parentCommentId: created.parentId ?? null,
    });
  }

  async findById(id: number): Promise<PostComment | null> {
    const found = await this.prisma.postComment.findFirst({
      where: { id, deletedAt: null },
      include: {
        User: {
          select: {
            id: true,
            publicId: true,
            name: true,
            profilePicture: true,
          },
        },
      },
    });
    if (!found) return null;
    const user: PartialUserForComment | null = found.User
      ? {
          id: found.User.id,
          publicId: found.User.publicId,
          name: found.User.name,
          profilePicture: found.User.profilePicture,
        }
      : null;
    return new PostComment({
      ...found,
      user,
      parentCommentId: found.parentId ?? null,
    });
  }

  async findByPostId(postId: number): Promise<PostComment[]> {
    const comments = await this.prisma.postComment.findMany({
      where: { postId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      include: {
        User: {
          select: {
            id: true,
            publicId: true,
            name: true,
            profilePicture: true,
          },
        },
      },
    });

    return comments.map((c) => {
      const user: PartialUserForComment | null = c.User
        ? {
            id: c.User.id,
            publicId: c.User.publicId,
            name: c.User.name,
            profilePicture: c.User.profilePicture,
          }
        : null;
      return new PostComment({
        ...c,
        user,
        parentCommentId: c.parentId ?? null,
      });
    });
  }

  async update(comment: PostComment): Promise<PostComment> {
    const updated = await this.prisma.postComment.update({
      where: { id: comment.id! },
      data: {
        content: comment.content,
        updatedAt: new Date(),
      },
    });
    await this.updatePostCommentsCount(updated.postId);
    return new PostComment({
      ...updated,
      user: comment.user,
      parentCommentId: updated.parentId ?? null,
    });
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.prisma.postComment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.updatePostCommentsCount(deleted.postId);
  }
}