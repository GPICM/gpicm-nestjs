import { MediaSource } from "@/modules/assets/domain/object-values/media-source";
import { MediaSourceVariantKey } from "@/modules/assets/domain/object-values/media-source-variant";

export class UserAvatar {
  public avatarUrl: string = "";

  public imageSource: MediaSource;

  constructor(imageSource: MediaSource) {
    this.imageSource = imageSource;

    this.avatarUrl =
      imageSource?.getVariant(MediaSourceVariantKey.sm)?.url || "";
  }

  public getAvatarUrl(): string {
    return this.avatarUrl;
  }

  public getImageSource(): MediaSource {
    return this.imageSource;
  }
}
