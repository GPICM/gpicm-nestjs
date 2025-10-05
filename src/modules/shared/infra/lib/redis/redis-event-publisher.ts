import {
  EventPublisher,
  EventContract,
} from "@/modules/shared/domain/interfaces/events";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class RedisEventPublisher implements EventPublisher {
  private readonly logger = new Logger(RedisEventPublisher.name);

  constructor(
    @Inject("REDIS_SHARED_EVENTS") private readonly client: ClientProxy
  ) {}

  private _publish(channel: string, payload: any): Promise<void> {
    this.logger.log(
      `Publishing to channel "${channel}": ${JSON.stringify(payload)}`
    );
    // Fire-and-forget emit
    this.client.emit(channel, payload);
    return Promise.resolve();
  }

  public async publish<T extends EventContract<string, any>>(
    event: T
  ): Promise<void> {
    await this._publish(event.event, event);
  }

  async onModuleDestroy() {
    this.logger.log("Closing Redis microservice client...");
    await this.client.close();
  }
}
