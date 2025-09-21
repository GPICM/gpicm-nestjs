/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Processor } from "@nestjs/bullmq";
import { debounce } from "lodash";

import { BullQueueConsumer } from "@/modules/shared/infra/bull-queue-consumer";

import { ProfileFollowRepository } from "../../domain/interfaces/repositories/profile-repository";
import {
  SOCIAL_PROFILE_EVENTS_QUEUE_NAME,
  SocialProfileEvent,
  SocialProfileEventsQueueDto,
} from "../../domain/queues/social-profile-events-queue";
import { AppQueueEvent } from "@/modules/shared/domain/interfaces/application-queue";

@Processor(SOCIAL_PROFILE_EVENTS_QUEUE_NAME, {
  limiter: { max: 10, duration: 1000 },
})
export class BullSocialProfileConsumer extends BullQueueConsumer<
  SocialProfileEvent,
  SocialProfileEventsQueueDto
> {
  private profilesToUpdate = new Set<number>();

  constructor(private readonly repository: ProfileFollowRepository) {
    super();
  }

  private debouncedAggregate = debounce(async () => {
    const profileIds = Array.from(this.profilesToUpdate);
    this.profilesToUpdate.clear();

    for (const profileId of profileIds) {
      try {
        console.log(`Recomputing followers for profile ${profileId}`);
        await this.repository.refreshCounts(profileId);
      } catch (err) {
        console.error(`Failed updating profile ${profileId}`, err);
      }
    }
  }, 500);

  public handle(
    event: AppQueueEvent<SocialProfileEvent, SocialProfileEventsQueueDto>
  ): Promise<void> {
    if (event.event === "follow" || event.event === "unfollow") {
      this.profilesToUpdate.add(event.data.profileId);
      this.profilesToUpdate.add(event.data.followingId);
      this.debouncedAggregate();
    }
    return Promise.resolve();
  }
}
