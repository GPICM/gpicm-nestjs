/* eslint-disable prettier/prettier */
import { Controller, Inject, Logger } from "@nestjs/common";

import {
  Ctx,
  EventPattern,
  Payload,
  RedisContext,
} from "@nestjs/microservices";
import { PostActionEvent } from "../../core/domain/interfaces/events";
import { SocialPostEventsQueuePublisher } from "../domain/interfaces/queues/social-post-events-queue";
import { PostServices } from "../application/post.service";

@Controller()
export class PostAsyncController {
  private readonly logger: Logger = new Logger(PostAsyncController.name);

  constructor(
    @Inject(SocialPostEventsQueuePublisher)
    private readonly queuePublisher: SocialPostEventsQueuePublisher,
    private readonly postService: PostServices
  ) {}

  @EventPattern("post.voted")
  handlePostVote(
    @Payload() event: PostActionEvent,
    @Ctx() context: RedisContext
  ) {
    const channel = context.getChannel();
    this.logger.log(`Received post event: ${channel}`);

    void this.queuePublisher.add({
      event: event.event,
      data: {
        postId: event.data.postId,
      },
    });
  }

  @EventPattern("post.viewed")
  async handlePostView(
    @Payload() event: PostActionEvent,
    @Ctx() context: RedisContext
  ) {
    const channel = context.getChannel();
    this.logger.log(`Received post event: ${channel}`);

    await this.postService.incrementViews(event.data.postId, event.data.userId);
  }
}
