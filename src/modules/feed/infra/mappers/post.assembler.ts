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
  public static toPrismaCreate(post: Post): Prisma.PostCreateInput {
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
      locationAddress: post.address,
      Author: {
        connect: {
          id: post.author.id,
        },
      },
      Incident:
        post.type === PostTypeEnum.INCIDENT && post.attachment
          ? {
              connect: {
                id: post.attachment.id,
              },
            }
          : undefined,
    };
  }

  public static toSqlInsert(post: Post): string {
    const { address, location } = post;

    // Construct the POINT value as a WKT (Well-Known Text) string
    const pointWKT = location
      ? `ST_GeomFromText('POINT(${location.longitude} ${location.latitude})', 4326)`
      : "NULL";

    // Format the publishedAt date to ISO string or set to NULL
    const publishedAtValue = post.publishedAt
      ? `'${post.publishedAt.toISOString().slice(0, 19).replace("T", " ")}'`
      : "NULL";

    const escapeString = (str: string) => str.replace(/'/g, "''");

    const sql = `
      INSERT INTO posts (
        uuid,
        title,
        content,
        slug,
        type,
        status,
        published_at,
        updated_at,
        is_pinned,
        is_verified,
        down_votes,
        up_votes,
        score,
        location_address,
        author_id,
        location
      ) VALUES (
        '${post.uuid}',
        '${escapeString(post.title)}',
        '${escapeString(post.content)}',
        '${escapeString(post.slug)}',
        '${post.type}',
        '${post.status}',
        ${publishedAtValue},
        NOW(),
        ${post.isPinned ? 1 : 0},
        ${post.isVerified ? 1 : 0},
        ${post.downVotes ?? 0},
        ${post.upVotes ?? 0},
        ${post.score ?? 0},
        ${post.address ? `'${escapeString(address)}'` : "NULL"},
        '${post.author.id}',
        ${pointWKT}
      );
    `;

    console.log(sql);
    return sql.trim();
  }

  public static toPrismaUpdate(post: Post): Prisma.PostUpdateInput {
    return {
      status: post.status as PostStatus,
      isPinned: post.isPinned || false,
      isVerified: post.isVerified || false,
      downVotes: post.downVotes,
      upVotes: post.upVotes,
      score: post.score,
      Incident:
        post.type === PostTypeEnum.INCIDENT && post.attachment
          ? {
              connect: {
                id: post.attachment.id,
              },
            }
          : undefined,
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
        uuid: prismaData.uuid,
        slug: prismaData.slug,
        title: prismaData.title,
        type: prismaData.type as PostTypeEnum,
        status: prismaData.status as PostStatusEnum,
        content: prismaData.content,
        publishedAt: prismaData.publishedAt,
        attachment,
        downVotes: prismaData.downVotes,
        upVotes: prismaData.upVotes,
        score: prismaData.score,
        isPinned: prismaData.isPinned,
        isVerified: prismaData.isVerified,
        coverImageUrl: "",
        medias: [],
        address: "",
        location: null,
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
