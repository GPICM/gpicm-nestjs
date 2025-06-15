import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { MediaSource } from "./media-source";

export type ImageFormats = "webp" | "jpeg" | "png";

export class ImageTransformConfig {
  format: ImageFormats;
  sizes: {
    alias: string;
    maxWidth?: number;
    maxHeight?: number;
    dimension?: { width: number; height: number };
  }[];

  constructor(args: NonFunctionProperties<ImageTransformConfig>) {
    Object.assign(this, args);
  }
}

export class ImageMediaSource extends MediaSource {
  public dimensions: number;

  public transformation: ImageTransformConfig;

  public constructor(args: NonFunctionProperties<MediaSource>) {
    super(args);
  }
}
