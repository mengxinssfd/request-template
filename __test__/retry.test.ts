import axios from 'axios';
import { AxiosRequestTemplate, Context, CustomConfig } from '../src';

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
  class RetryTemp<CC extends RetryConfig = RetryConfig> extends AxiosRequestTemplate<CC> {
    protected retryMap = new Map<any, Function>();
    // protected handleCanceler(config): Function {
    //   return () => {
    //     config.customConfig.retry = undefined;
    //     return super.handleCanceler(config)();
    //   };
    // }

    protected handleError(ctx: Context<CC>, e): any {
      const { requestConfig, customConfig, requestKey } = ctx;
      if (customConfig.retry === undefined) return super.handleError(ctx, e);
      const maxTimex = customConfig.retry;
      let status: 'running' | 'stop' = 'running';
      let times = 0;
      this.retryMap.set(requestKey, () => (status = 'stop'));
      this.cancelAll = (msg) => {
        this.retryMap.delete(requestKey);
        super.cancelAll(msg);
      };
      async function retry() {
        times++;
        try {
          return await this.request(
            requestConfig.url as string,
            requestConfig.data || requestConfig.params,
            { ...customConfig, retry: undefined },
            requestConfig,
          );
        } catch (e) {
          if (times >= maxTimex || status === 'stop') {
            return Promise.reject('times * ' + times);
          }
          return retry();
        }
      }
      return retry();
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
  /*test('cancel', async () => {
    expect.assertions(2);
    const req = new RetryTemp();
    const get = req.methodFactory('get');
    try {
      const p = get<{ username: string; id: number }>('/user', {}, { retry: 2 });
      req.cancelAll('cancel');
      await p;
    } catch (e) {
      expect(e).toBe('404');
    }
    try {
      await get<{ username: string; id: number }>('/user', {}, { retry: 10 });
    } catch (e) {
      expect(e).toBe('times * 10');
    }
  });*/
});
