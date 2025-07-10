/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { debounce } from "lodash";
import { VoteQueueDto } from "../domain/interfaces/queues/vote-queue";
import { PostCommentRepository } from "../domain/interfaces/repositories/post-comment-repository"; // TODO: substituir por repositorio de comentarios

@Processor("comments-events")
export class PostCommentsProcessor extends WorkerHost {
  private postsToUpdate = new Set<number>();
  private readonly debounceTimeMs = 500;

  constructor(private readonly postCommentsRepository: PostCommentRepository) {
    super();
  }

  private debouncedAggregate = debounce(async () => {
    const postIds = Array.from(this.postsToUpdate);
    this.postsToUpdate.clear();

    for (const postId of postIds) {
      console.log(`Recomputing post comments score for post ${postId}`);
      await this.postCommentsRepository.refreshPostCommentsCount(postId);
    }
  }, this.debounceTimeMs);

  public async process(job: Job<VoteQueueDto>) {
    this.postsToUpdate.add(job.data.postId);
    this.debouncedAggregate();
    return Promise.resolve();
  }
}
