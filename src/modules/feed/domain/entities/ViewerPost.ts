import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { Post } from "./Post";
import { VoteValue } from "./PostVote";

export class ViewerPost<A = unknown> extends Post<A> {
  public readonly userId: number;

  public userVote: VoteValue | null;

  public constructor(
    args: NonFunctionProperties<Post<A>>,
    _userId: number,
    _vote?: VoteValue
  ) {
    super(args);
    this.userId = _userId;
    this.userVote = _vote ?? null;
  }

  public toggleVote(nextVote: VoteValue | null): VoteValue | null {
    const prevVote = this.userVote;
    const updatedVote = prevVote === nextVote ? null : nextVote;

    this.updateVoteCounts(prevVote, updatedVote);
    this.userVote = updatedVote;

    return updatedVote;
  }

  private updateVoteCounts(
    previous: VoteValue | null,
    next: VoteValue | null
  ): void {
    if (previous === 1) this.upVotes--;
    if (previous === -1) this.downVotes--;

    if (next === 1) this.upVotes++;
    if (next === -1) this.downVotes++;

    this.score = this.upVotes - this.downVotes;
  }
}
