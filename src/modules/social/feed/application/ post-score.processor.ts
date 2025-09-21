/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { debounce } from "lodash";
import { VoteQueueDto } from "../domain/interfaces/queues/vote-queue";
import { PostVotesRepository } from "../domain/interfaces/repositories/post-votes-repository";

@Processor("vote-events")
export class PostScoreProcessor extends WorkerHost {
  private postsToUpdate = new Set<number>();
  private readonly debounceTimeMs = 500;

  constructor(private readonly postVotesRepository: PostVotesRepository) {
    super();
  }

  private debouncedAggregate = debounce(async () => {
    const postIds = Array.from(this.postsToUpdate);
    this.postsToUpdate.clear();

    for (const postId of postIds) {
      console.log(`Recomputing score for post ${postId}`);
      await this.postVotesRepository.refreshPostScore(postId);
    }
  }, this.debounceTimeMs);

  public async process(job: Job<VoteQueueDto>) {
    if (job.name === "postVoteCreated") {
      this.postsToUpdate.add(job.data.postId);
      this.debouncedAggregate();
    }
    return Promise.resolve();
  }
}
