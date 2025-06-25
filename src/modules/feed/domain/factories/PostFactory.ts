/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Media } from "@/modules/assets/domain/entities/Media";
import { GeoPosition } from "@/modules/shared/domain/object-values/GeoPosition";
import { User } from "@/modules/identity/domain/entities/User";
import { randomUUID } from "crypto";
import { PostAuthor } from "../entities/PostAuthor";
import { Post, PostStatusEnum } from "../entities/Post";
import { CreatePostDto } from "../../presentation/dtos/create-post.dto";
import { PostMedia } from "../entities/PostMedia";
import { PostAttachment } from "../object-values/PostAttchment";
import { Incident } from "@/modules/incidents/domain/entities/Incident";

export class PostFactory {
  static createPost(
    user: User,
    dto: CreatePostDto,
    coverImageMedia?: Media | null
  ): Post {
    const author = new PostAuthor({
      id: user.id!,
      name: user.name ?? "Anonimo",
      profilePicture: user?.profilePicture ?? "",
      publicId: user?.publicId,
    });

    const postMedias = dto.mediaIds.map((mediaId, index) =>
      PostMedia.Create(mediaId, index)
    );

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
      score: 0,
    });
  }

  static attachIncidentToPost(post: Post, incident: Incident) {
    post.setAttachment(new PostAttachment(incident.id, incident, "Incident"));
    post.setStatus(PostStatusEnum.PUBLISHED);
  }
}
