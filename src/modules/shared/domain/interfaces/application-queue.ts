export type AppQueueEvent<E, T> = {
  data: T;
  event: E;
  deduplicationId?: string;
};

export abstract class AppQueuePublisher<E = string, T = unknown> {
  abstract add(event: AppQueueEvent<E, T>): Promise<void>;
}

export abstract class AppQueueWorker<E = string, T = unknown> {
  abstract handle(event: AppQueueEvent<E, T>): Promise<void>;
}
