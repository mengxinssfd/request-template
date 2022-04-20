import axios, { AxiosRequestConfig } from 'axios';
import { routers as r } from './mock-server';
const routers = {
  ...r,
  '/create': () => {
    return Promise.resolve({ status: 200, data: { code: 500, msg: 111 } });
  },
};
jest.mock('axios');
const mockCreate = (config: AxiosRequestConfig) => {
  type InterceptorCB = (config: AxiosRequestConfig) => AxiosRequestConfig | void;
  const interceptors = {
    request: [] as InterceptorCB[],
  };
  function AxiosIns({ url, data, params }) {
    const cfg = interceptors.request.reduce((prev, cur) => {
      return cur(config) || config;
    }, config);
    if (cfg) Object.assign(config, cfg);
    return (routers[url] || routers['404'])(data || params);
  }
  AxiosIns.interceptors = {
    request: {
      use: (cb: InterceptorCB) => {
        interceptors.request.push(cb);
      },
    },
  };
  return AxiosIns;
};

(axios as any).create.mockImplementation(mockCreate);
import Other from './Other';

describe('Other', () => {
  const { get, post } = Other;

  test('base', async () => {
    const res = await get<{ username: string; id: number }, true>('/user');
    expect(res).toEqual({ code: 200, data: { username: 'get', id: 1 }, msg: 'success' });

    const res1 = await get<{ username: string; id: number }, true>(
      '/user',
      {},
      { returnRes: true },
    );
    expect(res1).toEqual({
      status: 200,
      data: { code: 200, data: { username: 'get', id: 1 }, msg: 'success' },
    });

    const res3 = await post('/login', { username: 'foo', password: 'bar' });
    expect(res3).toEqual({ code: 200, msg: 'success' });

    try {
      await post('/login', { username: 'foo' });
    } catch (e) {
      expect(e).toEqual({ code: 0, msg: '账号或密码错误' });
    }

    const res5 = await post('/create');
    expect(res5).toEqual({ code: 500, msg: 111 });
    const res6 = await post<any, true>('/create', undefined, { returnRes: true });
    expect(res6).toEqual({ status: 200, data: { code: 500, msg: 111 } });
  });
});
