import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { MediaSource } from "@/modules/assets/domain/object-values/media-source";

export class PostMedia {
  public mediaId: string;
  public displayOrder: number;
  public postId: number | null;
  public sources: MediaSource | null;
  public caption: string | null;

  constructor(args: NonFunctionProperties<PostMedia>) {
    Object.assign(this, args);
  }

  public static Create(mediaId: string, index?: number): PostMedia {
    return new PostMedia({
      mediaId: mediaId,
      displayOrder: index || 0,
      caption: null,
      postId: null,
      sources: null,
    });
  }

  public setPostId(p: number) {
    this.postId = p;
  }
}
