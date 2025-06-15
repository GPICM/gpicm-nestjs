import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export class MediaSource {
  public alias: string;
  public url: string;
  public size: number;
  public dimensions?: number;

  public constructor(args: NonFunctionProperties<MediaSource>) {
    Object.assign(this, args);
  }
}
