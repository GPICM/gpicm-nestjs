import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { Post } from "./Post";
import { VoteValue } from "./PostVote";

export class ViewerPost<A = unknown> extends Post<A> {
  public readonly userId: number;

  public readonly userVote: VoteValue | null;

  public constructor(
    args: NonFunctionProperties<Post<A>>,
    _userId: number,
    _vote?: VoteValue
  ) {
    super(args);
    this.userId = _userId;
    this.userVote = _vote ?? null;
  }
}
