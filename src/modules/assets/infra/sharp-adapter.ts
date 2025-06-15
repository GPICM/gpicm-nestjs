// infra/services/sharp-adapter.ts

import sharp from "sharp";
import {
  ImageProcessor,
  ImageProcessorTypes,
} from "../interfaces/image-processor";
import { ImageTransformConfig } from "../domain/object-values/image-transform-config";

export class SharpAdapter implements ImageProcessor {
  public scale(
    buffer: Buffer,
    maxWidth?: number,
    maxHeight?: number
  ): Promise<Buffer> {
    if (!maxWidth && !maxHeight) {
      throw new Error("At least one dimension must be provided to scale()");
    }
    return sharp(buffer)
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();
  }

  public resize(
    buffer: Buffer,
    width: number,
    height: number
  ): Promise<Buffer> {
    return sharp(buffer)
      .resize(width, height, {
        fit: "cover",
      })
      .toBuffer();
  }

  public convert(
    buffer: Buffer,
    format: "webp" | "jpeg" | "png"
  ): Promise<Buffer> {
    return sharp(buffer)[format]().toBuffer();
  }

  async process(
    buffer: Buffer,
    config: ImageTransformConfig
  ): Promise<ImageProcessorTypes.TransformedImage[]> {
    const { format, sizes } = config;
    const results: ImageProcessorTypes.TransformedImage[] = [];

    for (const size of sizes) {
      let resized: Buffer;

      if (size.dimension) {
        resized = await this.resize(
          buffer,
          size.dimension.width,
          size.dimension.height
        );
      } else if (size.maxWidth || size.maxHeight) {
        resized = await this.scale(buffer, size.maxWidth, size.maxHeight);
      } else {
        throw new Error(
          `No valid resizing config provided for alias "${size.alias}"`
        );
      }

      const converted = await this.convert(resized, format);

      results.push({
        buffer: converted,
        alias: size.alias,
      });
    }

    return results;
  }
}
