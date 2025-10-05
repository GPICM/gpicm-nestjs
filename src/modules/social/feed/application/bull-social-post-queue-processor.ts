import { Processor } from "@nestjs/bullmq";
import { PostVotesRepository } from "../domain/interfaces/repositories/post-votes-repository";
import { BullQueueWorker } from "@/modules/shared/infra/bull-queue-worker";
import { AppQueueEvent } from "@/modules/shared/domain/interfaces/application-queue";
import {
  SOCIAL_POSTS_EVENTS_QUEUE_NAME,
  SocialPostEvent,
  SocialPostEventsQueueDto,
} from "../domain/interfaces/queues/social-post-events-queue";
import { RedisLockService } from "@/modules/shared/infra/lib/redis/redis-lock-service";
import { PostCommentRepository } from "../domain/interfaces/repositories/post-comment-repository";

type PostMetric = "score" | "comments";

type PostUpdateState = {
  metrics: Set<PostMetric>;
};

const eventMetricsMap: Record<SocialPostEvent, PostMetric[]> = {
  "post.voted": ["score"],
  "post.commented": ["score", "comments"],
  "post.uncommented": ["score", "comments"],
  "post.created": [],
  "post.viewed": [],
};

@Processor(SOCIAL_POSTS_EVENTS_QUEUE_NAME, {
  limiter: { max: 10, duration: 1000 },
})
export class PostScoreProcessor extends BullQueueWorker<
  SocialPostEvent,
  SocialPostEventsQueueDto
> {
  private postsToUpdate = new Map<number, PostUpdateState>();
  private flushTimeout?: NodeJS.Timeout;
  private readonly FLUSH_DELAY_MS = 2000;

  constructor(
    private readonly postVotesRepository: PostVotesRepository,
    private readonly postCommentsRepository: PostCommentRepository,
    private readonly redisLockService: RedisLockService
  ) {
    super();
  }

  protected async flushPostsUpdates() {
    const entries = Array.from(this.postsToUpdate.entries());

    if (entries.length === 0) {
      this.logger.debug("No pending post updates, ending flush cycle.");
      return;
    }

    this.logger.log(`Flushing ${entries.length} Post(s) updates...`);
    this.postsToUpdate.clear();

    for (const [postId, state] of entries) {
      const lock = await this.redisLockService.acquireLock(
        `Post:${postId}`,
        1000
      );
      if (!lock) continue;

      try {
        const metricsToUpdate = Array.from(state.metrics);

        if (metricsToUpdate.includes("comments")) {
          await this.postCommentsRepository.refreshPostCommentsCount(postId);
        }

        if (metricsToUpdate.includes("score")) {
          await this.postVotesRepository.refreshPostScore(postId);
        }

        console.log(`Post ${postId} refreshed metrics:`, metricsToUpdate);
      } catch (err) {
        console.error(`Failed updating Post ${postId}`, err);
      } finally {
        await this.redisLockService.releaseLock(lock);
      }
    }
  }

  private schedulePostUpdate(postId: number, metrics: PostMetric[]) {
    const existing = this.postsToUpdate.get(postId);
    if (existing) {
      metrics.forEach((m) => existing.metrics.add(m));
    } else {
      this.postsToUpdate.set(postId, { metrics: new Set(metrics) });
    }

    // Reset the debounce timer
    if (this.flushTimeout) clearTimeout(this.flushTimeout);

    this.flushTimeout = setTimeout(
      () => void this.flushPostsUpdates(),
      this.FLUSH_DELAY_MS
    );
  }

  async handle({
    event,
    data,
  }: AppQueueEvent<SocialPostEvent, SocialPostEventsQueueDto>) {
    const metrics = eventMetricsMap[event] ?? [];
    if (metrics.length > 0) {
      this.schedulePostUpdate(data.postId, metrics);
    }

    return Promise.resolve();
  }
}
