import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { User } from "@/modules/identity/domain/entities/User";

import { PostAuthor } from "./PostAuthor";
import { PostAttachment } from "../object-values/PostAttchment";
import { formatDateToNumber } from "@/modules/shared/utils/date-utils";
import { GeoPosition } from "@/modules/shared/domain/object-values/GeoPosition";
import { PostMedia } from "./PostMedia";
import { MediaSource } from "@/modules/assets/domain/object-values/media-source";

export enum PostStatusEnum {
  DRAFT = "DRAFT",
  PUBLISHING = "PUBLISHING",
  PUBLISHED = "PUBLISHED",
  UNLISTED = "UNLISTED",
  ARCHIVED = "ARCHIVED",
}

export enum PostTypeEnum {
  GERARL = "RAW",
  INCIDENT = "INCIDENT",
}

export class Post<A = unknown> {
  public id: number | null;

  public readonly uuid: string;

  public readonly slug: string;

  public readonly title: string;

  public readonly content: string;

  public readonly location: GeoPosition | null;

  public readonly address: string;

  public readonly author: PostAuthor;

  public readonly type: PostTypeEnum;

  public readonly isPinned?: boolean;

  public readonly isVerified?: boolean;

  public readonly coverImageUrl: string = "";

  public readonly thumbnailUrl: string = "";

  public readonly publishedAt: Date | null;

  public coverImageSource: MediaSource | null;

  public status: PostStatusEnum;

  public attachment: PostAttachment<A> | null;

  public upVotes: number;

  public downVotes: number;

  public comments: number;

  public score: number;

  public views: number;

  public medias?: PostMedia[];

  public tags: string[] = [];

  constructor(args: NonFunctionProperties<Post<A>>) {
    Object.assign(this, args);
  }

  public setAttachment(newAttachment: PostAttachment<A>): void {
    this.attachment = newAttachment;
  }

  public setTags(tags: string[]): void {
    this.tags = tags;
  }

  public setStatus(newStatus: PostStatusEnum): void {
    this.status = newStatus;
  }

  public setId(newId: number): void {
    if (this.id === null) {
      this.id = newId;

      if (this.medias?.length) {
        this.medias.forEach((media) => {
          media.setPostId(newId);
        });
      }
    }
  }

  public setMedias(postMedias: PostMedia[]): void {
    this.medias = postMedias;
  }

  public getMedias(): PostMedia[] | null {
    return this.medias || null;
  }

  public static createSlug(user: User, text: string): string {
    const sanitized = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100);

    const numericDate = formatDateToNumber(new Date());

    return `${sanitized}_${numericDate}_${user.publicId.slice(0, 6)}`;
  }
}
