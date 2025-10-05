
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

type PostMetric = "score" | "comments" | "views";

type PostUpdateState = {
  metrics: Set<PostMetric>;
};

const eventMetricsMap: Record<SocialPostEvent, PostMetric[]> = {
  "post.viewed": ["views"],
  "post.voted": ["score"],
  "post.commented": ["score", "comments"],
  "post.uncommented": ["score", "comments"],
  "post.created": [],
};

const POST_UPDATE_INTERVAL_MS = 5000;

@Processor(SOCIAL_POSTS_EVENTS_QUEUE_NAME, {
  limiter: { max: 10, duration: 1000 },
})
export class PostScoreProcessor extends BullQueueWorker<
  SocialPostEvent,
  SocialPostEventsQueueDto
> {
  private postsToUpdate = new Map<number, PostUpdateState>();

  constructor(
    private readonly postVotesRepository: PostVotesRepository,
    private readonly redisLockService: RedisLockService
  ) {
    super(POST_UPDATE_INTERVAL_MS);
  }

  protected async performPendingFlush() {
    const entries = Array.from(this.postsToUpdate.entries());

    if (entries.length === 0) {
      this.logger.debug("No pending post updates, ending flush cycle.");
      this.endFlushCycle();
      return;
    }

    this.logger.log(`Flushing ${entries.length} Post(s) updates...`);
    this.postsToUpdate.clear(); // clear before processing to avoid double updates

    for (const [postId, state] of entries) {
      // Acquire Redis lock to prevent concurrent updates

      const lock = await this.redisLockService.acquireLock(
        `Post:${postId}`,
        1000
      );
      if (!lock) continue;

      try {
        const metricsToUpdate = Array.from(state.metrics);

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
      return;
    }

    const metricsSet = new Set(metrics);
    this.postsToUpdate.set(postId, { metrics: metricsSet });
  }

  async handle({
    event,
    data,
  }: AppQueueEvent<SocialPostEvent, SocialPostEventsQueueDto>) {
    const metrics = eventMetricsMap[event] ?? [];
    if (metrics.length > 0) {
      this.schedulePostUpdate(data.postId, metrics);
      this.beginFlushCycle();
    }

    return Promise.resolve()l
  }
}
