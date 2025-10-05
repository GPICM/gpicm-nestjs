/* eslint-disable prettier/prettier */
import {
  Controller,
  Inject,
  Logger,
} from "@nestjs/common";

import { Ctx, EventPattern, Payload, RedisContext } from "@nestjs/microservices";
import { PostActionEvent } from "../../core/domain/interfaces/events";
import { VoteQueue } from "../domain/interfaces/queues/vote-queue";

@Controller()
export class PostAsyncController {
  private readonly logger: Logger = new Logger(PostAsyncController.name);

  constructor(
    @Inject(VoteQueue)
    private voteQueue: VoteQueue
  ) {}

  @EventPattern("post.voted")
  handlePost(@Payload() event: PostActionEvent, @Ctx() context: RedisContext) {
    const channel = context.getChannel();
    this.logger.log(`Received post event: ${channel}`);

    void this.voteQueue.addVoteJob({
      postId: event.data.postId,
    });
  }
}
