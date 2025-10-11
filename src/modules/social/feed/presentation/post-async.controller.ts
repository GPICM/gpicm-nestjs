/* eslint-disable prettier/prettier */
import { Controller, Inject, Logger } from "@nestjs/common";

import {
  Ctx,
  EventPattern,
  Payload,
  RedisContext,
} from "@nestjs/microservices";
import { SocialPostEventsQueuePublisher } from "../domain/interfaces/queues/social-post-events-queue";
import { PostServices } from "../application/post.service";
import { PostEvent } from "../../core/domain/interfaces/events";

@Controller()
export class PostAsyncController {
  private readonly logger: Logger = new Logger(PostAsyncController.name);

  constructor(
    @Inject(SocialPostEventsQueuePublisher)
    private readonly queuePublisher: SocialPostEventsQueuePublisher,
    private readonly postService: PostServices
  ) {}


  @EventPattern("post.viewed")
  async handlePostView(
    @Payload() event: PostEvent,
    @Ctx() context: RedisContext
  ) {
    const channel = context.getChannel();
    this.logger.log(`Received post event: ${channel}`);

    await this.postService.incrementViews(event.data.postId, event.data.userId);
  }


  @EventPattern("post.voted")
  handlePostVote(
    @Payload() event: PostEvent,
    @Ctx() context: RedisContext
  ) {
    const channel = context.getChannel();
    this.logger.log(`Received post event: ${channel}`);

    void this.queuePublisher.add({
      event: event.name,
      data: {
        postId: event.data.postId,
      },
    });
  }


  @EventPattern("post-comment.created")
  handlePostComment(
    @Payload() event: PostEvent,
    @Ctx() context: RedisContext
  ) {
    const channel = context.getChannel();
    this.logger.log(`Received post event: ${channel}`);

    void this.queuePublisher.add({
      event: event.name,
      data: {
        postId: event.data.postId,
      },
    });
  }
}
