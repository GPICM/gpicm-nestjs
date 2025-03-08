import Axios, { AxiosError, AxiosRequestConfig } from "axios";

import { HttpClientResponse } from "../../../domain/interfaces/http-client/http-client-response";
import { HttpClient } from "@/modules/shared/domain/interfaces/http-client/http-client";
import { HttpClientRequestOptions } from "@/modules/shared/domain/interfaces/http-client/http-client-request";

const DEFAULT_TIMEOUT = 60000;
const DEFAULT_ERROR_STATUS_CODE = 10000;

export class AxiosHttpClient extends HttpClient {
  public constructor(baseApiUrl?: string) {
    super(baseApiUrl);
  }

  public async request(
    options: HttpClientRequestOptions,
  ): Promise<HttpClientResponse> {
    console.log("AxiosHttpClient: Executing http request", { options });

    const finalUrl = this.baseUrl
      ? `${this.baseUrl}${options.url}`
      : options.url;

    const finalHeaders = { ...this.defaultHeaders, ...options.headers };

    const requestConfig: AxiosRequestConfig = {
      url: finalUrl,
      headers: finalHeaders,
      method: options.method,
      params: options.params,
      data: options.body,
      timeout: DEFAULT_TIMEOUT,
    };

    try {
      const axiosResponse = await Axios(requestConfig);

      const response = new HttpClientResponse(
        Number(axiosResponse.status),
        axiosResponse.data ?? null,
        axiosResponse.headers,
      );

      return response;
    } catch (error: unknown) {
      console.error("BaseHttpClient: Request failed", { error });

      if (Axios.isAxiosError(error)) {
        return this.parseAxiosError(error);
      }

      return new HttpClientResponse(DEFAULT_ERROR_STATUS_CODE, {
        message: "HTTP request failed. Unable to reach the server.",
      });
    }
  }

  private parseAxiosError(error: AxiosError): HttpClientResponse {
    const statusCode = error.response?.status ?? DEFAULT_ERROR_STATUS_CODE;
    const data = (error.response?.data ?? null) as object;
    const headers = error.response?.headers ?? {};
    return new HttpClientResponse(statusCode, data, headers);
  }
}
