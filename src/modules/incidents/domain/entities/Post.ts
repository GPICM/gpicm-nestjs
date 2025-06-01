import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { Incident } from "./Incident";
import { AuthorSummary } from "../object-values/AuthorSumary";

export enum PostStatusEnum {
  PENDING = "PENDING",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum PostTypeEnum {
  GERARL = "RAW",
  INCIDENT = "INCIDENT",
}

export class Post {
  public readonly id: number | null;

  public readonly title: string;

  public readonly slug: string;

  public readonly content: string;

  public readonly status: PostStatusEnum;

  public readonly type: PostTypeEnum;

  public readonly publishedAt: Date | null;

  public readonly author: AuthorSummary;

  public readonly incident: Incident | null;

  public readonly countLikes: number;

  public readonly likedByCurrentUser?: boolean;

  constructor(args: NonFunctionProperties<Post>) {
    Object.assign(this, args);
  }

  public static createSlug(text: string): string {
    const sanitized = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100);

    return `${Date.now()}_${sanitized}`;
  }
}
