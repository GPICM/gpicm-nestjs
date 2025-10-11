import { randomUUID } from "crypto";

export class EventBusEnvelope<E = string, T = any> {
  readonly id: string;
  readonly name: E;
  readonly data: T;
  readonly timestamp: string;
  readonly metadata?: Record<string, any>;

  constructor(name: E, data: T, metadata?: Record<string, any>) {
    this.id = randomUUID();
    this.name = name;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.metadata = metadata;
  }
}
