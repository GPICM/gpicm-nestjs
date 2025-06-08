import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { UserShallow } from "./UserShallow";

export class PostAuthor extends UserShallow {
  public constructor(args: NonFunctionProperties<PostAuthor>) {
    super(args);
  }
}
