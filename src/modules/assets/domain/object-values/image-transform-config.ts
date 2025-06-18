import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

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

  public getContentType(): string {
    switch (this.format) {
      case "webp":
        return "image/webp";
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      default:
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Unsupported image format`);
    }
  }
}
