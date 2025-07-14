/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { debounce } from "lodash";
import { PostCommentRepository } from "../domain/interfaces/repositories/post-comment-repository";
import { CommentsQueueDto } from "../domain/interfaces/queues/comments-queue";

@Processor("comments-events")
export class PostCommentsProcessor extends WorkerHost {
  private postsToUpdate = new Set<number>();
  private postsCommentsToUpdate = new Set<number>();
  private readonly debounceTimeMs = 2500;

  constructor(private readonly postCommentsRepository: PostCommentRepository) {
    super();
  }

  private debouncedAggregate = debounce(async () => {
    const postIds = Array.from(this.postsToUpdate);
    this.postsToUpdate.clear();

    for (const postId of postIds) {
      console.log(`Recomputing post comments count for post ${postId}`);
      await this.postCommentsRepository.refreshPostCommentsCount(postId);
    }
  }, this.debounceTimeMs);

  private debouncedRepliesCounter = debounce(async () => {
    const commentIds = Array.from(this.postsCommentsToUpdate);
    this.postsCommentsToUpdate.clear();

    for (const commentId of commentIds) {
      console.log(`Recomputing post comments replies. Comment: ${commentId}`);
      await this.postCommentsRepository.refreshPostCommentsRepliesCount(
        commentId
      );
    }
  }, this.debounceTimeMs);

  public async process(job: Job<CommentsQueueDto>) {
    this.postsToUpdate.add(job.data.postId);

    if (job.data.commentParentId) {
      this.postsCommentsToUpdate.add(job.data.commentParentId);
    }

    this.debouncedAggregate();
    this.debouncedRepliesCounter();
    return Promise.resolve();
  }
}
