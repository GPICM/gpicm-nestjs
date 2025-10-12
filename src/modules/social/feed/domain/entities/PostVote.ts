import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";
import { ProfileSummary } from "../object-values/ProfileSummary";

export enum VoteValue {
  UP = 1,
  DOWN = -1,
  NULL = 0,
}

export class PostVote {
  public readonly postId: number;

  public readonly value: VoteValue;

  public readonly profile: ProfileSummary;

  constructor(args: NonFunctionProperties<PostVote>) {
    if (args.value !== VoteValue.UP && args.value !== VoteValue.DOWN) {
      throw new Error("value must be either 1 or -1");
    }

    Object.assign(this, args);
  }
}
