import { Prisma } from "@prisma/client";

import { PostMedia } from "../../domain/entities/PostMedia";
import {
  MediaSource,
  MediaSourceVariant,
  MediaSourceVariantKey,
} from "@/modules/assets/domain/object-values/media-source";

export const postMediaInclude = Prisma.validator<Prisma.PostMediaInclude>()({
  Media: true,
});

type PostMediaJoinModel = Prisma.PostMediaGetPayload<{
  include: typeof postMediaInclude;
}>;

class PostMediaAssembler {
  public static toPrismaCreate(
    postMedia: PostMedia
  ): Prisma.PostMediaCreateInput {
    return {
      Post: {
        connect: { id: postMedia.postId! },
      },
      Media: {
        connect: { id: postMedia.mediaId },
      },
      displayOrder: postMedia.displayOrder,
    };
  }

  public static toPrismaCreateMany(
    postMediaList: PostMedia[]
  ): Prisma.PostMediaCreateManyInput[] {
    return postMediaList.map((postMedia) => ({
      postId: postMedia.postId!,
      mediaId: postMedia.mediaId,
      displayOrder: postMedia.displayOrder,
    }));
  }

  public static fromPrisma(prismaData: PostMediaJoinModel): PostMedia | null {
    if (!prismaData) return null;

    const mediaData = prismaData.Media;
    const rawSources = mediaData.sources as Record<string, any> | null;

    const sources: MediaSource | null = MediaSource.fromJSON(rawSources)
    if (!sources) return null;

    return new PostMedia({
      displayOrder: prismaData.displayOrder,
      mediaId: prismaData.mediaId,
      caption: mediaData.caption ?? "",
      postId: prismaData.postId,
      sources,
    });
  }

  public static fromPrismaMany(
    prismaDataArray: PostMediaJoinModel[]
  ): PostMedia[] {
    const postMedia: PostMedia[] = [];

    for (const prismaData of prismaDataArray) {
      const post = this.fromPrisma(prismaData);
      if (post) {
        postMedia.push(post);
      }
    }
    return postMedia;
  }
}

export { PostMediaAssembler };
