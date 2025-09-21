import { Job } from "bullmq";
import { WorkerHost } from "@nestjs/bullmq";

import {
  AppQueueConsumer,
  AppQueueEvent,
} from "@/modules/shared/domain/interfaces/application-queue";

export abstract class BullQueueConsumer<E, T>
  extends WorkerHost
  implements AppQueueConsumer<E, T>
{
  abstract handle(event: AppQueueEvent<E, T>): Promise<void>;

  async process(bullMqJob: Job<AppQueueEvent<E, T>>): Promise<void> {
    await this.handle(bullMqJob.data);
  }
}
