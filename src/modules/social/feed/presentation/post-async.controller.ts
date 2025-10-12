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
import { PostCommentEvent, PostEvent } from "../../core/domain/interfaces/events";
import { SocialPostCommentEventsQueuePublisher } from "../domain/interfaces/queues/social-post-comment-events-queue";

@Controller()
export class PostAsyncController {
  private readonly logger: Logger = new Logger(PostAsyncController.name);

  constructor(
    @Inject(SocialPostEventsQueuePublisher)
    private readonly postMetricsQueue: SocialPostEventsQueuePublisher,
    private readonly commentsMetricsQueue: SocialPostCommentEventsQueuePublisher,
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
  handlePostVote(@Payload() event: PostEvent, @Ctx() context: RedisContext) {
    const channel = context.getChannel();
    this.logger.log(`Received post event: ${channel}`);

    void this.postMetricsQueue.add({
      event: event.name,
      data: {
        postId: event.data.postId,
      },
    });
  }

  @EventPattern("post-comment.created")
  handlePostComment(
    @Payload() event: PostCommentEvent,
    @Ctx() context: RedisContext
  ) {
    const channel = context.getChannel();
    this.logger.log(`Received post event: ${channel}`);

    void this.postMetricsQueue.add({
      event: event.name,
      data: {
        postId: event.data.postId,
      },
    });

    void this.commentsMetricsQueue.add({
      event: event.name,
      data: {
        postId: event.data.postId,
        commentId: event.data.commentId,
        parentId: event.data.parentCommentId,
      },
    });
  }
}
