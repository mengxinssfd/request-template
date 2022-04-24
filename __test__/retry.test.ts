import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { AxiosRequestTemplate, CustomConfig, ResType } from '../src';

jest.mock('axios');
const map = new Map<string, Function>();
const mockCreate = () => {
  return function ({ cancelToken }) {
    return new Promise((res, rej) => {
      map.set(cancelToken, rej);
      rej('404');
    });
  };
};
(axios.CancelToken.source as any).mockImplementation(() => {
  const token = Math.floor(Math.random() * 0xffffffffff).toString(16);
  return {
    token,
    cancel(msg?: string) {
      map.get(token)?.(msg);
    },
  };
});

(axios as any).create.mockImplementation(mockCreate);

describe('retry', () => {
  interface RetryConfig extends CustomConfig {
    retry?: number;
  }
  class RetryTemp<CC extends RetryConfig> extends AxiosRequestTemplate<CC> {
    private retryMap = new Map<string, number>();

    protected handleError(
      requestConfig: AxiosRequestConfig,
      customConfig: RetryConfig,
      e: AxiosError<ResType<any>>,
    ): any {
      if (customConfig.retry === undefined)
        return super.handleError(requestConfig, customConfig as CC, e);
      const key = this.generateRequestKey(requestConfig);
      const value = this.retryMap.get(key) || 0;
      if (value && value >= customConfig.retry) {
        this.retryMap.delete(key);
        return Promise.reject('times * ' + value);
      }
      this.retryMap.set(key, value + 1);
      return this.request(
        requestConfig.url as string,
        requestConfig.data || requestConfig.params,
        customConfig,
        requestConfig,
      );
    }
  }

  test('base', async () => {
    expect.assertions(3);
    const get = new RetryTemp().methodFactory('get');
    try {
      await get<{ username: string; id: number }>('/user');
    } catch (e) {
      expect(e).toBe('404');
    }
    try {
      await get<{ username: string; id: number }>('/user', {}, { retry: 2 });
    } catch (e) {
      expect(e).toBe('times * 2');
    }
    try {
      await get<{ username: string; id: number }>('/user', {}, { retry: 10 });
    } catch (e) {
      expect(e).toBe('times * 10');
    }
  });
});
