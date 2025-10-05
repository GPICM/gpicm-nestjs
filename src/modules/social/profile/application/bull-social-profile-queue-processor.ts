/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Processor } from "@nestjs/bullmq";

import { BullQueueWorker } from "@/modules/shared/infra/bull-queue-worker";

import { ProfileRepository } from "../../core/domain/interfaces/repositories/profile-repository";
import {
  SOCIAL_PROFILE_EVENTS_QUEUE_NAME,
  SocialProfileEvent,
  SocialProfileEventsQueueDto,
} from "../domain/queues/social-profile-events-queue";
import { AppQueueEvent } from "@/modules/shared/domain/interfaces/application-queue";
import { RedisLockService } from "@/modules/shared/infra/lib/redis/redis-lock-service";

type ProfileMetric = "followers" | "comments" | "posts";

type ProfileUpdateState = {
  metrics: Set<ProfileMetric>;
};

const eventMetricsMap: Record<SocialProfileEvent, ProfileMetric[]> = {
  "profile.followed": ["followers"],
  "profile.unfollowed": ["followers"],
  "post.commented": ["comments"],
  "post.uncommented": ["comments"],
  "post.created": ["posts"],
};

const PROFILE_UPDATE_INTERVAL_MS = 5000;

@Processor(SOCIAL_PROFILE_EVENTS_QUEUE_NAME, {
  limiter: { max: 10, duration: 1000 },
})
export class BullSocialProfileProcessor extends BullQueueWorker<
  SocialProfileEvent,
  SocialProfileEventsQueueDto
> {
  private profileUpdateState = new Map<number, ProfileUpdateState>();

  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly redisLockService: RedisLockService
  ) {
    super();

    // Flush profile updates every PROFILE_UPDATE_INTERVAL_MS
    setInterval(
      () => void this.flushProfileUpdates(),
      PROFILE_UPDATE_INTERVAL_MS
    );

    this.logger.log(
      `Profile update batch processor initialized. Flushing every ${PROFILE_UPDATE_INTERVAL_MS}ms.`
    );
  }

  private async flushProfileUpdates() {
    const entries = Array.from(this.profileUpdateState.entries());

    if (entries.length === 0) {
      this.logger.debug("No profile updates to flush at this interval.");
      return;
    }

    this.logger.log(`Flushing ${entries.length} profile(s) updates...`);

    this.profileUpdateState.clear(); // clear before processing to avoid double updates

    for (const [profileId, state] of entries) {
      // Acquire Redis lock to prevent concurrent updates

      const lock = await this.redisLockService.acquireLock(
        `profile:${profileId}`,
        1000
      );
      if (!lock) continue;

      try {
        const metricsToUpdate = Array.from(state.metrics);
        // Update only the metrics that were affected
        if (metricsToUpdate.includes("followers")) {
          await this.profileRepository.refreshFollowersCounts(profileId);
        }
        if (metricsToUpdate.includes("comments")) {
          await this.profileRepository.refreshCommentCount(profileId);
        }
        if (metricsToUpdate.includes("posts")) {
          await this.profileRepository.refreshPostCount(profileId);
        }

        console.log(`Profile ${profileId} refreshed metrics:`, metricsToUpdate);
      } catch (err) {
        console.error(`Failed updating profile ${profileId}`, err);
      } finally {
        await this.redisLockService.releaseLock(lock);
      }
    }
  }

  /**
   * Schedule a profile update by adding metrics to the pending state.
   */
  private scheduleProfileUpdate(profileId: number, metrics: ProfileMetric[]) {
    const existing = this.profileUpdateState.get(profileId);
    if (existing) {
      // Merge new metrics into existing set
      metrics.forEach((m) => existing.metrics.add(m));
      return;
    }

    // Start a new batch for this profile
    const metricsSet = new Set(metrics);
    this.profileUpdateState.set(profileId, { metrics: metricsSet });
  }

  /**
   * Handle incoming events from the Bull queue.
   * Accumulates metrics to update for profiles and target profiles.
   */
  public handle({
    event,
    data,
  }: AppQueueEvent<
    SocialProfileEvent,
    SocialProfileEventsQueueDto
  >): Promise<void> {
    const metricsToUpdate = eventMetricsMap[event] ?? [];

    if (metricsToUpdate.length > 0) {
      this.scheduleProfileUpdate(data.profileId, metricsToUpdate);
    }

    // For follow/unfollow events, also update the target profile's followers
    if (
      ["profile.followed", "profile.unfollowed"].includes(event) &&
      data.targetProfileId
    ) {
      this.scheduleProfileUpdate(data.targetProfileId, ["followers"]);
    }

    return Promise.resolve();
  }
}
