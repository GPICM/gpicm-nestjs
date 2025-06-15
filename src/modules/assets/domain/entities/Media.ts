import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { MediaSource } from "../object-values/media-source";

export enum MediaStatusEnum {
  CREATED = "CREATED",
  UPLOADING = "UPLOADING",
  ACTIVE = "ACTIVE",
  FAILED = "FAILED",
  DELETED = "DELETED",
}

export enum MediaTypeEnum {
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
  DOCUMENT = "DOCUMENT",
  OTHER = "OTHER",
}

export enum MediaScopeEnum {
  POSTS = "POSTS",
  USERS = "USERS",
}

export enum MediaTargetEnum {
  POSTS_GENERIC_IMAGE = "POSTS_GENERIC_IMAGE",
  POSTS_GENERIC_AUDIO = "POSTS_GENERIC_AUDIO",
  POSTS_GENERIC_DOCUMENT = "POSTS_GENERIC_DOCUMENT",
  USERS_AVATAR = "USERS_AVATAR",
}

export class Media {
  public readonly id: number | null;

  public readonly filename: string | null;

  public readonly contentType: string | null;

  public readonly altText: string | null;

  public readonly caption: string | null;

  public readonly target: MediaTargetEnum;

  public readonly type: MediaTypeEnum;

  public readonly scope: MediaScopeEnum;

  public readonly scopeId: number;

  public readonly displayOrder: number = 0;

  public sources: MediaSource | null;

  public status: MediaStatusEnum;

  public constructor(args: NonFunctionProperties<Media>) {
    Object.assign(this, args);
  }

  public static createDraft(
    scope: MediaScopeEnum,
    scopeId: number,
    type: MediaTypeEnum,
    target: MediaTargetEnum
  ) {
    return new Media({
      id: null,
      caption: null,
      sources: null,
      altText: null,
      filename: null,
      contentType: null,
      type,
      scope,
      target,
      scopeId,
      displayOrder: 0,
      status: MediaStatusEnum.CREATED,
    });
  }

  setSources(value: MediaSource | null) {
    this.sources = value;
  }

  setStatus(value: MediaStatusEnum) {
    this.status = value;
  }
}
