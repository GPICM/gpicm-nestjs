type AllowedHttpMethods = "POST" | "GET" | "PATCH" | "PUT";

export interface HttpClientRequestOptions {
  url: string;
  params?: object;
  httpAgent?: any;
  httpsAgent?: any;
  body?: object | string;
  method: AllowedHttpMethods;
  headers?: Record<string, string | number | boolean>;
}
