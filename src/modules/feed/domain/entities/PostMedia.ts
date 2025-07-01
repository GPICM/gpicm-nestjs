import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { MediaSource } from "@/modules/assets/domain/object-values/media-source";
import { Media } from "@/modules/assets/domain/entities/Media";

export class PostMedia {
  public mediaId: string;
  public postId: number;
  public caption: string;
  public altText: string;
  public contentType: string;
  public displayOrder: number;
  public sources: MediaSource | null;

  constructor(args: NonFunctionProperties<PostMedia>) {
    Object.assign(this, args);
  }

  public static FromMedia(
    media: Media,
    postId: number,
    index?: number
  ): PostMedia {
    if (!media.sources || !media.contentType) {
      throw new Error("invalid media");
    }

    return new PostMedia({
      postId,
      mediaId: media.id,
      displayOrder: index || 0,
      caption: media.caption || "",
      altText: media.altText || "",
      sources: media.sources || null,
      contentType: media.contentType,
    });
  }

  public setPostId(p: number) {
    this.postId = p;
  }
}
