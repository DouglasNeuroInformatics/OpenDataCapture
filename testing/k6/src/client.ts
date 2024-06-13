import * as http from 'k6/http';

type ClientOptions = {
  baseUrl: string;
};

type RequestOptions = {
  headers?: {
    Accept?: 'application/json' | 'text/html';
    Authorization?: `Bearer ${string}`;
    'Content-Type'?: 'application/json';
  };
};

export class Client {
  private baseUrl: string;
  private defaultHeaders = {
    get: {
      Accept: 'application/json'
    },
    post: {
      'Content-Type': 'application/json'
    }
  };

  constructor(options: ClientOptions) {
    this.baseUrl = options.baseUrl;
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
