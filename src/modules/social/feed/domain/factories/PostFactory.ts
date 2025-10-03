/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Media, MediaTypeEnum } from "@/modules/assets/domain/entities/Media";
import { GeoPosition } from "@/modules/shared/domain/object-values/GeoPosition";
import { User } from "@/modules/identity/core/domain/entities/User";
import { randomUUID } from "crypto";
import { PostAuthor } from "../entities/PostAuthor";
import { Post, PostStatusEnum } from "../entities/Post";
import { CreatePostDto } from "../../presentation/dtos/create-post.dto";
import { PostMedia } from "../entities/PostMedia";
import { PostAttachment } from "../object-values/PostAttchment";
import { Incident } from "@/modules/incidents/domain/entities/Incident";
import { BadRequestException, Logger } from "@nestjs/common";

export class PostFactory {
  private static logger: Logger = new Logger(PostFactory.name);

  static createPost(user: User, dto: CreatePostDto, medias: Media[]): Post {
    const author = PostAuthor.fromUser(user);

    const postMedias = (medias ?? []).map((media, index) =>
      PostMedia.FromMedia(media, index)
    );

    let coverImageMedia: Media | null = null;
    if (medias.length) {
      coverImageMedia = this.getCoverImage(user, medias);
    }

    const coverImageSource = coverImageMedia ? coverImageMedia.sources : null;

    return new Post({
      id: null,
      author,
      title: dto.title,
      uuid: randomUUID(),
      content: dto.content,
      publishedAt: new Date(),
      status: PostStatusEnum.PUBLISHING,
      slug: Post.createSlug(user, dto.title),
      location: new GeoPosition(dto.latitude, dto.longitude),
      address: dto.address ?? "",
      isVerified: false,
      isPinned: false,
      type: dto.type,
      attachment: null,
      medias: postMedias,
      coverImageSource,
      // Meta
      coverImageUrl: "",
      thumbnailUrl: "",
      views: 0,
      downVotes: 0,
      upVotes: 0,
      comments: 0,
      score: 0,
      tags: [],
    });
  }

  static attachIncidentToPost(post: Post, incident: Incident) {
    post.setAttachment(new PostAttachment(incident.id, incident, "Incident"));
    post.setStatus(PostStatusEnum.PUBLISHED);
  }

  static getCoverImage(user: User, medias: Media[]): Media | null {
    try {
      this.logger.log("Searching for a cover image");
      let coverImageMedia: Media | null = null;

      for (const media of medias) {
        if (media.type === MediaTypeEnum.IMAGE) {
          coverImageMedia = media;
        }
      }

      return coverImageMedia;
    } catch (error: unknown) {
      this.logger.error("Missing medias", { error });
      throw new BadRequestException("Missing Media");
    }
  }
}
