import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { MediaSource } from "@/modules/assets/domain/object-values/media-source";

export class PostMedia {
  public postId: number;
  public mediaId: string;
  public displayOrder: number;
  public sources: MediaSource | null;
  public caption: string | null;

  constructor(args: NonFunctionProperties<PostMedia>) {
    Object.assign(this, args);
  }
}
