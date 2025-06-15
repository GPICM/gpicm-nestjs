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
    format: "webp" | "jpeg" | "png"
  ): Promise<Buffer>;
}
