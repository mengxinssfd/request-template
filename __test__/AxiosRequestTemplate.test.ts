import axios from 'axios';
import { routers } from './mock-server';
import { StatusHandlers, AxiosRequestTemplate, CustomConfig } from '../src';

jest.mock('axios');
const map = new Map<string, Function>();
const mockCreate = (/*config: AxiosRequestConfig*/) => {
  // console.log(config);
  return function ({ url, data, params, method, cancelToken }) {
    return new Promise((res, rej) => {
      map.set(cancelToken, rej);
      (routers[url] || routers['404'])(data || params, method).then(res, rej);
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

describe('AxiosRequestTemplate', () => {
  const statusHandlers: StatusHandlers = {
    200: (ctx, res, data) => {
      return ctx.customConfig.returnRes ? res : data;
    },
    default: (ctx, res, data) => {
      return ctx.customConfig.returnRes ? res : data;
    },
  };
  const req = new AxiosRequestTemplate<CustomConfig>({
    requestConfig: { baseURL: '/' },
    customConfig: { statusHandlers },
  });
  const get = req.methodFactory('get');
  const post = req.methodFactory('post');

  test('base', async () => {
    expect.assertions(4);
    // console.log((axios.create({ url: 'test' }) as any)(1, 2, 3), Req);
    const res = await get<{ username: string; id: number }>({ url: '/user' });
    expect(res).toEqual({ code: 200, data: { username: 'get', id: 1 }, msg: 'success' });

    const res2 = await get<{ username: string; id: number }, true>(
      { url: '/user' },
      { returnRes: true },
    );
    expect(res2).toEqual({
      status: 200,
      data: { code: 200, data: { username: 'get', id: 1 }, msg: 'success' },
    });

    const res3 = await post({ url: '/login', data: { username: 'foo', password: 'bar' } });
    expect(res3).toEqual({ code: 200, msg: 'success' });

    try {
      await post({ url: '/login', data: { username: 'foo' } });
    } catch (e) {
      expect(e).toEqual({ code: 0, msg: '账号或密码错误' });
    }
  });

  describe('AxiosWrapper Cache', () => {
    test('no cache', async () => {
      const res = await get<{ username: string; id: number }>({ url: '/user' });
      expect(res).toEqual({ code: 200, data: { username: 'get', id: 1 }, msg: 'success' });
      const res2 = await get<{ username: string; id: number }>({ url: '/user' });
      expect(res2).toEqual(res);
      expect(res2).not.toBe(res);
    });
    test('cache', async () => {
      const res = await get<{ username: string; id: number }>({ url: '/user' }, { cache: true });
      expect(res).toEqual({ code: 200, data: { username: 'get', id: 1 }, msg: 'success' });
      const res2 = await get<{ username: string; id: number }>(
        { url: '/user' },
        {
          cache: { timeout: 1000 },
        },
      );
      expect(res2).toEqual(res);
      expect(res2).toBe(res);
    });
    test('global cache object', async () => {
      const req = new AxiosRequestTemplate({ customConfig: { cache: {} } });
      const get = req.methodFactory('get');
      const res = await get<{ username: string; id: number }>({ url: '/user' });
      expect(res).toEqual({ code: 200, data: { username: 'get', id: 1 }, msg: 'success' });
      const res2 = await get<{ username: string; id: number }>({ url: '/user' });
      expect(res2).toEqual(res);
      expect(res2).toBe(res);
    });
    test('global cache empty object', async () => {
      const req = new AxiosRequestTemplate<CustomConfig>({ customConfig: { cache: true } });
      const get = req.methodFactory('get');
      const res = await get<{ username: string; id: number }>({ url: '/user' });
      expect(res).toEqual({ code: 200, data: { username: 'get', id: 1 }, msg: 'success' });
      const res2 = await get<{ username: string; id: number }>({ url: '/user' });
      expect(res2).toEqual(res);
      expect(res2).toBe(res);

      const res3 = await get<{ username: string; id: number }>({ url: '/user' }, { cache: false });
      expect(res3).toEqual(res);
      expect(res3).not.toBe(res);
    });
    test('global cache empty object', async () => {
      const req = new AxiosRequestTemplate<CustomConfig>({
        customConfig: { cache: { enable: false, timeout: 1000 * 60 } },
      });
      const get = req.methodFactory('get');
      const res = await get<{ username: string; id: number }>({ url: '/user' });
      expect(res).toEqual({ code: 200, data: { username: 'get', id: 1 }, msg: 'success' });
      const res2 = await get<{ username: string; id: number }>({ url: '/user' }, { cache: true });
      expect(res2).toEqual(res);
      expect(res2).not.toBe(res);

      const res3 = await get<{ username: string; id: number }>({ url: '/user' }, { cache: true });
      expect(res3).toEqual(res);
      expect(res3).not.toBe(res);
      expect(res3).toBe(res2);
    });
  });

  test('serve 404', async () => {
    expect.assertions(3);
    try {
      await get({ url: '/test' });
    } catch (e) {
      expect(e).toBe('404');
    }
    const res = await post({ url: '/test', data: { returnRes: 1 } });
    expect(res).toEqual({ code: 200 });
    const res2 = await post({ url: '/test', data: { returnRes: 2 } });
    expect(res2).toEqual({ code: 300 });
  });
  test('default constructor params', async () => {
    const req = new AxiosRequestTemplate<CustomConfig>();
    const get = req.methodFactory('get');
    const res = await get<{ username: string; id: number }>(
      { url: '/user' },
      {
        statusHandlers: { '200': (ctx, res) => res },
      },
    );
    expect(res).toEqual({
      data: { code: 200, data: { username: 'get', id: 1 }, msg: 'success' },
      status: 200,
    });
    // 不传method时默认为get
    const defGet = req.methodFactory(undefined as any);
    const res1 = await defGet<{ username: string; id: number }>(
      { url: '/user' },
      {
        statusHandlers: { '200': (_, res) => res },
      },
      // 改为post，无效；
      // methodFactory的method优先级更高，除了method，url，data其他的axios配置优先级都是这里的高
      // { method: 'post' } as any,
    );
    expect(res1).toEqual({
      data: { code: 200, data: { username: 'get', id: 1 }, msg: 'success' },
      status: 200,
    });

    // 不传method时默认为get
    const res2 = await req.request<{ username: string; id: number }>(
      { url: '/user' },
      {
        statusHandlers: { '200': (_, res) => res },
      },
    );

    expect(res2).toEqual({
      data: { code: 200, data: { username: 'get', id: 1 }, msg: 'success' },
      status: 200,
    });

    const res3 = await req.request<{ username: string; id: number }>(
      { url: '/user', method: 'post' },
      {
        statusHandlers: { '200': (_, res) => res },
      },
    );
    expect(res3).toEqual({
      data: { code: 200, data: { username: 'post', id: 2 }, msg: 'success' },
      status: 200,
    });
  });
  test('nocode', async () => {
    expect.assertions(2);
    const res = await get({ url: '/nocode' });
    expect(res).toBe('1');
    const res2 = await get({ url: '/nocode' }, { returnRes: true });
    expect(res2).toEqual({ data: '1', status: 200 });
  });
  test('global customConfig', async () => {
    const req = new AxiosRequestTemplate({ customConfig: { returnRes: true, statusHandlers } });
    const get = req.methodFactory('get');
    const res = await get<{ username: string; id: number }, true>({ url: '/user' });
    expect(res).toEqual({
      status: 200,
      data: { code: 200, data: { username: 'get', id: 1 }, msg: 'success' },
    });
  });
  test('cancel all', async () => {
    const req = new AxiosRequestTemplate();
    const get = req.methodFactory('get');
    const reqList = [get({ url: '/user' }), get({ url: '/user' }), get({ url: '/user' })];
    req.cancelAll('test');

    const res = await Promise.allSettled(reqList);

    expect(res).toEqual([
      { status: 'rejected', reason: 'test' },
      { status: 'rejected', reason: 'test' },
      { status: 'rejected', reason: 'test' },
    ]);
  });
  test('cancel current', async () => {
    const req = new AxiosRequestTemplate();
    const get = req.methodFactory('get');
    const res1 = get({ url: '/user' });
    req.cancelCurrentRequest?.('cancel1');
    const res2 = get({ url: '/user' });
    req.cancelCurrentRequest?.('cancel2');
    const res3 = get({ url: '/user' });
    req.cancelCurrentRequest?.('cancel3');

    const res = await Promise.allSettled([res1, res2, res3]);

    expect(res).toEqual([
      { status: 'rejected', reason: 'cancel1' },
      { status: 'rejected', reason: 'cancel2' },
      { status: 'rejected', reason: 'cancel3' },
    ]);
  });
  test('cancel with tag', async () => {
    const req = new AxiosRequestTemplate<CustomConfig>({ customConfig: { tag: 'cancellable' } });
    const get = req.methodFactory('get');
    const res1 = get({ url: '/user' }, { tag: 'irrevocable' });
    const res2 = get({ url: '/user' });
    const res3 = get({ url: '/user' });
    const symbol = Symbol('cancel');
    const symbol1 = Symbol('cancel');
    const res4 = get({ url: '/user' }, { tag: symbol });
    const res5 = get({ url: '/user' }, { tag: symbol1 });
    req.cancelWithTag('cancellable', 'cancel with tag');
    req.cancelWithTag(symbol, 'cancel with tag symbol');

    const res = await Promise.allSettled([res1, res2, res3, res4, res5]);

    expect(res).toEqual([
      {
        status: 'fulfilled',
        value: { code: 200, data: { id: 1, username: 'get' }, msg: 'success' },
      },
      { status: 'rejected', reason: 'cancel with tag' },
      { status: 'rejected', reason: 'cancel with tag' },
      { status: 'rejected', reason: 'cancel with tag symbol' },
      {
        status: 'fulfilled',
        value: { code: 200, data: { id: 1, username: 'get' }, msg: 'success' },
      },
    ]);
    req.cancelWithTag('default', 'cancel with tag');
  });
  test('mixin cancel', async () => {
    const req = new AxiosRequestTemplate({ customConfig: { tag: 'cancellable' } });
    const get = req.methodFactory('get');
    const res1 = get({ url: '/user' });
    req.cancelCurrentRequest?.('cancelCurrent');
    const res2 = get({ url: '/user' });
    const res3 = get({ url: '/user' });
    req.cancelAll('cancelAll');
    req.cancelWithTag('cancellable', 'cancel with tag');

    const res = await Promise.allSettled([res1, res2, res3]);

    expect(res).toEqual([
      { status: 'rejected', reason: 'cancelCurrent' },
      { status: 'rejected', reason: 'cancelAll' },
      { status: 'rejected', reason: 'cancelAll' },
    ]);
  });
  test('test config', async () => {
    const req = new AxiosRequestTemplate<CustomConfig>({
      customConfig: {
        statusHandlers: {
          1000: ({ customConfig, requestConfig }, res) => {
            customConfig = { ...customConfig };
            requestConfig = { ...requestConfig };
            delete customConfig.statusHandlers;
            delete requestConfig.cancelToken;
            return customConfig.returnRes ? res : { requestConfig, customConfig };
          },
        },
      },
    });
    const get = req.methodFactory('get');
    const post = req.methodFactory('post');
    const res1 = get({ url: '/config' }, { cache: true });
    const res2 = get({ url: '/config', headers: { test: 1 } });
    const res3 = post({ url: '/config' });

    const res = await Promise.all([res1, res2, res3]);

    expect(res).toEqual([
      {
        customConfig: {
          cache: {
            enable: true,
          },
          retry: {},
        },
        requestConfig: {
          method: 'get',
          url: '/config',
        },
      },
      {
        customConfig: {
          cache: {},
          retry: {},
        },
        requestConfig: {
          headers: {
            test: 1,
          },
          method: 'get',
          url: '/config',
        },
      },
      {
        customConfig: {
          cache: {},
          retry: {},
        },
        requestConfig: {
          method: 'post',
          url: '/config',
        },
      },
    ]);
  });
});
