import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

import {
  CommentsQueue,
  CommentsQueueDto,
} from "../domain/interfaces/queues/comments-queue";

@Injectable()
export class BullMqCommentsQueueAdapter implements CommentsQueue {
  private readonly logger: Logger = new Logger(BullMqCommentsQueueAdapter.name);
  constructor(@InjectQueue("comments-events") private commentsQueue: Queue) {}

  public async addCommentJob(dto: CommentsQueueDto): Promise<void> {
    try {
      await this.commentsQueue.add("postCommentsCreated", { ...dto });
    } catch (error: unknown) {
      this.logger.error("Failed to add postId to the queue", { error });
    }
  }
}
