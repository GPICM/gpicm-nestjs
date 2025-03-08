export class HttpClientResponse {
  public readonly data: object | object[] | null;

  public readonly headers: object;

  public readonly statusCode: number;

  public constructor(statusCode: number, data: object, headers?: object) {
    this.data = data;
    this.statusCode = statusCode;
    this.headers = headers ?? {};
  }

  public isError(expectedStatuses = [200]): boolean {
    return !expectedStatuses.includes(this.statusCode);
  }

  public getData<T>(): T {
    return this.data as T;
  }

  public toString() {
    return JSON.stringify({ ...this });
  }
}
