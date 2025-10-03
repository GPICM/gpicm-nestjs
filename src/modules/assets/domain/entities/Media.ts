import { uuidv7 } from "uuidv7";
import { createHash, randomBytes } from "crypto";

import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { formatDateToNumber } from "@/modules/shared/utils/date-utils";
import { User } from "@/modules/identity/core/domain/entities/User";

import { MediaSource } from "../object-values/media-source";

export enum MediaStatusEnum {
  CREATED = "CREATED",
  UPLOADING = "UPLOADING",
  ACTIVE = "ACTIVE",
  FAILED = "FAILED",
  DELETED = "DELETED",
}

export enum MediaStorageProviderEnum {
  S3 = "S3",
  LOCAL = "LOCAL",
}

export enum MediaTypeEnum {
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
  OTHER = "OTHER",
}

export class Media {
  public readonly id: string;

  public readonly type: MediaTypeEnum;

  public filename: string;

  public altText: string | null;

  public caption: string | null;

  public contentType: string;

  public sources: MediaSource | null;

  public status: MediaStatusEnum;

  public ownerId: number;

  public storageProvider: MediaStorageProviderEnum | null;

  public constructor(args: NonFunctionProperties<Media>) {
    Object.assign(this, args);
  }

  public static Create(
    user: User,
    type: MediaTypeEnum,
    contentType: string,
    cap?: string,
    altText?: string
  ) {
    const numericDate = formatDateToNumber(new Date());

    const fileNameHash = createHash("sha256")
      .update(user.publicId)
      .update(Date.now().toString())
      .update(randomBytes(6).toString("hex"))
      .digest("hex");

    const resolvedFileName = `${type.toLowerCase()}/${fileNameHash}${numericDate}`;

    return new Media({
      id: uuidv7(),
      type,
      contentType,
      sources: null,
      caption: cap || null,
      altText: altText || null,
      ownerId: user.id,
      filename: resolvedFileName,
      status: MediaStatusEnum.CREATED,
      storageProvider: null,
    });
  }

  public setSources(value: MediaSource | null) {
    this.sources = value;
  }

  public setStatus(value: MediaStatusEnum) {
    this.status = value;
  }

  public setContentType(newContentType: string) {
    this.contentType = newContentType;
  }

  public startUpload(sp: MediaStorageProviderEnum) {
    if (this.status !== MediaStatusEnum.CREATED)
      throw new Error("Cannot upload this media");

    this.status = MediaStatusEnum.UPLOADING;
    this.storageProvider = sp;
  }
}
