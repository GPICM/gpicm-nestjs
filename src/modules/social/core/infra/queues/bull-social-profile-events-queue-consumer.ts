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

@Processor(SOCIAL_PROFILE_EVENTS_QUEUE_NAME, {
  limiter: { max: 10, duration: 1000 },
})
export class BullSocialProfileConsumer extends BullQueueConsumer<
  SocialProfileEvent,
  SocialProfileEventsQueueDto
> {
  private followersToUpdate = new Set<number>();
  private commentsToUpdate = new Set<number>();
  private postsToUpdate = new Set<number>();

  constructor(private readonly profileRepository: ProfileRepository) {
    super();
  }

  private refreshFollowers = debounce(async () => {
    const profileIds = Array.from(this.followersToUpdate);
    this.followersToUpdate.clear();

    for (const id of profileIds) {
      try {
        await this.profileRepository.refreshFollowersCounts(id);
      } catch (err) {
        console.error(`Failed updating followers for profile ${id}`, err);
      }
    }
  }, 500);

  private refreshComments = debounce(async () => {
    const profileIds = Array.from(this.commentsToUpdate);
    this.commentsToUpdate.clear();

    for (const id of profileIds) {
      try {
        await this.profileRepository.refreshCommentCount(id);
      } catch (err) {
        console.error(`Failed updating comments for profile ${id}`, err);
      }
    }
  }, 500);

  private refreshPosts = debounce(async () => {
    const profileIds = Array.from(this.postsToUpdate);
    this.postsToUpdate.clear();

    for (const id of profileIds) {
      try {
        await this.profileRepository.refreshPostCount(id);
      } catch (err) {
        console.error(`Failed updating posts for profile ${id}`, err);
      }
    }
  }, 500);

  public handle({
    event,
    data,
  }: AppQueueEvent<
    SocialProfileEvent,
    SocialProfileEventsQueueDto
  >): Promise<void> {
    if (event === "follow" || event === "unfollow") {
      this.followersToUpdate.add(data.profileId);
      if (data.targetProfileId)
        this.followersToUpdate.add(data.targetProfileId);

      this.refreshFollowers();
    } else if (event === "comment" || event === "uncomment") {
      this.commentsToUpdate.add(data.profileId);
      this.refreshComments();
    } else if (event === "post") {
      this.postsToUpdate.add(data.profileId);
      this.refreshPosts();
    }

    return Promise.resolve();
  }
}
