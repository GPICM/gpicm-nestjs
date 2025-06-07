import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { User } from "@/modules/identity/domain/entities/User";

import { PostAuthor } from "./PostAuthor";
import { PostAttachment } from "../object-values/PostAttchment";
import { randomUUID } from "crypto";
import { Media } from "@/modules/assets/domain/entities/Media";

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
  public readonly id: number | null;

  public readonly title: string;

  public readonly slug: string;

  public readonly content: string;

  public readonly status: PostStatusEnum;

  public readonly publishedAt: Date | null;

  public readonly author: PostAuthor;

  public readonly type: PostTypeEnum;

  public readonly attachment: PostAttachment<A> | null;

  public readonly upVotes: number;

  public readonly downVotes: number;

  public readonly score: number;

  public readonly isPinned?: boolean;

  public readonly isVerified?: boolean;

  public readonly coverImageUrl?: string;

  public readonly medias?: PostMedia[];

  constructor(args: NonFunctionProperties<Post<A>>) {
    Object.assign(this, args);
  }

  public static createSlug(user: User, text: string): string {
    const sanitized = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100);

    return `${user.publicId}_${sanitized}_${randomUUID()}`;
  }
}

export class UserPost<A = unknown> extends Post<A> {
  public readonly userId: number;

  public readonly liked?: boolean;

  public constructor(
    args: NonFunctionProperties<Post<A>>,
    _userId: number,
    _liked: boolean
  ) {
    super(args);
    this.userId = _userId;
    this.liked = _liked;
  }
}

export class PostMedia extends Media {
  public constructor(args: NonFunctionProperties<Media>) {
    super(args);
  }
}
