import {
  MediaSourceVariant,
  MediaSourceVariantKey,
} from "./media-source-variant";

export type RawMediaSourceObject = Partial<
  Record<MediaSourceVariantKey, Partial<MediaSourceVariant>>
>;

export class MediaSource extends Map<
  MediaSourceVariantKey,
  MediaSourceVariant
> {
  public getBase(): MediaSourceVariant | null {
    return this.get(MediaSourceVariantKey.base) || null;
  }

  public getVariant(desired: MediaSourceVariantKey): MediaSourceVariant | null {
    if (this.has(desired)) {
      return this.get(desired)!;
    }

    const order: MediaSourceVariantKey[] = [
      MediaSourceVariantKey.sm,
      MediaSourceVariantKey.md,
      MediaSourceVariantKey.lg,
    ];

    const desiredIndex = order.indexOf(desired);

    if (desiredIndex === -1) {
      // Fallback to 'base' or first available
      return this.getBase() || [...this.values()][0] || null;
    }

    // Try larger sizes
    for (let i = desiredIndex + 1; i < order.length; i++) {
      if (this.has(order[i])) return this.get(order[i])!;
    }

    // Try smaller sizes
    for (let i = desiredIndex - 1; i >= 0; i--) {
      if (this.has(order[i])) return this.get(order[i])!;
    }

    // Fallback to base or first available
    return this.getBase() || [...this.values()][0] || null;
  }

  public toJSON(): RawMediaSourceObject {
    const result: RawMediaSourceObject = {};
    for (const [key, variant] of this.entries()) {
      result[key] = {
        url: variant.url,
        size: variant.size,
        storageKey: variant.storageKey,
      };
    }

    return result;
  }

  /**
   * STATIC HELPERS
   **/

  public static fromJSON(
    entry: Record<string, unknown> | string | null
  ): MediaSource | null {
    if (!entry) return null;

    try {
      let parsed: RawMediaSourceObject;
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        parsed = typeof entry === "string" ? JSON.parse(entry) : entry;
      } catch (err) {
        console.warn("Failed to parse MediaSource JSON:", err);
        return null;
      }

      const mediaSource = new MediaSource();

      for (const [key, value] of Object.entries(parsed)) {
        if (!this.isMediaSourceVariantKey(key)) continue;

        if (
          value &&
          typeof value.url === "string" &&
          typeof value.size === "number" &&
          typeof value.storageKey === "string"
        ) {
          mediaSource.set(
            key,
            new MediaSourceVariant({
              url: value.url,
              size: value.size,
              storageKey: value.storageKey,
            })
          );
        }
      }

      if (mediaSource.size === 0) {
        return null;
      }

      return mediaSource;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      return null;
    }
  }

  private static isMediaSourceVariantKey(
    key: unknown
  ): key is MediaSourceVariantKey {
    return (
      typeof key === "string" &&
      Object.values(MediaSourceVariantKey).includes(
        key as MediaSourceVariantKey
      )
    );
  }
}
