import { Prisma } from "@prisma/client";
import { ProfileSummary } from "../../domain/object-values/ProfileSummary";
import { PostComment } from "../../domain/entities/PostComment";

export const postCommentInclude = Prisma.validator<Prisma.PostCommentInclude>()(
  {
    Profile: {
      select: {
        id: true,
        handle: true,
        displayName: true,
        avatarUrl: true,
      },
    },
    Post: {
      select: {
        uuid: true,
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
      Profile: {
        connect: {
          id: comment.profile.id,
        },
      },
      content: comment.content,
      ...(comment.parentCommentId
        ? {
            ParentComment: {
              connect: { id: comment.parentCommentId },
            },
          }
        : {}),
    };
  }

  public static toPrismaUpdate(
    comment: PostComment
  ): Prisma.PostCommentUpdateInput {
    return {
      content: comment.content,
    };
  }

  public static toPrismaDelete(): Prisma.PostCommentUpdateInput {
    return {
      deletedAt: new Date(),
    };
  }

  public static fromPrisma(
    prismaData: PostCommentJoinModel | null
  ): PostComment | null {
    if (!prismaData) return null;

    const profile = prismaData.Profile;

    return new PostComment({
      id: prismaData.id,
      postId: prismaData.postId,
      postUuid: prismaData.Post.uuid,
      content: prismaData.content,
      createdAt: prismaData.createdAt,
      updatedAt: prismaData.updatedAt,
      parentCommentId: prismaData.parentId,
      repliesCount: prismaData.repliesCount,
      profile: new ProfileSummary({
        id: profile.id,
        name: profile.displayName ?? "",
        avatarUrl: profile.avatarUrl || "",
        handle: profile.handle,
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
