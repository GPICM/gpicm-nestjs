import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import {
  VoteQueue,
  VoteQueueDto,
} from "../domain/interfaces/queues/vote-queue";

@Injectable()
export class BullMqVoteQueueAdapter implements VoteQueue {
  constructor(@InjectQueue("vote-events") private voteQueue: Queue) {}

  async addVoteJob(dto: VoteQueueDto) {
    await this.voteQueue.add("postVoteCreated", { ...dto });
  }
}
