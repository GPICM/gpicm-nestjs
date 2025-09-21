/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Processor } from "@nestjs/bullmq";
import { debounce } from "lodash";

import { BullQueueConsumer } from "@/modules/shared/infra/bull-queue-consumer";

import { ProfileRepository } from "../../domain/interfaces/repositories/profile-repository";
import {
  SOCIAL_PROFILE_EVENTS_QUEUE_NAME,
  SocialProfileEvent,
  SocialProfileEventsQueueDto,
} from "../../domain/queues/social-profile-events-queue";
import { AppQueueEvent } from "@/modules/shared/domain/interfaces/application-queue";
import { RedisLockService } from "@/modules/shared/infra/lib/redis/redis-lock-service";

type ProfileMetric = "followers" | "comments" | "posts";

type ProfileUpdateState = {
  metrics: Set<ProfileMetric>;
  debouncedFn: () => void;
};

const eventMetricsMap: Record<SocialProfileEvent, ProfileMetric[]> = {
  follow: ["followers"],
  unfollow: ["followers"],
  comment: ["comments"],
  uncomment: ["comments"],
  post: ["posts"],
};

@Processor(SOCIAL_PROFILE_EVENTS_QUEUE_NAME, {
  limiter: { max: 10, duration: 1000 },
})
export class BullSocialProfileConsumer extends BullQueueConsumer<
  SocialProfileEvent,
  SocialProfileEventsQueueDto
> {
  private profileUpdateState = new Map<number, ProfileUpdateState>();

  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly redisLockService: RedisLockService
  ) {
    super();
  }

  private scheduleProfileUpdate(
    profileId: number,
    metrics: ("followers" | "comments" | "posts")[]
  ) {
    const existing = this.profileUpdateState.get(profileId);

    if (existing) {
      metrics.forEach((m) => existing.metrics.add(m));
      return;
    }

    const metricsSet = new Set(metrics);
    const debouncedFn = debounce(async () => {
      const state = this.profileUpdateState.get(profileId);
      if (!state) return;

      this.profileUpdateState.delete(profileId);
      const metricsToUpdate = Array.from(state.metrics);

      const lock = await this.redisLockService.acquireLock(
        `profile:${profileId}`,
        3000
      );
      if (!lock) return;

      try {
        if (metricsToUpdate.includes("followers")) {
          await this.profileRepository.refreshFollowersCounts(profileId);
        }
        if (metricsToUpdate.includes("comments")) {
          await this.profileRepository.refreshCommentCount(profileId);
        }
        if (metricsToUpdate.includes("posts")) {
          await this.profileRepository.refreshPostCount(profileId);
        }
      } catch (err) {
        console.error(`Failed updating profile ${profileId}`, err);
      } finally {
        console.log(`Profile ${profileId} refreshed metrics:`, metricsToUpdate);
        await this.redisLockService.releaseLock(lock);
      }
    }, 500);

    this.profileUpdateState.set(profileId, {
      metrics: metricsSet,
      debouncedFn,
    });

    debouncedFn();
  }

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

    if ((event === "follow" || event === "unfollow") && data.targetProfileId) {
      this.scheduleProfileUpdate(data.targetProfileId, ["followers"]);
    }

    return Promise.resolve();
  }
}
