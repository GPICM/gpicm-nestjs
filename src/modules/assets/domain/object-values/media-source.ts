import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export enum MediaSourceVariantKey {
  sm = "sm",
  md = "md",
  lg = "lg",
  base = "base",
}

export class MediaSourceVariant {
  public url: string;
  public size?: number;
  public dimensions?: number;

  public constructor(args: NonFunctionProperties<MediaSourceVariant>) {
    Object.assign(this, args);
  }
}

export class MediaSource extends Map<
  MediaSourceVariantKey,
  MediaSourceVariant
> {
  public toJSON(): Record<
    MediaSourceVariantKey,
    NonFunctionProperties<MediaSourceVariant>
  > {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result: Record<
      MediaSourceVariantKey,
      NonFunctionProperties<MediaSourceVariant>
    > = {} as any;

    for (const [key, variant] of this.entries()) {
      result[key] = {
        url: variant.url,
        size: variant.size,
        dimensions: variant.dimensions,
      };
    }

    return result;
  }
}
