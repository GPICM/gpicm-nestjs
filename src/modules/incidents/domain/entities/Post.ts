import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { Incident } from "./Incident";
import { PostAuthor } from "../object-values/post-author";

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
  public readonly id: number;

  public readonly title: string;

  public readonly slug: string;

  public readonly content: string;

  public readonly status: PostStatusEnum;

  public readonly type: PostTypeEnum;

  public readonly publishedAt: Date | null;

  public readonly author: PostAuthor;

  public readonly incident: Incident | null;

  constructor(args: NonFunctionProperties<Post>) {
    Object.assign(this, args);
  }
}
