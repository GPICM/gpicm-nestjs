/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Prisma, PostStatus, PostType } from "@prisma/client";

import { Post, PostStatusEnum, PostTypeEnum } from "../../domain/entities/Post";
import { PostAuthor } from "../../domain/entities/PostAuthor";
import { IncidentAssembler } from "@/modules/incidents/infra/mappers/incident.mapper";
import { PostAttachment } from "../../domain/object-values/PostAttchment";
import { ViewerPost } from "../../domain/entities/ViewerPost";
import { VoteValue } from "../../domain/entities/PostVote";

export const postInclude = Prisma.validator<Prisma.PostInclude>()({
  Incident: { include: { Author: true, IncidentType: true } },
  Votes: { select: { value: true, userId: true } },
  Author: true,
});

type PostJoinModel = Prisma.PostGetPayload<{
  include: typeof postInclude;
}>;

class PostAssembler {
  public static toPrisma(post: Post): Prisma.PostCreateInput {
    return {
      title: post.title,
      content: post.content,
      slug: post.slug,
      type: post.type as PostType,
      status: post.status as PostStatus,
      publishedAt: post.publishedAt,
      isPinned: post.isPinned || false,
      isVerified: post.isVerified || false,
      downVotes: post.downVotes,
      upVotes: post.upVotes,
      score: post.score,
      Author: {
        connect: {
          id: post.author.id,
        },
      },
      /*  Incident:
        post.type === PostTypeEnum.INCIDENT && post.attachment
          ? {
              connect: {
                id: post.attachment.id,
              },
            }
          : undefined, */
    };
  }

  public static fromPrisma(
    prismaData: PostJoinModel | null,
    userId: number
  ): ViewerPost | null {
    if (!prismaData) return null;

    const { Author } = prismaData;

    const author = new PostAuthor({
      id: Author.id,
      name: Author.name ?? "Anônimo",
      profilePicture: Author.profilePicture ?? "",
      publicId: Author.publicId,
    });

    let attachment;
    if (prismaData.type == PostType.INCIDENT && prismaData.Incident) {
      const incident = IncidentAssembler.fromPrisma(prismaData.Incident);
      if (incident) {
        attachment = new PostAttachment(incident?.id, incident);
      }
    }

    console.log(JSON.stringify(prismaData, null, 4));
    const voteValue = (prismaData.Votes ?? [])?.[0];

    return new ViewerPost(
      {
        id: prismaData.id,
        title: prismaData.title,
        type: prismaData.type as PostTypeEnum,
        status: prismaData.status as PostStatusEnum,
        content: prismaData.content,
        publishedAt: prismaData.publishedAt,
        slug: prismaData.slug,
        attachment,
        downVotes: prismaData.downVotes,
        upVotes: prismaData.upVotes,
        score: prismaData.score,
        isPinned: prismaData.isPinned,
        isVerified: prismaData.isVerified,
        coverImageUrl: "",
        medias: [],
        author,
      },
      userId,
      voteValue?.value as VoteValue
    );
  }

  public static fromPrismaMany(
    prismaDataArray: PostJoinModel[],
    userId: number
  ): ViewerPost[] {
    const posts: ViewerPost[] = [];
    for (const prismaData of prismaDataArray) {
      const post = this.fromPrisma(prismaData, userId);
      if (post) {
        posts.push(post);
      }
    }
    return posts;
  }
}

export { PostAssembler };
