import axios from 'axios';
import { routers } from './mock-server';
import { StatusHandlers, AxiosWrapper, CustomConfig } from '../src';

jest.mock('axios');
const mockCreate = (/*config: AxiosRequestConfig*/) => {
  // console.log(config);
  return function ({ url, data, params, method }) {
    return (routers[url] || routers['404'])(data || params, method);
  };
};

(axios as any).create.mockImplementation(mockCreate);

describe('AxiosWrapper', () => {
  const statusHandlers: StatusHandlers = {
    200: (res, data, customConfig) => {
      return customConfig.returnRes ? res : data;
    },
  };
  const req = new AxiosWrapper<CustomConfig>({ baseURL: '/' }, { statusHandlers });
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

    const res3 = await post('/login', { username: 'foo', password: 'bar' });
    expect(res3).toEqual({ code: 200, msg: 'success' });

    try {
      await post('/login', { username: 'foo' });
    } catch (e) {
      expect(e).toEqual({ code: 0, msg: '账号或密码错误' });
    }
  });
  test('no cache', async () => {
    const res = await get<{ username: string; id: number }>('/user');
    expect(res).toEqual({ code: 200, data: { username: 'get', id: 1 }, msg: 'success' });
    const res2 = await get<{ username: string; id: number }>('/user');
    expect(res2).toEqual(res);
    expect(res2).not.toBe(res);
  });
  test('cache', async () => {
    const res = await get<{ username: string; id: number }>('/user', undefined, { useCache: true });
    expect(res).toEqual({ code: 200, data: { username: 'get', id: 1 }, msg: 'success' });
    const res2 = await get<{ username: string; id: number }>('/user', undefined, {
      useCache: { timeout: 1000 },
    });
    expect(res2).toEqual(res);
    expect(res2).toBe(res);
  });
  test('serve 404', async () => {
    try {
      await get('/test');
    } catch (e) {
      expect(e).toBe('404');
    }
    const res = await post('/test', { returnRes: 1 });
    expect(res).toEqual({ code: 200 });
  });
  test('default constructor params', async () => {
    const req = new AxiosWrapper();
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
    const req = new AxiosWrapper<CustomConfig<boolean>>({}, { returnRes: true, statusHandlers });
    const get = req.methodFactory('get');
    const res = await get<{ username: string; id: number }>('/user', undefined);
    expect(res).toEqual({
      status: 200,
      data: { code: 200, data: { username: 'get', id: 1 }, msg: 'success' },
    });
  });
});
