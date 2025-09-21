import { Injectable, OnModuleDestroy, Logger } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisPubSubService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisPubSubService.name);
  private readonly publisher: Redis;
  private readonly subscriber: Redis;

  constructor() {
    this.publisher = new Redis({ host: "redis", port: 6379 });
    this.subscriber = new Redis({ host: "redis", port: 6379 });

    this.publisher.on("connect", () =>
      this.logger.log("Redis publisher connected")
    );
    this.publisher.on("error", (err) =>
      this.logger.error("Redis publisher error", err)
    );

    this.subscriber.on("connect", () =>
      this.logger.log("Redis subscriber connected")
    );
    this.subscriber.on("error", (err) =>
      this.logger.error("Redis subscriber error", err)
    );
  }

  /** Publish a message to a channel */
  async publish(channel: string, payload: any): Promise<number> {
    const message = JSON.stringify(payload);
    this.logger.log(`Publishing to channel "${channel}": ${message}`);
    return this.publisher.publish(channel, message);
  }

  /** Subscribe to a channel */
  async subscribe(
    channel: string,
    handler: (payload: any) => void
  ): Promise<void> {
    await this.subscriber.subscribe(channel, (err) => {
      if (err) this.logger.error(`Failed to subscribe to ${channel}`, err);
      else this.logger.log(`Subscribed to ${channel} `);
    });

    this.subscriber.on("message", (ch, message) => {
      if (ch === channel) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const payload = JSON.parse(message);
          handler(payload);
        } catch (error: unknown) {
          this.logger.error("Failed to parse pub/sub message", { error });
        }
      }
    });
    this.logger.log(`Subscribed to channel "${channel}"`);
  }

  /** Unsubscribe from a channel */
  async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel);
    this.logger.log(`Unsubscribed from channel "${channel}"`);
  }

  async onModuleDestroy() {
    this.logger.log("Disconnecting Redis Pub/Sub...");
    await Promise.all([this.publisher.quit(), this.subscriber.quit()]);
  }
}
