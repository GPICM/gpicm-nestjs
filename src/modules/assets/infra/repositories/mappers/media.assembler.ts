import {
  Media,
  MediaScopeEnum,
  MediaStatusEnum,
  MediaTargetEnum,
  MediaTypeEnum,
} from "@/modules/assets/domain/entities/Media";
import {
  MediaSourceVariantKey,
  MediaSource,
  MediaSourceVariant,
} from "@/modules/assets/domain/object-values/media-source";
import {
  Media as PrismaMedia,
  Prisma,
  MediaStatus as PrismaMediaStatus,
  MediaScope as PrismaMediaScope,
  MediaTarget as PrismaMediaTarget,
  MediaType as PrismaMediaType,
} from "@prisma/client";

class MediaAssembler {
  public static toPrismaCreate(media: Media): Prisma.MediaCreateInput {
    return {
      scopeId: media.scopeId,
      altText: media.altText ?? null,
      caption: media.caption ?? null,
      filename: media.filename ?? null,
      contentType: media.contentType ?? "",
      displayOrder: media.displayOrder ?? 0,
      type: media.type as unknown as PrismaMediaType,
      scope: media.scope as unknown as PrismaMediaScope,
      status: media.status as unknown as PrismaMediaStatus,
      target: media.target as unknown as PrismaMediaTarget,
      sources: (media.sources || undefined) as unknown as
        | Prisma.NullableJsonNullValueInput
        | Prisma.InputJsonValue
        | undefined,
    };
  }

  public static fromPrisma(prismaData?: PrismaMedia | null): Media | null {
    if (!prismaData) return null;

    const rawSources = prismaData.sources as Record<string, any> | null;

    let sources: MediaSource | null = null;
    if (rawSources) {
      sources = new MediaSource();

      for (const [key, value] of Object.entries(rawSources)) {
        sources.set(
          key as unknown as MediaSourceVariantKey,
          new MediaSourceVariant(value)
        );
      }
    }

    return new Media({
      id: prismaData.id,
      sources,
      altText: prismaData.altText,
      caption: prismaData.caption,
      contentType: prismaData.contentType,
      filename: prismaData.filename,
      displayOrder: prismaData.displayOrder,
      scopeId: prismaData.scopeId,
      scope: prismaData.scope as MediaScopeEnum,
      status: prismaData.status as MediaStatusEnum,
      target: prismaData.target as MediaTargetEnum,
      type: prismaData.type as MediaTypeEnum,
    });
  }
}

export { MediaAssembler };
