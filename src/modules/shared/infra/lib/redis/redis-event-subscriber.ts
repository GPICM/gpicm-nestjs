import { Injectable, Logger } from "@nestjs/common";
import { RedisPubSubService } from "./redis-pub-sub-service";
import {
  EventContract,
  EventSubscriber,
} from "@/modules/shared/domain/interfaces/events";

type EventHandler<T extends EventContract<string, any>> = (
  event: T
) => void | Promise<void>;

@Injectable()
export class RedisEventSubscriber implements EventSubscriber {
  private readonly logger = new Logger(RedisEventSubscriber.name);

  constructor(private readonly redisPubSubService: RedisPubSubService) {}

  public async subscribe<T extends EventContract<string, any>>(
    eventName: string,
    handler: EventHandler<T>
  ) {
    await this.redisPubSubService.subscribe(eventName, (event) => {
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
}
