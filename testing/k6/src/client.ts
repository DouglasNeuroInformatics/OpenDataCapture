import * as http from 'k6/http';

type ClientOptions = {
  baseUrl: string;
};

type RequestHeaders = {
  Accept?: 'application/json' | 'text/html';
  Authorization?: `Bearer ${string}`;
  'Content-Type'?: 'application/json';
};

type DefaultHeaders = {
  common: RequestHeaders;
  get: RequestHeaders;
  post: RequestHeaders;
};

type RequestOptions = {
  headers?: RequestHeaders;
};

export class Client {
  public defaultHeaders: DefaultHeaders = {
    common: {},
    get: {
      Accept: 'application/json'
    },
    post: {
      'Content-Type': 'application/json'
    }
  };
  private baseUrl: string;

  constructor(options: ClientOptions) {
    this.baseUrl = options.baseUrl;
  }

  get(path: string, options?: RequestOptions) {
    return http.get<'text'>(this.baseUrl + path, {
      headers: { ...this.defaultHeaders.common, ...this.defaultHeaders.get, ...options?.headers }
    });
  }

  post(path: string, body: { [key: string]: unknown }, options?: RequestOptions) {
    return http.post<'text'>(this.baseUrl + path, JSON.stringify(body), {
      headers: { ...this.defaultHeaders.common, ...this.defaultHeaders.post, ...options?.headers }
    });
  }
}
