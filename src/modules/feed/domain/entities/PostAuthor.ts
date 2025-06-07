import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { UserSummary } from "./UserSummary";

export class PostAuthor extends UserSummary {
  public constructor(args: NonFunctionProperties<PostAuthor>) {
    super(args);
  }
}
