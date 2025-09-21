import { Job } from "bullmq";
import { WorkerHost } from "@nestjs/bullmq";

import {
  AppQueueConsumer,
  AppQueueEvent,
} from "@/modules/shared/domain/interfaces/application-queue";
import { Logger } from "@nestjs/common";

export abstract class BullQueueConsumer<E, T>
  extends WorkerHost
  implements AppQueueConsumer<E, T>
{
  protected logger = new Logger();

  abstract handle(event: AppQueueEvent<E, T>): Promise<void>;

  async process(job: Job<AppQueueEvent<E, T>>): Promise<void> {
    this.logger.log("Handling new JOB", { jobData: job.data });
    await this.handle(job.data);
  }
}
