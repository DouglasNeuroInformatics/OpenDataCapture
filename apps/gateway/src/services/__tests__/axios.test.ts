import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { AxiosError, AxiosHeaders } from 'axios';
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '@/services/i18n';

import axios from '../axios';

const respondWithConfig: AxiosAdapter = (config) => {
  return Promise.resolve({ config, data: config, headers: {}, status: 200, statusText: 'OK' });
};

const rejectWith = (error: Error): AxiosAdapter => {
  return () => Promise.reject(error);
};

const createAxiosError = (status?: number) => {
  const config: InternalAxiosRequestConfig = { headers: new AxiosHeaders() };
  const response = status === undefined ? undefined : { config, data: null, headers: {}, status, statusText: '' };
  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, null, response);
};

const getNotifications = () => useNotificationsStore.getState().notifications;

const initialLanguage = i18n.resolvedLanguage;

afterEach(() => {
  i18n.changeLanguage(initialLanguage);
  useNotificationsStore.setState({ notifications: [] });
  vi.restoreAllMocks();
});

describe('request interceptor', () => {
  it('should ask for json, so the gateway api never responds with html', async () => {
    const { data } = await axios.get<InternalAxiosRequestConfig>('/api/test', { adapter: respondWithConfig });
    expect(data.headers.getAccept()).toBe('application/json');
  });

  it('should abort a request after ten seconds, so a dead connection does not hang the patient', async () => {
    const { data } = await axios.get<InternalAxiosRequestConfig>('/api/test', { adapter: respondWithConfig });
    expect(data.timeout).toBe(10000);
  });

  it('should report a timeout as a network error, so the patient knows the connection failed', async () => {
    const { data } = await axios.get<InternalAxiosRequestConfig>('/api/test', { adapter: respondWithConfig });
    expect(data.timeoutErrorMessage).toBe('Network Error');
  });

  it('should translate the timeout message into the current language, so a french patient can read it', async () => {
    i18n.changeLanguage('fr');
    const { data } = await axios.get<InternalAxiosRequestConfig>('/api/test', { adapter: respondWithConfig });
    expect(data.timeoutErrorMessage).toBe('Erreur de réseau');
  });
});

describe('response interceptor', () => {
  it('should pass a successful response through unchanged, so the patient is not notified of an error', async () => {
    const response = await axios.get('/api/test', { adapter: respondWithConfig });
    expect(response.status).toBe(200);
    expect(getNotifications()).toHaveLength(0);
  });

  it('should notify with the status code when an http request fails, so the patient sees why', async () => {
    await expect(axios.get('/api/test', { adapter: rejectWith(createAxiosError(404)) })).rejects.toBeInstanceOf(
      AxiosError
    );
    expect(getNotifications()).toMatchObject([{ message: 'HTTP Request Failed', title: '404', type: 'error' }]);
  });

  it('should translate the failure notification into the current language, so a french patient can read it', async () => {
    i18n.changeLanguage('fr');
    await expect(axios.get('/api/test', { adapter: rejectWith(createAxiosError(404)) })).rejects.toBeInstanceOf(
      AxiosError
    );
    expect(getNotifications()).toMatchObject([{ message: 'Échec de la requête HTTP' }]);
  });

  it('should notify without a title when a failed request has no response, as when the network is down', async () => {
    await expect(axios.get('/api/test', { adapter: rejectWith(createAxiosError()) })).rejects.toBeInstanceOf(
      AxiosError
    );
    expect(getNotifications()).toMatchObject([{ message: 'HTTP Request Failed', title: undefined, type: 'error' }]);
  });

  it('should notify of an unknown error when the failure is not from axios, so the patient still learns the request failed', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(axios.get('/api/test', { adapter: rejectWith(new TypeError('bad')) })).rejects.toThrow('bad');
    expect(getNotifications()).toMatchObject([{ message: 'Unknown Error', type: 'error' }]);
  });

  it('should log an error that is not from axios, since it has no http status to explain it', async () => {
    const error = new TypeError('bad');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(axios.get('/api/test', { adapter: rejectWith(error) })).rejects.toBe(error);
    expect(consoleError).toHaveBeenCalledWith(error);
  });
});
