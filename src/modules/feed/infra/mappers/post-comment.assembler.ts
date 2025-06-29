import { Prisma } from "@prisma/client";
import { UserShallow } from "../../domain/entities/UserShallow";
import { PostComment } from "../../domain/entities/PostComment";

export const postCommentInclude = Prisma.validator<Prisma.PostCommentInclude>()(
  {
    User: {
      select: {
        id: true,
        name: true,
        publicId: true,
        profilePicture: true,
      },
    },
  }
);

type PostCommentJoinModel = Prisma.PostCommentGetPayload<{
  include: typeof postCommentInclude;
}>;

class PostCommentAssembler {
  public static toPrismaCreate(
    comment: PostComment
  ): Prisma.PostCommentCreateInput {
    return {
      Post: {
        connect: {
          id: comment.postId,
        },
      },
      User: {
        connect: {
          id: comment.user?.id,
        },
      },
      content: comment.content,
      parentId: comment.parentCommentId ?? null,
    };
  }

  public static toPrismaUpdate(
    comment: PostComment
  ): Prisma.PostCommentUpdateInput {
    return {
      content: comment.content,
    };
  }

  public static fromPrisma(
    prismaData: PostCommentJoinModel | null
  ): PostComment | null {
    if (!prismaData) return null;

    const userData = prismaData.User;

    return new PostComment({
      id: prismaData.id,
      postId: prismaData.postId,
      content: prismaData.content,
      createdAt: prismaData.createdAt,
      updatedAt: prismaData.updatedAt,
      parentCommentId: prismaData.parentId,
      user: new UserShallow({
        id: userData.id,
        name: userData.name ?? "",
        profilePicture: userData.profilePicture ?? "",
        publicId: userData.publicId,
      }),
    });
  }

  public static fromPrismaMany(
    prismaDataArray: PostCommentJoinModel[]
  ): PostComment[] {
    const votes: PostComment[] = [];

    for (const prismaData of prismaDataArray) {
      const post = this.fromPrisma(prismaData);
      if (post) {
        votes.push(post);
      }
    }
    return votes;
  }
}

export { PostCommentAssembler };
