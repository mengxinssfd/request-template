import AxiosWrapper from '../src';
import axios from 'axios';
import { routers } from './mock-server';
import { StatusHandlers } from '../src/types';

jest.mock('axios');
(axios as any).create.mockReturnValue(
  jest.fn(function ({ url, data, params }) {
    return (routers[url] || routers['404'])(data || params);
  }),
);

describe('AxiosWrapper', () => {
  const statusHandlers: StatusHandlers = {
    200: (res, data, customConfig) => {
      return customConfig.returnRes ? res : data;
    },
  };
  const req = new AxiosWrapper({}, { statusHandlers });
  const get = AxiosWrapper.methodFactory('get', req);
  const post = AxiosWrapper.methodFactory('post', req);

  test('base', async () => {
    // console.log((axios.create({ url: 'test' }) as any)(1, 2, 3), Req);
    const res = await get<{ username: string; id: number }>('/user');
    expect(res).toEqual({ code: 200, data: { username: 'test', id: 1 }, msg: 'success' });

    const res2 = await get<{ username: string; id: number }, true>(
      '/user',
      {},
      { returnRes: true },
    );
    expect(res2).toEqual({
      status: 200,
      data: { code: 200, data: { username: 'test', id: 1 }, msg: 'success' },
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
    expect(res).toEqual({ code: 200, data: { username: 'test', id: 1 }, msg: 'success' });
    const res2 = await get<{ username: string; id: number }>('/user');
    expect(res2).toEqual(res);
    expect(res2).not.toBe(res);
  });
  test('cache', async () => {
    const res = await get<{ username: string; id: number }>('/user', undefined, { useCache: true });
    expect(res).toEqual({ code: 200, data: { username: 'test', id: 1 }, msg: 'success' });
    const res2 = await get<{ username: string; id: number }>('/user', undefined, {
      useCache: true,
    });
    expect(res2).toEqual(res);
    expect(res2).toBe(res);
  });
  test('serve error', async () => {
    try {
      await get<{ username: string; id: number }>('/test');
    } catch (e) {
      expect(e).toBe('404');
    }
    const res = await post<{ username: string; id: number }>('/test', { returnRes: 1 });
    expect(res).toEqual({ code: 200 });
  });
});
