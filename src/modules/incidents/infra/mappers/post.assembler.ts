/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Prisma, PostStatus, PostType } from "@prisma/client";

import { Post, PostStatusEnum, PostTypeEnum } from "../../domain/entities/Post";
import { AuthorSummary } from "../../domain/object-values/AuthorSumary";
import { Incident } from "../../domain/entities/Incident";
import { IncidentAssembler } from "./incident.mapper";

export const postInclude = Prisma.validator<Prisma.PostInclude>()({
  Incident: { include: { Author: true } },
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
      Author: {
        connect: {
          id: post.author.id,
        },
      },
      Incident: {
        connect: {
          id: post.incident?.id,
        },
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  public static fromPrisma(prismaData?: PostJoinModel | null): Post | null {
    if (!prismaData) return null;

    const { Author, Incident: incidentData } = prismaData;

    const author = new AuthorSummary({
      id: Author.id,
      name: Author.name ?? "Anônimo",
      profilePicture: Author.profilePicture ?? "",
      publicId: Author.publicId,
    });

    let incident: Incident | null = null;
    if (prismaData.type == PostType.INCIDENT && incidentData) {
      incident = IncidentAssembler.fromPrisma(incidentData);
    }

    return new Post({
      id: prismaData.id,
      title: prismaData.title,
      type: prismaData.type as PostTypeEnum,
      status: prismaData.status as PostStatusEnum,
      content: prismaData.content,
      publishedAt: prismaData.publishedAt,
      slug: prismaData.slug,
      incident,
      author,
    });
  }

  public static fromPrismaMany(prismaDataArray: PostJoinModel[]): Post[] {
    const posts: Post[] = [];
    for (const prismaData of prismaDataArray) {
      const post = this.fromPrisma(prismaData);
      if (post) {
        posts.push(post);
      }
    }
    return posts;
  }
}

export { PostAssembler };
