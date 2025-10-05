import { Job } from "bullmq";
import { WorkerHost } from "@nestjs/bullmq";

import {
  AppQueueWorker,
  AppQueueEvent,
} from "@/modules/shared/domain/interfaces/application-queue";
import { Logger } from "@nestjs/common";

export abstract class BullQueueWorker<E, T>
  extends WorkerHost
  implements AppQueueWorker<E, T>
{
  protected logger = new Logger();

  constructor() {
    super();
  }

  abstract handle(event: AppQueueEvent<E, T>): Promise<void>;

  async process(job: Job<AppQueueEvent<E, T>>): Promise<void> {
    this.logger.log("Received new job", {
      jobId: job.id,
      event: job.data.event,
    });
    await this.handle(job.data);
  }
}
