import { EventContract } from "./application-event-types";

export abstract class EventSubscriber {
  abstract subscribe<T extends EventContract<string, any>>(
    eventName: string,
    handler: (event: T) => void | Promise<void>
  ): Promise<void>;

  abstract subscribeMany(
    events: Record<
      string,
      (event: EventContract<string, any>) => void | Promise<void>
    >
  ): Promise<void>;
}
