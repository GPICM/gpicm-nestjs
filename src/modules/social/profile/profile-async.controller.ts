import { Controller, Inject, Logger } from "@nestjs/common";
import {
  Ctx,
  EventPattern,
  Payload,
  RedisContext,
} from "@nestjs/microservices";

import {
  SocialProfileEvent,
  SocialProfileEventsQueuePublisher,
} from "./domain/queues/social-profile-events-queue";
import {
  PostActionEvent,
  ProfileFollowingEvent,
} from "../core/domain/interfaces/events";

@Controller()
export class SocialProfileAsyncController {
  private readonly logger = new Logger(SocialProfileAsyncController.name);
  private readonly expectedPostEvents = [
    "post.created",
    "post.commented",
    "post.uncommented",
  ];

  private readonly expectedProfileEvents = [
    "profile.followed",
    "profile.unfollowed",
  ];
  constructor(
    @Inject(SocialProfileEventsQueuePublisher)
    private readonly queuePublisher: SocialProfileEventsQueuePublisher
  ) {}

  @EventPattern("post.*")
  handlePost(@Payload() event: PostActionEvent, @Ctx() context: RedisContext) {
    const channel = context.getChannel();

    if (!this.expectedPostEvents.includes(channel)) {
      this.logger.warn(`Ignoring unexpected post event: ${channel}`);
      return;
    }

    this.logger.log(`Received post event: ${channel}`);

    if (event.data.profileId) {
      void this.queuePublisher.add({
        event: event.event as SocialProfileEvent,
        data: { profileId: event.data.profileId },
      });
    }
  }

  @EventPattern("profile.*")
  handleProfile(
    @Payload() event: ProfileFollowingEvent,
    @Ctx() context: RedisContext
  ) {
    const channel = context.getChannel();

    if (!this.expectedProfileEvents.includes(channel)) {
      this.logger.warn(`Ignoring unexpected profile event: ${channel}`);
      return;
    }

    this.logger.log(`Received profile event: ${channel}`);

    void this.queuePublisher.add({
      event: event.event,
      data: {
        profileId: event.data.profileId,
        targetProfileId: event.data.targetProfileId,
      },
    });
  }
}
