import { HttpClientRequestOptions } from "./http-client-request";
import { HttpClientResponse } from "./http-client-response";

export abstract class HttpClient {
  protected defaultHeaders: object = {
    "Content-Type": "application/json",
  };

  protected baseUrl: string;

  public constructor(baseApiUrl?: string) {
    this.baseUrl = baseApiUrl ?? "";
  }

  public abstract request(
    options: HttpClientRequestOptions
  ): Promise<HttpClientResponse>;

  public setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  public setDefaultHeaders(defaultHeaders: object): void {
    this.defaultHeaders = { ...defaultHeaders };
  }
}
