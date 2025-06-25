import {
  Media,
  MediaStatusEnum,
  MediaStorageProviderEnum,
  MediaTypeEnum,
} from "@/modules/assets/domain/entities/Media";
import { MediaSource } from "@/modules/assets/domain/object-values/media-source";
import {
  Media as PrismaMedia,
  Prisma,
  MediaStatus as PrismaMediaStatus,
  MediaType as PrismaMediaType,
} from "@prisma/client";

class MediaAssembler {
  public static toPrismaCreate(media: Media): Prisma.MediaCreateInput {
    return {
      id: media.id,
      altText: media.altText ?? null,
      caption: media.caption ?? null,
      filename: media.filename ?? null,
      contentType: media.contentType ?? "",
      type: media.type as unknown as PrismaMediaType,
      status: media.status as unknown as PrismaMediaStatus,
      sources: (media.sources || undefined) as unknown as
        | Prisma.NullableJsonNullValueInput
        | Prisma.InputJsonValue
        | undefined,
      storageProvider: media.storageProvider!,
      Owner: {
        connect: {
          id: media.ownerId,
        },
      },
    };
  }

  public static fromPrisma(prismaData?: PrismaMedia | null): Media | null {
    if (!prismaData) return null;

    const rawSources = prismaData.sources as Record<string, unknown> | null;

    const sources = MediaSource.fromJSON(rawSources);

    return new Media({
      id: prismaData.id,
      sources,
      altText: prismaData.altText,
      caption: prismaData.caption,
      contentType: prismaData.contentType,
      filename: prismaData.filename,
      storageProvider: prismaData.storageProvider as MediaStorageProviderEnum,
      status: prismaData.status as MediaStatusEnum,
      type: prismaData.type as MediaTypeEnum,
      ownerId: prismaData.ownerId,
    });
  }

  public static fromPrismaMany(
    prismaDataArray?: (PrismaMedia | null | undefined)[]
  ): Media[] {
    if (!prismaDataArray || prismaDataArray.length === 0) return [];

    return prismaDataArray
      .map((item) => this.fromPrisma(item))
      .filter((media): media is Media => media !== null);
  }
}

export { MediaAssembler };
