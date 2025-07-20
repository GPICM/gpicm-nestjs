/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Prisma, PostStatus, PostType } from "@prisma/client";

import { Post, PostStatusEnum, PostTypeEnum } from "../../domain/entities/Post";
import { PostAuthor } from "../../domain/entities/PostAuthor";
import { PostAttachment } from "../../domain/object-values/PostAttchment";
import { ViewerPost } from "../../domain/entities/ViewerPost";
import { VoteValue } from "../../domain/entities/PostVote";
import {
  IncidentQueryData,
  LocationObjectQueryData,
  PostRawQuery,
  VoteQueryData,
} from "../dto/post-raw-query";
import { IncidentShallow } from "../../domain/entities/IncidentShallow";
import { GeoPosition } from "@/modules/shared/domain/object-values/GeoPosition";
import { MediaSource } from "@/modules/assets/domain/object-values/media-source";
import { MediaSourceVariantKey } from "@/modules/assets/domain/object-values/media-source-variant";

class PostAssembler {
  public static toPrismaUpdate(post: Post): Prisma.PostUpdateInput {
    return {
      status: post.status as PostStatus,
      isPinned: post.isPinned || false,
      isVerified: post.isVerified || false,
      downVotes: post.downVotes,
      upVotes: post.upVotes,
      commentsCount: post.comments,
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

  public static toSqlInsert(post: Post): string {
    const { address, location, coverImageSource } = post;

    // Construct the POINT value as a WKT (Well-Known Text) string
    const pointWKT = location
      ? `ST_GeomFromText('POINT(${location.longitude} ${location.latitude})', 4326)`
      : "NULL";

    // Format the publishedAt date to ISO string or set to NULL
    const publishedAtValue = post.publishedAt
      ? `'${post.publishedAt.toISOString().slice(0, 19).replace("T", " ")}'`
      : "NULL";

    const coverImageSourceJSON: string | null = coverImageSource
      ? JSON.stringify(coverImageSource.toJSON())
      : null;

    const tagsJSON: string | null = post.tags?.length
      ? JSON.stringify(post.tags)
      : null;

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
        comments_count,
        score,
        location_address,
        author_id,
        location,
        cover_image_sources,
        tags
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
          ${post.comments ?? 0},
          ${post.score ?? 0},
          ${post.address ? `'${escapeString(address)}'` : "NULL"},
          '${post.author.id}',
          ${pointWKT},
          ${coverImageSourceJSON ? `'${escapeString(coverImageSourceJSON)}'` : "NULL"},
          ${tagsJSON ? `'${escapeString(tagsJSON)}'` : "NULL"}
        );
    `;

    return sql.trim();
  }

  public static fromSqlSelect(
    sqlData: PostRawQuery[],
    userId: number
  ): ViewerPost | null {
    const data = sqlData?.[0];
    if (!data) return null;

    const author = new PostAuthor({
      id: data.author_id,
      name: data.author_name || "Anônimo",
      avatarUrl: data.author_avatar_url || "",
      publicId: data.author_public_id,
    });

    let attachment;
    if (data.type == PostType.INCIDENT && data.incident_obj) {
      const parsedIncident = JSON.parse(data.incident_obj) as IncidentQueryData;

      const incident = new IncidentShallow({
        id: parsedIncident.id,
        imageUrl: parsedIncident?.image_url ?? "",
        incidentDate: new Date(parsedIncident.incident_date),
        incidentTypeSlug: parsedIncident?.incident_type_slug,
      });
      if (incident) {
        attachment = new PostAttachment(incident?.id, incident, "Incident");
      }
    }

    let voteValue = VoteValue.NULL;
    if (data.vote_obj) {
      const parsedVote = JSON.parse(data.vote_obj) as VoteQueryData;
      voteValue = parsedVote.value ?? VoteValue.NULL;
    }

    let upVotes = Number(data.up_votes);
    let downVotes = Number(data.down_votes);
    const score = Number(data.score);

    // Optimistic vote adjustment:
    // If the user has voted but the vote counts (upVotes and downVotes) have not yet been updated (still zero),
    // simulate the vote locally by incrementing the appropriate count.
    if (voteValue !== VoteValue.NULL) {
      if (voteValue === VoteValue.UP && upVotes === 0) {
        upVotes += 1;
      } else if (voteValue === VoteValue.DOWN && downVotes === 0) {
        downVotes += 1;
      }
    }

    let location: GeoPosition | null = null;
    const locationAddress = data.location_address ?? "";
    if (data.location_obj) {
      location = this.parseLocationObjectToGeoPosition(data.location_obj);
    }

    let coverImageUrl = "";
    let thumbnailUrl = "";
    const coverImageSource = MediaSource.fromJSON(data.cover_image_sources);

    if (coverImageSource) {
      coverImageUrl =
        coverImageSource?.getVariant(MediaSourceVariantKey.lg)?.url || "";

      thumbnailUrl =
        coverImageSource?.getVariant(MediaSourceVariantKey.md)?.url || "";
    }

    return new ViewerPost(
      {
        id: data.id,
        uuid: data.uuid,
        slug: data.slug,
        title: data.title,
        type: data.type as PostTypeEnum,
        status: data.status as PostStatusEnum,
        content: data.content,
        publishedAt: new Date(data.published_at),
        score,
        upVotes: upVotes,
        downVotes: downVotes,
        comments: data.comments_count,
        views: data.views,
        isPinned: !!data.is_pinned,
        isVerified: !!data.is_verified,
        coverImageUrl,
        address: locationAddress,
        coverImageSource: null,
        thumbnailUrl,
        location,
        author,
        attachment,
        medias: [],
        tags: [],
      },
      userId,
      voteValue
    );
  }

  public static fromSqlMany(
    sqlDataArray: PostRawQuery[],
    userId: number
  ): ViewerPost[] {
    const posts: ViewerPost[] = [];
    for (const sqlData of sqlDataArray) {
      const post = this.fromSqlSelect([sqlData], userId);
      if (post) {
        posts.push(post);
      }
    }
    return posts;
  }

  public static parseLocationObjectToGeoPosition(
    locationObjectJson: string
  ): GeoPosition | null {
    try {
      const parsedLocation = JSON.parse(
        locationObjectJson
      ) as LocationObjectQueryData;

      return new GeoPosition(parsedLocation.latitude, parsedLocation.longitude);
    } catch (error: unknown) {
      console.error("Failed to parse MySQL Point to GeoLocation", { error });
      return null;
    }
  }
}

export { PostAssembler };
