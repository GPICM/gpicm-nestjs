import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/shared/services/prisma-services";
import { PostCommentRepository } from "../domain/interfaces/repositories/post-comment-repository";
import { PostComment } from "../domain/entities/PostComment";
import { User } from "@/modules/identity/domain/entities/User";
import { CreateReplyCommentDto } from "../presentation/dtos/create-reply-comment.dto";

// Função utilitária para mapear User parcial como objeto simples (não como User)
function mapPrismaUserToUserObject(prismaUser: any): any {
  if (!prismaUser) return undefined;
  return {
    id: prismaUser.id,
    publicId: prismaUser.publicId,
    name: prismaUser.name,
    profilePicture: prismaUser.profilePicture,
  };
}

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

  async create(comment: { postId: number; userId: number; content: string; user?: any; parentCommentId?: number | null }): Promise<PostComment> {
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
            name: true,
            profilePicture: true,
            publicId: true,
          },
        },
      },
    });
    if (!found) return null;
    return new PostComment({
      ...found,
      user: mapPrismaUserToUserObject(found.User),
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
            name: true,
            profilePicture: true,
            publicId: true,
          },
        },
      },
    });
    return comments.map(c =>
      new PostComment({
        ...c,
        user: mapPrismaUserToUserObject(c.User),
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
    await this.updatePostCommentsCount(created.postId);
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
      include: {
        User: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            publicId: true,
          },
        },
      },
    });
    // Atualiza o count após editar (caso queira garantir consistência)
    await this.updatePostCommentsCount(updated.postId);
    return new PostComment({
      ...updated,
      user: mapPrismaUserToUserObject(updated.User),
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