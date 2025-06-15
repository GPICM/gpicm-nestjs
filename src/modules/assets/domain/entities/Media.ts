import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { MediaSource } from "../object-values/media-source";

export enum MediaStatusEnum {
  CREATED,
  UPLOADING,
  ACTIVE,
  FAILED,
  DELETED,
}

export enum MediaTypeEnum {
  IMAGE,
  AUDIO,
  DOCUMENT,
  OTHER,
}

export enum MediaScopeEnum {
  POSTS,
  USERS,
}

export enum MediaTargetEnum {
  POSTS_GENERIC_IMAGE,
  POSTS_GENERIC_AUDIO,
  POSTS_GENERIC_DOCUMENT,
  USERS_AVATAR,
}

export class Media {
  public readonly id: number | null;

  public readonly filename: string | null;

  public readonly contentType: string | null;

  public readonly altText: string | null;

  public readonly caption: string | null;

  public readonly order: number | null;

  public readonly target: MediaTargetEnum;

  public readonly type: MediaTypeEnum;

  public readonly scope: MediaScopeEnum;

  public readonly scopedId: number;

  public sources: MediaSource[] | null;

  public status: MediaStatusEnum;

  public constructor(args: NonFunctionProperties<Media>) {
    Object.assign(this, args);
  }

  public static createDraft(
    scope: MediaScopeEnum,
    scopedId: number,
    type: MediaTypeEnum,
    target: MediaTargetEnum
  ) {
    return new Media({
      id: null,
      order: null,
      caption: null,
      sources: null,
      altText: null,
      filename: null,
      contentType: null,
      type,
      scope,
      target,
      scopedId,
      status: MediaStatusEnum.CREATED,
    });
  }

  setSources(value: MediaSource[]) {
    this.sources = value;
  }

  setStatus(value: MediaStatusEnum) {
    this.status = value;
  }
}
