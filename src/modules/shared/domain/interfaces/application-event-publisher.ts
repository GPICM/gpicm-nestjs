export interface EventContract<T = any> {
  event: string;
  data: T;
}

export abstract class EventPublisher {
  abstract publish<T extends EventContract<any>>(event: T): Promise<void>;
}