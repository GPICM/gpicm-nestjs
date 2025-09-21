import { EventContract } from "./application-event-types";

export abstract class EventPublisher {
  abstract publish<T extends EventContract<any>>(event: T): Promise<void>;
}
