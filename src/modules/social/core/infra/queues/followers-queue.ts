export type VoteQueueDto = {
  postId: number;
};

export abstract class VoteQueue {
  abstract addVoteJob(dto: VoteQueueDto): Promise<void>;
}
