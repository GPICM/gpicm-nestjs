import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import {
  VoteQueue,
  VoteQueueDto,
} from "../domain/interfaces/queues/vote-queue";

@Injectable()
export class BullMqVoteQueueAdapter implements VoteQueue {
  private readonly logger: Logger = new Logger(BullMqVoteQueueAdapter.name);
  constructor(@InjectQueue("vote-events") private voteQueue: Queue) {}

  async addVoteJob(dto: VoteQueueDto) {
    try {
      await this.voteQueue.add("postVoteCreated", { ...dto });
    } catch (error: unknown) {
      this.logger.error("Failed to add postId to the queue", { error });
    }
  }
}
