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

export const postInclude = Prisma.validator<Prisma.PostInclude>()({
  Incident: { include: { Author: true, IncidentType: true } },
  Votes: { select: { value: true, userId: true } },
  Author: true,
});

type PostJoinModel = Prisma.PostGetPayload<{
  include: typeof postInclude;
}>;

class PostAssembler {
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
      name: data.author_name ?? "Anônimo",
      profilePicture: data.author_profile_picture ?? "",
      publicId: data.author_public_id,
    });

    let attachment;
    let coverImageUrl = "";
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
        coverImageUrl = incident?.imageUrl ?? "";
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
        isPinned: !!data.is_pinned,
        isVerified: !!data.is_verified,
        coverImageUrl,
        address: locationAddress,
        location,
        author,
        attachment,
        medias: [],
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
