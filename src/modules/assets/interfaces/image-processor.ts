import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

/* eslint-disable @typescript-eslint/no-namespace */
export namespace ImageProcessorTypes {
  export type ImageFormats = "webp" | "jpeg" | "png";

  export interface ImageDim {
    width: number;
    height: number;
  }

  export class ImageTransformConfig {
    format: ImageFormats;
    sizes: {
      maxWidth?: number;
      maxHeight?: number;
      dimension?: ImageDim;
      alias: string;
    }[];

    constructor(args: NonFunctionProperties<ImageTransformConfig>) {
      Object.assign(this, args);
    }
  }

  export type TransformedImage = {
    buffer: Buffer;
    alias: string;
  };
}

export abstract class ImageProcessor {
  abstract resize(
    buffer: Buffer,
    width: number,
    height: number
  ): Promise<Buffer>;

  abstract scale(
    buffer: Buffer,
    maxWidth?: number,
    maxHeight?: number
  ): Promise<Buffer>;

  abstract convert(
    buffer: Buffer,
    format: ImageProcessorTypes.ImageFormats
  ): Promise<Buffer>;

  abstract process(
    buffer: Buffer,
    config: ImageProcessorTypes.ImageTransformConfig
  ): Promise<ImageProcessorTypes.TransformedImage[]>;
}
