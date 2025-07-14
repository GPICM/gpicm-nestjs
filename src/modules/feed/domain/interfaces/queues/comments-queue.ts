export type CommentsQueueDto = {
  postId: number;
  commentParentId?: number;
};

export abstract class CommentsQueue {
  abstract addCommentJob(dto: CommentsQueueDto): Promise<void>;
}
