import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export enum MediaSourceVariantKey {
  sm = "sm",
  md = "md",
  lg = "lg",
  base = "base",
}

export class MediaSourceVariant {
  public url: string;
  public size: number;
  public storageKey: string;

  public constructor(args: NonFunctionProperties<MediaSourceVariant>) {
    Object.assign(this, args);
    this.validate();
  }

  private validate() {
    if (!this.url || typeof this.url !== "string") {
      throw new Error(`Invalid URL provided: ${this.url}`);
    }

    if (typeof this.size !== "number" || this.size <= 0) {
      throw new Error(`Size must be a positive number. Received: ${this.size}`);
    }

    if (!this.storageKey || typeof this.storageKey !== "string") {
      throw new Error(
        `storageKey must be a non-empty string. Received: ${this.storageKey}`
      );
    }
  }
}
