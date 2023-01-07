import axios from 'axios';
import { AxiosRequestTemplate } from '../src';
import { Cache, ResType } from 'request-template';
import { mockAxiosResponse, sleep } from './utils';

jest.mock('axios');
const map = new Map<string, Function>();
const timesMap = new Map<string, number>();
const mockCreate = () => {
  return function (requestConfig) {
    const { cancelToken, url, method, data, headers, params } = requestConfig;
    const key = JSON.stringify({ url, method, params, data, headers });
    const times = timesMap.get(key) || 0;
    return new Promise((res, rej) => {
      timesMap.set(key, times + 1);
      map.set(cancelToken, (msg?: string) => {
        rej({ message: msg });
      });
      if (url === '/success') {
        res(mockAxiosResponse(requestConfig, { code: 200, data: { times }, msg: 'success' }));
      }
      if (url === '/config') {
        if (times === 3) {
          setTimeout(() => res(mockAxiosResponse(requestConfig, requestConfig)));
          return;
        }
      }
      if (url === '3') {
        if (times === 3) {
          setTimeout(() => {
            res(mockAxiosResponse(requestConfig, { code: 200, data: {}, msg: 'success' }));
          });
          return;
        }
      }
      setTimeout(() => {
        if (times > 0) {
          rej('times * ' + times);
          return;
        }
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

describe('AxiosRequestTemplate retry', () => {
  const get = new AxiosRequestTemplate().methodFactory('get');
  test('base', async () => {
    // expect.assertions(4);
    const list = [
      get<{ username: string; id: number }>({ url: '/user', data: { key: 1 } }),
      get<{ username: string; id: number }>({ url: '/user', data: { key: 2 } }, { retry: 2 }),
      get<{ username: string; id: number }>(
        { url: '/user', data: { key: 3 } },
        { retry: { times: 10 } },
      ),
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
      await get<{ username: string; id: number }>({ url: '/user', data: { key: 4 } });
    } catch (e) {
      expect(e).toBe('404');
    }

    try {
      await get<{ username: string; id: number }>({ url: '/user', data: { key: 5 } }, { retry: 2 });
    } catch (e) {
      expect(e).toBe('times * 2');
    }
    try {
      await get<{ username: string; id: number }>(
        { url: '/user', data: { key: 6 } },
        { retry: 10 },
      );
    } catch (e) {
      expect(e).toBe('times * 10');
    }
  });
  test('第3次成功', async () => {
    expect.assertions(2);
    try {
      await get<{ username: string; id: number }>(
        { url: '3', data: { code: 200, data: {}, msg: 'success' } },
        { tag: 'cancel', retry: 2 },
      );
    } catch (e) {
      expect(e).toBe('times * 2');
    }
    const res = await get<{ username: string; id: number }>(
      { url: '3' },
      { tag: 'cancel', retry: 3 },
    );
    expect(res).toEqual({ code: 200, data: {}, msg: 'success' });
  });
  test('请求成功，但statusHandler认为是失败的', async () => {
    let retryTimes = 0;
    const res = await get(
      { url: '/success' },
      {
        retry: 2,
        statusHandlers: {
          default(_, _res, data): Promise<void> | void {
            const {
              data: { times },
            } = data as ResType<{ times: number }>;
            retryTimes = times;
            // 当重试次数小于2时，认为是失败的
            if (times < 2) return Promise.reject('fail');
          },
        },
      },
    );
    expect(retryTimes).toBe(2);
    expect(res).toEqual({ code: 200, data: { times: 2 }, msg: 'success' });
  });

  test('cache&retry，有retry时不要用缓存', async () => {
    const req = new AxiosRequestTemplate();
    const c = new Cache();
    const originSet = c.set;
    const mockSet = jest.fn((...args: any) => originSet.apply(c, args));
    c.set = mockSet;
    const originGet = c.get;
    const mockGet = jest.fn((...args: any) => originGet.apply(c, args));
    c.get = mockGet;
    (req as any).cache = c;
    (req as any).afterRequest = () => void 0;

    const get = req.methodFactory('get');

    const res = await get({ url: '/config', params: { test: 1 } }, { retry: 10, cache: true });
    delete (res as any).cancelToken;
    expect(res).toEqual({
      method: 'get',
      url: '/config',
      params: { test: 1 },
    });
    expect(mockGet.mock.calls.length).toBe(1);
    expect(mockSet.mock.calls.length).toBe(1);
  });
  describe('immediate', () => {
    test('use', async () => {
      let res: any;
      const p = get(
        { url: '/user', data: { use: 1 } },
        { retry: { times: 1, immediate: true, interval: 1000 } },
      );
      p.catch((r) => (res = r));

      await sleep(0);
      expect(res).toBeUndefined();

      await sleep(10);
      expect(res).toBe('times * 1');
    });
    test('unused', async () => {
      let res: any;
      const p = get(
        { url: '/user', data: { use: 2 } },
        { retry: { times: 1, immediate: false, interval: 50 } },
      );
      p.catch((r) => (res = r));

      await sleep(20);
      expect(res).toBeUndefined();

      await sleep(50);
      expect(res).toBe('times * 1');
    });
  });

  describe('cancel', () => {
    const req = new AxiosRequestTemplate();
    const get = req.methodFactory('get');
    test('cancelAll', async () => {
      expect.assertions(1);
      try {
        const p = get<{ username: string; id: number }>({ url: '/user' }, { retry: 2 });
        req.cancelAll('cancel');
        await p;
      } catch (e) {
        expect(e).toEqual({ message: 'cancel' });
      }
    });
    test('cancelWithTag', async () => {
      expect.assertions(1);
      try {
        const p = get<{ username: string; id: number }>(
          { url: '/user' },
          { tag: 'cancel', retry: 2 },
        );
        req.cancelWithTag('cancel', 'with tag');
        await p;
      } catch (e) {
        expect(e).toEqual({ message: 'with tag' });
      }
    });
    test('cancelCurrentRequest', async () => {
      expect.assertions(1);
      try {
        const p = get<{ username: string; id: number }>(
          { url: '/user' },
          { tag: 'cancel', retry: 2 },
        );
        req.cancelCurrentRequest?.('cancel');
        await p;
      } catch (e) {
        expect(e).toEqual({ message: 'cancel' });
      }
    });
  });
});
