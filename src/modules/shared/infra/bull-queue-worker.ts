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

  private flushTimer?: NodeJS.Timeout;
  private readonly flushIntervalMs?: number;

  constructor(flushIntervalMs?: number) {
    super();
    this.flushIntervalMs = flushIntervalMs;
  }

  abstract handle(event: AppQueueEvent<E, T>): Promise<void>;

  /** Optional — subclasses override if they want to flush periodic updates */
  protected async performPendingFlush(): Promise<void> {
    // subclasses can override
  }

  /** Begins periodic flushing when there are pending updates */
  protected beginFlushCycle() {
    if (!this.flushIntervalMs) return;
    if (this.flushTimer) return;

    this.logger.debug(`Starting flush cycle (${this.flushIntervalMs}ms)`);
    this.flushTimer = setInterval(
      () => void this.performPendingFlush(),
      this.flushIntervalMs
    );
  }

  /** Stops the flush cycle when no pending updates remain */
  protected endFlushCycle() {
    if (!this.flushTimer) return;
    clearInterval(this.flushTimer);
    this.flushTimer = undefined;
    this.logger.debug("Flush cycle stopped (no pending updates).");
  }

  async process(job: Job<AppQueueEvent<E, T>>): Promise<void> {
    this.logger.log("Received new job", {
      jobId: job.id,
      event: job.data.event,
    });
    await this.handle(job.data);
  }
}
