import { Controller, Inject, Logger } from "@nestjs/common";
import {
  Ctx,
  EventPattern,
  Payload,
  RedisContext,
} from "@nestjs/microservices";

import { SocialProfileEventsQueuePublisher } from "./domain/queues/social-profile-events-queue";
import { ProfileEvent } from "../core/domain/interfaces/events";

@Controller()
export class SocialProfileAsyncController {
  private readonly logger = new Logger(SocialProfileAsyncController.name);
  private readonly expectedPostEvents = [
    "post.created",
    "post.commented",
    "post.uncommented",
  ];

  private readonly expectedProfileEvents = [
    "profile.created",
    "profile.followed",
    "profile.unfollowed",
  ];

  constructor(
    @Inject(SocialProfileEventsQueuePublisher)
    private readonly queuePublisher: SocialProfileEventsQueuePublisher
  ) {}

  @EventPattern("post.*")
  handlePost(@Payload() event: ProfileEvent, @Ctx() context: RedisContext) {
    const channel = context.getChannel();

    if (!this.expectedPostEvents.includes(channel)) {
      this.logger.warn(`Ignoring unexpected post event: ${channel}`);
      return;
    }

    this.logger.log(`Received post event: ${channel}`);

    if (event.data.profileId) {
      void this.queuePublisher.add({
        event: event.name,
        data: { profileId: event.data.profileId },
      });
    }
  }

  @EventPattern("profile.*")
  handleProfile(@Payload() event: ProfileEvent, @Ctx() context: RedisContext) {
    const channel = context.getChannel();

    if (!this.expectedProfileEvents.includes(channel)) {
      this.logger.warn(`Ignoring unexpected profile event: ${channel}`);
      return;
    }

    this.logger.log(`Received profile event: ${channel}`);

    void this.queuePublisher.add({
      event: event.name,
      data: {
        profileId: event.data.profileId,
        targetProfileId: event.data.targetProfileId,
      },
    });
  }
}
