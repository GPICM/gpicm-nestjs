export type VoteQueueDto = {
  postId: string;
};

export interface VoteQueue {
  addVoteJob(dto: VoteQueueDto): Promise<void>;
}
