import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export enum MediaSourceVariantKey {
  sm = "sm",
  md = "md",
  lg = "lg",
  base = "base",
}

export class MediaSourceVariant {
  public alias: string;
  public url: string;
  public size: number;
  public dimensions?: number;

  public constructor(args: NonFunctionProperties<MediaSource>) {
    Object.assign(this, args);
  }
}

export class MediaSource extends Map<
  MediaSourceVariantKey,
  MediaSourceVariant
> {}
