import { useMockAxios, routers } from './mock-server';
useMockAxios(routers);
import Primary from './Primary';

describe('Primary', () => {
  const { get, post } = Primary;

  test('base', async () => {
    expect.assertions(4);
    const res = await get<{ username: string; id: number }, true>({ url: '/user' });
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
});
