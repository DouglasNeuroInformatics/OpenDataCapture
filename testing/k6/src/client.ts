import * as http from 'k6/http';

type DefaultHeaders = {
  get?: { [key: string]: string };
  post?: { [key: string]: string };
};

type ClientOptions = {
  baseUrl: string;
  defaultHeaders?: DefaultHeaders;
};

type RequestOptions = {
  headers?: { [key: string]: string };
};

export class Client {
  private baseUrl: string;
  private defaultHeaders: DefaultHeaders;

  constructor(options: ClientOptions) {
    this.baseUrl = options.baseUrl;
    this.defaultHeaders = options.defaultHeaders ?? {};
  }

  get(path: string, options?: RequestOptions) {
    return http.get<'text'>(this.baseUrl + path, {
      headers: { ...this.defaultHeaders.get, ...options?.headers }
    });
  }

  post(path: string, body: { [key: string]: unknown }, options?: RequestOptions) {
    return http.post<'text'>(this.baseUrl + path, JSON.stringify(body), {
      headers: { ...this.defaultHeaders.post, ...options?.headers }
    });
  }
}
