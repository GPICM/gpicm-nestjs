import { Processor } from "@nestjs/bullmq";

import { BullQueueWorker } from "@/modules/shared/infra/bull-queue-worker";
import { AppQueueEvent } from "@/modules/shared/domain/interfaces/application-queue";

import { RedisLockService } from "@/modules/shared/infra/lib/redis/redis-lock-service";

import { PostCommentRepository } from "../../domain/interfaces/repositories/post-comment-repository";
import {
  SocialPostQueueEvent,
  SocialPostEventsQueueDto,
} from "../../domain/interfaces/queues/social-post-events-queue";
import {
  SOCIAL_POST_COMMENTS_EVENTS_QUEUE_NAME,
  SocialPostCommentEventsQueueDto,
  SocialPostCommentQueueEvent,
} from "../../domain/interfaces/queues/social-post-comment-events-queue";

type CommentMetric = "replies";

type CommentUpdateState = {
  metrics: Set<CommentMetric>;
};

const eventMetricsMap: Record<SocialPostCommentQueueEvent, CommentMetric[]> = {
  "post-comment.created": ["replies"],
  "post-comment.removed": ["replies"],
  "post-comment.updated": ["replies"],
};

@Processor(SOCIAL_POST_COMMENTS_EVENTS_QUEUE_NAME, {
  limiter: { max: 10, duration: 5000 },
})
export class PostCommentsProcessor extends BullQueueWorker<
  SocialPostQueueEvent,
  SocialPostEventsQueueDto
> {
  private commentsToUpdate = new Map<number, CommentUpdateState>();
  private flushTimeout?: NodeJS.Timeout;
  private readonly FLUSH_DELAY_MS = 6000;

  constructor(
    private readonly postCommentsRepository: PostCommentRepository,
    private readonly redisLockService: RedisLockService
  ) {
    super();
  }

  protected async flushCommentsUpdates() {
    const entries = Array.from(this.commentsToUpdate.entries());

    if (entries.length === 0) {
      this.logger.debug("No pending comments updates, ending flush cycle.");
      return;
    }

    this.logger.log(`Flushing ${entries.length} Post(s) updates...`);
    this.commentsToUpdate.clear();

    for (const [commentId, state] of entries) {
      const lock = await this.redisLockService.acquireLock(
        `Comment:${commentId}`,
        1000
      );
      if (!lock) continue;

      try {
        const metricsToUpdate = Array.from(state.metrics);

        if (metricsToUpdate.includes("replies")) {
          await this.postCommentsRepository.refreshPostCommentsRepliesCount(
            commentId
          );
        }

        console.log(`Comment ${commentId} refreshed metrics:`, metricsToUpdate);
      } catch (err) {
        console.error(`Failed updating Comment ${commentId}`, err);
      } finally {
        await this.redisLockService.releaseLock(lock);
      }
    }
  }

  private scheduleCommentUpdate(postId: number, metrics: CommentMetric[]) {
    const existing = this.commentsToUpdate.get(postId);
    if (existing) {
      metrics.forEach((m) => existing.metrics.add(m));
    } else {
      this.commentsToUpdate.set(postId, { metrics: new Set(metrics) });
    }

    // Reset the debounce timer
    if (this.flushTimeout) clearTimeout(this.flushTimeout);

    this.flushTimeout = setTimeout(
      () => void this.flushCommentsUpdates(),
      this.FLUSH_DELAY_MS
    );
  }

  async handle({
    event,
    data,
  }: AppQueueEvent<
    SocialPostCommentQueueEvent,
    SocialPostCommentEventsQueueDto
  >) {
    const metrics = eventMetricsMap[event] ?? [];
    if (metrics.length > 0 && data.parentId) {
      this.scheduleCommentUpdate(data.parentId, metrics);
    }

    return Promise.resolve();
  }
}
