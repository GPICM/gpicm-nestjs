export interface EventContract<T = any> {
  event: string;
  data: T;
}
