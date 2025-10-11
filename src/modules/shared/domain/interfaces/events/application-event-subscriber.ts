import { EventBusEnvelope } from "./event-bus-envelope";

export abstract class EventSubscriber {
  abstract subscribe<T extends EventBusEnvelope<string, any>>(
    eventName: string,
    handler: (event: T) => void | Promise<void>
  ): Promise<void>;

  abstract subscribeMany(
    events: Record<
      string,
      (event: EventBusEnvelope<string, any>) => void | Promise<void>
    >
  ): Promise<void>;
}
