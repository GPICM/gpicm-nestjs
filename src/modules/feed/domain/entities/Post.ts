import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { User } from "@/modules/identity/domain/entities/User";

import { PostAuthor } from "./PostAuthor";
import { PostAttachment } from "../object-values/PostAttchment";
import { Media } from "@/modules/assets/domain/entities/Media";
import { formatDateToNumber } from "@/modules/shared/utils/date-utils";

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

  public readonly title: string;

  public readonly slug: string;

  public readonly uuid: string;

  public readonly content: string;

  public status: PostStatusEnum;

  public readonly publishedAt: Date | null;

  public readonly author: PostAuthor;

  public readonly type: PostTypeEnum;

  public attachment: PostAttachment<A> | null;

  public upVotes: number;

  public downVotes: number;

  public score: number;

  public readonly isPinned?: boolean;

  public readonly isVerified?: boolean;

  public readonly coverImageUrl?: string;

  public readonly medias?: PostMedia[];

  constructor(args: NonFunctionProperties<Post<A>>) {
    Object.assign(this, args);
  }

  public setAttachment(newAttachment: PostAttachment<A>): void {
    this.attachment = newAttachment;
  }

  public setStatus(newStatus: PostStatusEnum): void {
    this.status = newStatus;
  }

  public setId(newId: number): void {
    if (this.id === null) {
      this.id = newId;
    }
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

export class PostMedia extends Media {
  public constructor(args: NonFunctionProperties<Media>) {
    super(args);
  }
}
