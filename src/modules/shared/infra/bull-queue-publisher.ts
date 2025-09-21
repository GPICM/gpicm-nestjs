import { Logger } from "@nestjs/common";
import { Queue } from "bullmq";
import {
  AppQueueEvent,
  AppQueuePublisher,
} from "@/modules/shared/domain/interfaces/application-queue";

export abstract class BullQueuePublisher<E, T>
  implements AppQueuePublisher<E, T>
{
  private readonly logger = new Logger(BullQueuePublisher.name);

  constructor(protected readonly queue: Queue) {}

  async publish(event: AppQueueEvent<E, T>): Promise<void> {
    try {
      await this.queue.add(event.event as string, event.data, {
        jobId: event.deduplicationId,
      });
    } catch (error: unknown) {
      this.logger.error("Failed to add queue job", { error });
    }
  }
}
