import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { Post } from "./Post";
import { VoteValue } from "./PostVote";

export class UserPost<A> extends Post<A> {
  public readonly userId: number;

  public readonly vote?: VoteValue;

  public constructor(
    args: NonFunctionProperties<Post<A>>,
    _userId: number,
    _vote: VoteValue
  ) {
    super(args);
    this.userId = _userId;
    this.vote = _vote;
  }
}
