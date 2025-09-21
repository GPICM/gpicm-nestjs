export interface EventContract<E = string, T = any> {
  event: E;
  data: T;
}
