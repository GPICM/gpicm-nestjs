// infra/services/sharp-adapter.ts

import sharp from "sharp";
import { ImageProcessor } from "../interfaces/image-processor";

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
}
