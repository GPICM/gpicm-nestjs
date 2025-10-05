import {
  EventPublisher,
  EventContract,
} from "@/modules/shared/domain/interfaces/events";
import { Injectable, Logger } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisEventPublisher implements EventPublisher {
  private readonly logger = new Logger(RedisEventPublisher.name);

  private readonly client: Redis;

  constructor() {
    this.client = new Redis({ host: "redis", port: 6379 });
    this.client.on("connect", () =>
      this.logger.log("Redis publisher connected")
    );
    this.client.on("error", (err) =>
      this.logger.error("Redis publisher error", err)
    );
  }

  async _publish(channel: string, payload: any): Promise<number> {
    const message = JSON.stringify(payload);
    this.logger.log(`Publishing to channel "${channel}": ${message}`);
    return this.client.publish(channel, message);
  }

  public async publish<T extends EventContract<string, any>>(
    event: T
  ): Promise<void> {
    await this._publish(event.event, event);
  }

  async onModuleDestroy() {
    this.logger.log("Disconnecting Redis Pub...");
    await Promise.all([this.client.quit()]);
  }
}
