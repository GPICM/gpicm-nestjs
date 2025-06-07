import { NonFunctionProperties } from "@/modules/shared/domain/protocols/non-function-properties";

export type VoteValue = 1 | -1;

export class PostVote {
  public readonly userId: number;

  public readonly postId: number;

  public readonly value: VoteValue;

  constructor(args: NonFunctionProperties<PostVote>) {
    if (args.value !== 1 && args.value !== -1) {
      throw new Error("value must be either 1 or -1");
    }

    Object.assign(this, args);
  }
}
