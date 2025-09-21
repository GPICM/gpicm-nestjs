import { Logger } from "@nestjs/common";
import { Queue } from "bullmq";
import {
  AppQueueEvent,
  AppQueuePublisher,
} from "@/modules/shared/domain/interfaces/application-queue";

export class BullQueuePublisher<E, T> implements AppQueuePublisher<E, T> {
  private readonly logger = new Logger(BullQueuePublisher.name);

  constructor(private queue: Queue) {}

  async add(event: AppQueueEvent<E, T>): Promise<void> {
    try {
      const jobId =
        event.deduplicationId ??
        `${event.event as string} | ${JSON.stringify(event.data)}`;

      await this.queue.add(event.event as string, event, {
        jobId,
        removeOnComplete: true,
        removeOnFail: true,
      });
    } catch (error: unknown) {
      this.logger.error("Failed to add queue job", { error });
    }
  }
}
