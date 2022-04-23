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

describe('AxiosWrapper', () => {
  const statusHandlers: StatusHandlers = {
    200: (res, data, customConfig) => {
      return customConfig.returnRes ? res : data;
    },
    default: (res, data, customConfig) => {
      return customConfig.returnRes ? res : data;
    },
  };
  const req = new AxiosRequestTemplate<CustomConfig>({ baseURL: '/' }, { statusHandlers });
  const get = req.methodFactory('get');
  const post = req.methodFactory('post');

  test('base', async () => {
    // console.log((axios.create({ url: 'test' }) as any)(1, 2, 3), Req);
    const res = await get<{ username: string; id: number }>('/user');
    expect(res).toEqual({ code: 200, data: { username: 'get', id: 1 }, msg: 'success' });

    const res2 = await get<{ username: string; id: number }, true>(
      '/user',
      {},
      { returnRes: true },
    );
    expect(res2).toEqual({
      status: 200,
      data: { code: 200, data: { username: 'get', id: 1 }, msg: 'success' },
    });

    const fd = new FormData();
    fd.append('username', 'foo');
    fd.append('password', 'bar');
    const res3 = await post('/login', fd);
    expect(res3).toEqual({ code: 200, msg: 'success' });

    try {
      await post('/login', { username: 'foo' });
    } catch (e) {
      expect(e).toEqual({ code: 0, msg: '账号或密码错误' });
    }
  });

  describe('AxiosWrapper Cache', () => {
    test('no cache', async () => {
      const res = await get<{ username: string; id: number }>('/user');
      expect(res).toEqual({ code: 200, data: { username: 'get', id: 1 }, msg: 'success' });
      const res2 = await get<{ username: string; id: number }>('/user');
      expect(res2).toEqual(res);
      expect(res2).not.toBe(res);
    });
    test('cache', async () => {
      const res = await get<{ username: string; id: number }>('/user', undefined, { cache: true });
      expect(res).toEqual({ code: 200, data: { username: 'get', id: 1 }, msg: 'success' });
      const res2 = await get<{ username: string; id: number }>('/user', undefined, {
        cache: { timeout: 1000 },
      });
      expect(res2).toEqual(res);
      expect(res2).toBe(res);
    });
    test('global cache object', async () => {
      const req = new AxiosRequestTemplate({}, { cache: {} });
      const get = req.methodFactory('get');
      const res = await get<{ username: string; id: number }>('/user');
      expect(res).toEqual({ code: 200, data: { username: 'get', id: 1 }, msg: 'success' });
      const res2 = await get<{ username: string; id: number }>('/user');
      expect(res2).toEqual(res);
      expect(res2).toBe(res);
    });
    test('global cache empty object', async () => {
      const req = new AxiosRequestTemplate<CustomConfig>({}, { cache: true });
      const get = req.methodFactory('get');
      const res = await get<{ username: string; id: number }>('/user');
      expect(res).toEqual({ code: 200, data: { username: 'get', id: 1 }, msg: 'success' });
      const res2 = await get<{ username: string; id: number }>('/user');
      expect(res2).toEqual(res);
      expect(res2).toBe(res);

      const res3 = await get<{ username: string; id: number }>('/user', {}, { cache: false });
      expect(res3).toEqual(res);
      expect(res3).not.toBe(res);
    });
    test('global cache empty object', async () => {
      const req = new AxiosRequestTemplate<CustomConfig>(
        {},
        { cache: { enable: false, timeout: 1000 * 60 } },
      );
      const get = req.methodFactory('get');
      const res = await get<{ username: string; id: number }>('/user');
      expect(res).toEqual({ code: 200, data: { username: 'get', id: 1 }, msg: 'success' });
      const res2 = await get<{ username: string; id: number }>('/user', {}, { cache: true });
      expect(res2).toEqual(res);
      expect(res2).not.toBe(res);

      const res3 = await get<{ username: string; id: number }>('/user', {}, { cache: true });
      expect(res3).toEqual(res);
      expect(res3).not.toBe(res);
      expect(res3).toBe(res2);
    });
  });

  test('serve 404', async () => {
    try {
      await get('/test');
    } catch (e) {
      expect(e).toBe('404');
    }
    const res = await post('/test', { returnRes: 1 });
    expect(res).toEqual({ code: 200 });
    const res2 = await post('/test', { returnRes: 2 });
    expect(res2).toEqual({ code: 300 });
  });
  test('default constructor params', async () => {
    const req = new AxiosRequestTemplate();
    const get = req.methodFactory('get');
    const res = await get<{ username: string; id: number }>(
      '/user',
      {},
      {
        statusHandlers: { '200': (res) => res },
      },
    );
    expect(res).toEqual({
      data: { code: 200, data: { username: 'get', id: 1 }, msg: 'success' },
      status: 200,
    });
    // 不传method时默认为get
    const defGet = req.methodFactory(undefined as any);
    const res1 = await defGet<{ username: string; id: number }>(
      '/user',
      {},
      {
        statusHandlers: { '200': (res) => res },
      },
      // 改为post，无效；
      // methodFactory优先级更高，除了method，url，data其他的axios配置优先级都是这里的高
      { method: 'post' },
    );
    expect(res1).toEqual({
      data: { code: 200, data: { username: 'get', id: 1 }, msg: 'success' },
      status: 200,
    });

    // 不传method时默认为get
    const res2 = await req.request<{ username: string; id: number }>(
      '/user',
      {},
      {
        statusHandlers: { '200': (res) => res },
      },
    );
    expect(res2).toEqual({
      data: { code: 200, data: { username: 'get', id: 1 }, msg: 'success' },
      status: 200,
    });

    const res3 = await req.request<{ username: string; id: number }>(
      '/user',
      {},
      {
        statusHandlers: { '200': (res) => res },
      },
      { method: 'post' },
    );
    expect(res3).toEqual({
      data: { code: 200, data: { username: 'post', id: 2 }, msg: 'success' },
      status: 200,
    });
  });
  test('nocode', async () => {
    try {
      await get('/nocode');
    } catch (e) {
      expect(e).toBe('1');
    }
    try {
      await get('/nocode', {}, { returnRes: true });
    } catch (e) {
      expect(e).toEqual({ data: '1', status: 200 });
    }
  });
  test('global customConfig', async () => {
    const req = new AxiosRequestTemplate({}, { returnRes: true, statusHandlers });
    const get = req.methodFactory('get');
    const res = await get<{ username: string; id: number }, true>('/user', undefined);
    expect(res).toEqual({
      status: 200,
      data: { code: 200, data: { username: 'get', id: 1 }, msg: 'success' },
    });
  });
  test('cancel all', async () => {
    const req = new AxiosRequestTemplate();
    const get = req.methodFactory('get');
    const reqList = [get('/user'), get('/user'), get('/user')];
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
    const res1 = get('/user');
    req.cancelCurrentRequest?.('cancel1');
    const res2 = get('/user');
    req.cancelCurrentRequest?.('cancel2');
    const res3 = get('/user');
    req.cancelCurrentRequest?.('cancel3');

    const res = await Promise.allSettled([res1, res2, res3]);

    expect(res).toEqual([
      { status: 'rejected', reason: 'cancel1' },
      { status: 'rejected', reason: 'cancel2' },
      { status: 'rejected', reason: 'cancel3' },
    ]);
  });
  test('cancel with tag', async () => {
    const req = new AxiosRequestTemplate(undefined, { tag: 'cancellable' });
    const get = req.methodFactory('get');
    const res1 = get('/user', {}, { tag: 'irrevocable' });
    const res2 = get('/user');
    const res3 = get('/user');
    req.cancelWithTag('cancellable', 'cancel with tag');

    const res = await Promise.allSettled([res1, res2, res3]);

    expect(res).toEqual([
      {
        status: 'fulfilled',
        value: { code: 200, data: { id: 1, username: 'get' }, msg: 'success' },
      },
      { status: 'rejected', reason: 'cancel with tag' },
      { status: 'rejected', reason: 'cancel with tag' },
    ]);
    req.cancelWithTag('default', 'cancel with tag');
  });
  test('mixin cancel', async () => {
    const req = new AxiosRequestTemplate(undefined, { tag: 'cancellable' });
    const get = req.methodFactory('get');
    const res1 = get('/user');
    req.cancelCurrentRequest?.('cancelCurrent');
    const res2 = get('/user');
    const res3 = get('/user');
    req.cancelAll('cancelAll');
    req.cancelWithTag('cancellable', 'cancel with tag');

    const res = await Promise.allSettled([res1, res2, res3]);

    expect(res).toEqual([
      { status: 'rejected', reason: 'cancelCurrent' },
      { status: 'rejected', reason: 'cancelAll' },
      { status: 'rejected', reason: 'cancelAll' },
    ]);
  });
});
