import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export enum MediaStatus {
  CREATED,
  UPLOADING,
  ACTIVE,
  FAILED,
  DELETED,
}

export enum MediaStorage {
  LOCAL,
  S3,
  OTHER,
}

export enum MediaScope {
  POSTS,
  USERS,
}

export enum MediaTarget {
  POSTS_GENERIC_IMAGE,
  POSTS_GENERIC_AUDIO,
  POSTS_GENERIC_DOCUMENT,
  USERS_AVATAR,
}

export class Media {
  public readonly id: number | null;

  public readonly sources: MediaSource[] | null;

  public readonly filename: string | null;

  public readonly contentType: string | null;

  public readonly altText: string | null;

  public readonly caption: string | null;

  public readonly order: number | null;

  public readonly target: MediaTarget;

  public readonly provider: MediaStorage | null;

  public readonly status: MediaStatus;

  public scope: MediaScope;

  public scopedId: number;

  public constructor(args: NonFunctionProperties<Media>) {
    Object.assign(this, args);
  }

  public static createDraft(
    scope: MediaScope,
    scopedId: number,
    target: MediaTarget
  ) {
    return new Media({
      id: null,
      altText: null,
      caption: null,
      contentType: null,
      filename: null,
      order: null,
      provider: null,
      scope,
      scopedId,
      sources: null,
      status: MediaStatus.CREATED,
      target,
    });
  }
}
