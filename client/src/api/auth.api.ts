import { AuthTokens, LoginCredentials } from 'common';

import BaseAPI, { PostRequest } from './base.api';

export default class AuthAPI extends BaseAPI {
  static login: PostRequest<LoginCredentials, AuthTokens> = async ({ username, password }) => {
    const response = await fetch(`${this.host}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    });
    if (!response.ok) {
      throw response;
    }
    return response.json() as Promise<AuthTokens>;
  };
}
