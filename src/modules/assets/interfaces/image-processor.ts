import {
  ImageFormats,
  ImageTransformConfig,
} from "../domain/object-values/image-media-source";

/* eslint-disable @typescript-eslint/no-namespace */
export namespace ImageProcessorTypes {
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

  abstract convert(buffer: Buffer, format: ImageFormats): Promise<Buffer>;

  abstract process(
    buffer: Buffer,
    config: ImageTransformConfig
  ): Promise<ImageProcessorTypes.TransformedImage[]>;
}
