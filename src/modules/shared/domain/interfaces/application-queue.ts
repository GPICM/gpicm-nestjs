export type AppQueueEvent<E, T> = {
  event: E;
  data: T;
};

export abstract class AppQueuePublisher<E = string, T = unknown> {
  abstract publish(event: AppQueueEvent<E, T>): Promise<void>;
}

export abstract class AppQueueConsumer<E = string, T = unknown> {
  abstract handle(event: AppQueueEvent<E, T>): Promise<void>;
}
