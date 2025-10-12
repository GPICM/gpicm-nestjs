import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { Post } from "./Post";
import { VoteValue } from "./PostVote";

export class ViewerPost<A = unknown> extends Post<A> {
  public readonly userId: number;
  public readonly profileId: number | null;

  public userVote: VoteValue;

  public constructor(
    args: NonFunctionProperties<Post<A>>,
    _userId: number,
    _vote: VoteValue,
    _profileId?: number
  ) {
    super(args);
    this.userId = _userId;
    this.profileId = _profileId || null;
    this.userVote = _vote ?? VoteValue.NULL;
  }

  public toggleVote(nextVote: VoteValue): VoteValue {
    const prevVote = this.userVote;
    const updatedVote = prevVote === nextVote ? 0 : nextVote;

    this.updateVoteCounts(prevVote, updatedVote);
    this.userVote = updatedVote;

    return updatedVote;
  }

  private updateVoteCounts(previous: VoteValue, next: VoteValue): void {
    if (previous === VoteValue.UP) this.upVotes--;
    if (previous === VoteValue.DOWN) this.downVotes--;

    if (next === VoteValue.UP) this.upVotes++;
    if (next === VoteValue.DOWN) this.downVotes++;

    this.score = this.upVotes - this.downVotes;
  }
}
