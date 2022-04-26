import axios from 'axios';
import { AxiosRequestTemplate, Context, CustomConfig } from '../src';

jest.mock('axios');
const map = new Map<string, Function>();
let times = 0;
const mockCreate = () => {
  return function ({ cancelToken, url }) {
    return new Promise((res, rej) => {
      map.set(cancelToken, (msg?: string) => {
        rej({ message: msg });
      });
      if (url === '3') {
        if (times === 3) {
          setTimeout(() => {
            res({ code: 200, data: {}, msg: 'success' });
          });
          return;
        } else {
          times++;
        }
      }
      setTimeout(() => {
        rej('404');
      });
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
(axios as any).isCancel = (value: any) => typeof value === 'object' && 'message' in value;

interface Ctx<CC> extends Context<CC> {
  retry?: Function;
}

describe('retry', () => {
  interface RetryConfig extends CustomConfig {
    retry?: number;
  }
  class RetryTemp<CC extends RetryConfig = RetryConfig> extends AxiosRequestTemplate<CC> {
    protected handleRetry(ctx: Ctx<CC>) {
      const { customConfig, clearSet } = ctx;
      if (customConfig.retry === undefined || customConfig.retry < 1) return;
      const maxTimex = customConfig.retry;
      let status: 'running' | 'stop' = 'running';
      let times = 0;
      const clear = () => {
        status = 'stop';
      };
      if (customConfig.tag) {
        this.tagCancelMap.get(customConfig.tag)?.push(clear);
      }
      this.cancelerSet.add(clear);
      clearSet.add(clear);
      ctx.retry = () => {
        return new Promise((res, rej) => {
          const handle = () => {
            if (times >= maxTimex || status === 'stop') {
              return rej('times * ' + times);
            }
            times++;
            this.execRequest({ ...ctx }).then(
              (data) => {
                res(data);
              },
              () => {
                handle();
              },
            );
          };
          handle();
        });
      };
    }

    protected handleCanceler(ctx) {
      super.handleCanceler(ctx);
      this.handleRetry(ctx);
    }

    protected handleError(ctx: Ctx<CC>, e): any {
      const { customConfig } = ctx;
      if (customConfig.retry === undefined || axios.isCancel(e)) return super.handleError(ctx, e);
      return ctx.retry?.();
    }
  }
  const get = new RetryTemp().methodFactory('get');
  test('base', async () => {
    expect.assertions(4);
    const list = [
      get<{ username: string; id: number }>('/user'),
      get<{ username: string; id: number }>('/user', {}, { retry: 2 }),
      get<{ username: string; id: number }>('/user', {}, { retry: 10 }),
    ];
    const res = await Promise.allSettled(list);
    expect(res).toEqual([
      {
        reason: '404',
        status: 'rejected',
      },
      {
        reason: 'times * 2',
        status: 'rejected',
      },
      {
        reason: 'times * 10',
        status: 'rejected',
      },
    ]);

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
  test('第3次成功', async () => {
    expect.assertions(2);
    try {
      await get<{ username: string; id: number }>(
        '3',
        { code: 200, data: {}, msg: 'success' },
        { tag: 'cancel', retry: 2 },
      );
    } catch (e) {
      expect(e).toBe('times * 2');
    }
    times = 0;
    const res = await get<{ username: string; id: number }>('3', {}, { tag: 'cancel', retry: 3 });
    expect(res).toEqual({ code: 200, data: {}, msg: 'success' });
  });

  describe('cancel', () => {
    const req = new RetryTemp();
    const get = req.methodFactory('get');
    test('cancelAll', async () => {
      expect.assertions(1);
      try {
        const p = get<{ username: string; id: number }>('/user', {}, { retry: 2 });
        req.cancelAll('cancel');
        await p;
      } catch (e) {
        expect(e).toEqual({ message: 'cancel' });
      }
    });
    test('cancelWithTag', async () => {
      expect.assertions(1);
      try {
        const p = get<{ username: string; id: number }>('/user', {}, { tag: 'cancel', retry: 2 });
        req.cancelWithTag('cancel', 'with tag');
        await p;
      } catch (e) {
        expect(e).toEqual({ message: 'with tag' });
      }
    });
    test('cancelCurrentRequest', async () => {
      expect.assertions(1);
      try {
        const p = get<{ username: string; id: number }>('/user', {}, { tag: 'cancel', retry: 2 });
        req.cancelCurrentRequest?.('cancel');
        await p;
      } catch (e) {
        expect(e).toEqual({ message: 'cancel' });
      }
    });
  });
});
