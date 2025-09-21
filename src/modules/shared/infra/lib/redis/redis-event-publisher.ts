import {
  EventPublisher,
  EventContract,
} from "@/modules/shared/domain/interfaces/events";
import { RedisPubSubService } from "./redis-pub-sub-service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RedisEventPublisher implements EventPublisher {
  constructor(private readonly redisPubSubService: RedisPubSubService) {}

  public async publish<T extends EventContract<any>>(event: T): Promise<void> {
    await this.redisPubSubService.publish(event.event, event);
  }
}
