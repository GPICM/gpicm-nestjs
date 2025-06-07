import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { MediaTypeEnum } from "../enum/media-type-enum";

export class Media {
  public readonly Id: number;

  public readonly order: number;

  public readonly url: string;

  public readonly filename: string;

  public readonly contentType: string;

  public readonly size: number | null;

  public readonly type: MediaTypeEnum;

  public constructor(args: NonFunctionProperties<Media>) {
    Object.assign(this, args);
  }
}
