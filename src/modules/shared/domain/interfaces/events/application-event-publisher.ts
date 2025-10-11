import { EventBusEnvelope } from "./event-bus-envelope";

export abstract class EventPublisher {
  abstract publish<T extends EventBusEnvelope<string, any>>(
    event: T
  ): Promise<void>;
}
