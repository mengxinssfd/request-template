import { routers as r, useMockAxios } from './mock-server';
const routers = {
  ...r,
  '/create': () => {
    return Promise.resolve({ status: 200, data: { code: 500, msg: 111 } });
  },
};
useMockAxios(routers);

import Other from './Other';

describe('Other', () => {
  const { get, post } = Other;

  test('base', async () => {
    expect.assertions(7);
    const res = await get<{ username: string; id: number }, true>({ url: '/user' });
    expect(res).toEqual({ code: 200, data: { username: 'get', id: 1 }, msg: 'success' });

    const res1 = await get<{ username: string; id: number }, true>(
      { url: '/user' },
      { returnRes: true },
    );
    expect(res1).toEqual({
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

    const res5 = await post({ url: '/create' });
    expect(res5).toEqual({ code: 500, msg: 111 });
    const res6 = await post<any, true>({ url: '/create' }, { returnRes: true });
    expect(res6).toEqual({ status: 200, data: { code: 500, msg: 111 } });

    try {
      await post({ url: '/login2', data: { username: 'foo' } });
    } catch (e) {
      expect(e).toBe('404');
    }
  });
});
