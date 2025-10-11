import { Injectable, Logger } from "@nestjs/common";
import {
  EventBusEnvelope,
  EventSubscriber,
} from "@/modules/shared/domain/interfaces/events";
import Redis from "ioredis";

type EventHandler<T extends EventBusEnvelope<string, any>> = (
  event: T
) => void | Promise<void>;

@Injectable()
export class RedisEventSubscriber implements EventSubscriber {
  private readonly logger = new Logger(RedisEventSubscriber.name);
  private readonly client: Redis;

  constructor() {
    this.client = new Redis({ host: "redis", port: 6379 });

    this.client.on("connect", () =>
      this.logger.log("Redis subscriber connected")
    );
    this.client.on("error", (err) =>
      this.logger.error("Redis subscriber error", err)
    );
  }

  public async subscribe<T extends EventBusEnvelope<string, any>>(
    eventName: string,
    handler: EventHandler<T>
  ) {
    await this._subscribe(eventName, (event) => {
      try {
        this.logger.log(`Received event: ${eventName}`);
        void handler(event as unknown as T);
      } catch (error: unknown) {
        this.logger.error(`Error handling event ${eventName}`, { error });
      }
    });
  }

  public async subscribeMany(events: Record<string, EventHandler<any>>) {
    const subscriptions = Object.entries(events).map(([eventName, handler]) =>
      this.subscribe(eventName, handler)
    );

    await Promise.all(subscriptions);
  }

  /** Subscribe to a channel */
  async _subscribe(
    channel: string,
    handler: (payload: any) => void
  ): Promise<void> {
    await this.client.subscribe(channel, (err) => {
      if (err) this.logger.error(`Failed to subscribe to ${channel}`, err);
      else this.logger.log(`Subscribed to ${channel} `);
    });

    this.client.on("message", (ch, message) => {
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
  async _unsubscribe(channel: string): Promise<void> {
    await this.client.unsubscribe(channel);
    this.logger.log(`Unsubscribed from channel "${channel}"`);
  }

  async onModuleDestroy() {
    this.logger.log("Disconnecting Redis Sub...");
    await Promise.all([this.client.quit()]);
  }
}
