import { useMockAxios, routers } from './mock-server';
useMockAxios(routers);
import { AxiosRequestTemplate, CustomConfig } from '../src';
import './utils';
describe('mock cacheConfig', () => {
  test('empty global', async () => {
    const req = new AxiosRequestTemplate();
    const mock = jest.fn();
    (<any>req).cache.set = mock;
    let mockCallTimes = 0;

    await req.request({ url: '/user' }, { cache: { timeout: 20000 } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20000 });
    ++mockCallTimes;

    await req.request({ url: '/user' }, { cache: { timeout: 20000 } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20000 });
    ++mockCallTimes;

    await req.request({ url: '/user' }, { cache: true });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true });
    ++mockCallTimes;

    await req.request({ url: '/user' }, { cache: { enable: true } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true });
    ++mockCallTimes;
    expect(mock.mock.calls.length).toBe(mockCallTimes);

    await req.request({ url: '/user' });
    expect(mock.mock.calls.length).toBe(mockCallTimes);

    await req.request({ url: '/user' }, { cache: false });
    expect(mock.mock.calls.length).toBe(mockCallTimes);
  });
  test('global false', async () => {
    const req = new AxiosRequestTemplate<CustomConfig>({ customConfig: { cache: false } });
    const mock = jest.fn();
    (<any>req).cache.set = mock;
    let mockCallTimes = 0;

    await req.request({ url: '/user' }, { cache: { timeout: 20000 } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20000 });
    ++mockCallTimes;

    await req.request({ url: '/user' }, { cache: { timeout: 20000 } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20000 });
    ++mockCallTimes;

    await req.request({ url: '/user' }, { cache: true });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true });
    ++mockCallTimes;

    await req.request({ url: '/user' }, { cache: { enable: true } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true });
    ++mockCallTimes;
    expect(mock.mock.calls.length).toBe(mockCallTimes);

    await req.request({ url: '/user' });
    expect(mock.mock.calls.length).toBe(mockCallTimes);

    await req.request({ url: '/user' }, { cache: false });
    expect(mock.mock.calls.length).toBe(mockCallTimes);
  });
  test('global true', async () => {
    const req = new AxiosRequestTemplate<CustomConfig>({ customConfig: { cache: true } });
    const mock = jest.fn();
    (<any>req).cache.set = mock;
    let mockCallTimes = 0;

    await req.request({ url: '/user' }, { cache: { timeout: 20000 } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20000 });
    ++mockCallTimes;

    await req.request({ url: '/user' }, { cache: { timeout: 20000 } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20000 });
    ++mockCallTimes;

    await req.request({ url: '/user' }, { cache: true });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true });
    ++mockCallTimes;

    await req.request({ url: '/user' }, { cache: { enable: true } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true });
    ++mockCallTimes;
    expect(mock.mock.calls.length).toBe(mockCallTimes);

    await req.request({ url: '/user' });
    ++mockCallTimes;
    expect(mock.mock.calls.length).toBe(mockCallTimes);

    await req.request({ url: '/user' }, { cache: false });
    expect(mock.mock.calls.length).toBe(mockCallTimes);
  });
  test('global object true', async () => {
    const req = new AxiosRequestTemplate<CustomConfig>({
      customConfig: { cache: { enable: true } },
    });
    const mock = jest.fn();
    (<any>req).cache.set = mock;
    let mockCallTimes = 0;

    await req.request({ url: '/user' }, { cache: { timeout: 20000 } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20000 });
    ++mockCallTimes;

    await req.request({ url: '/user' }, { cache: { timeout: 20000 } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20000 });
    ++mockCallTimes;

    await req.request({ url: '/user' }, { cache: true });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true });
    ++mockCallTimes;

    await req.request({ url: '/user' }, { cache: { enable: true } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true });
    ++mockCallTimes;
    expect(mock.mock.calls.length).toBe(mockCallTimes);

    await req.request({ url: '/user' });
    ++mockCallTimes;
    expect(mock.mock.calls.length).toBe(mockCallTimes);

    await req.request({ url: '/user' }, { cache: false });
    expect(mock.mock.calls.length).toBe(mockCallTimes);
  });
  test('mixin', async () => {
    const req = new AxiosRequestTemplate<CustomConfig>({
      customConfig: { cache: { enable: true, timeout: 20 } },
    });
    const mock = jest.fn();
    (<any>req).cache.set = mock;
    let mockCallTimes = 0;

    await req.request({ url: '/user' }, { cache: { timeout: 20000 } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20000 });
    ++mockCallTimes;

    await req.request({ url: '/user' }, { cache: { timeout: 20000 } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20000 });
    ++mockCallTimes;

    await req.request({ url: '/user' }, { cache: true });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20 });
    ++mockCallTimes;

    await req.request({ url: '/user' }, { cache: { enable: true } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20 });
    ++mockCallTimes;
    expect(mock.mock.calls.length).toBe(mockCallTimes);

    await req.request({ url: '/user' });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20 });
    ++mockCallTimes;

    await req.request({ url: '/user' }, { cache: false });
    expect(mock.mock.calls.length).toBe(mockCallTimes);
  });
  test('refresh', async () => {
    const req = new AxiosRequestTemplate<CustomConfig>();
    (req as any).generateRequestKey = function (ctx) {
      return ctx.requestConfig.url;
    };
    const res = await req.request({ url: '/data', data: { a: 1 } }, { cache: { timeout: 20000 } });
    expect(res).toEqual({ a: 1 });

    // 复用1
    const res2 = await req.request({ url: '/data', data: { a: 2 } }, { cache: { timeout: 20000 } });
    expect(res2).toBe(res);

    // 刷新
    const res3 = await req.request(
      { url: '/data', data: { a: 3 } },
      { cache: { timeout: 20000, refresh: true } },
    );
    expect(res3).toEqual({ a: 3 });

    // 复用3
    const res4 = await req.request({ url: '/data', data: { a: 4 } }, { cache: { timeout: 20000 } });
    expect(res4).toEqual({ a: 3 });

    // 复用3
    const res5 = await req.request({ url: '/data', data: { a: 5 } }, { cache: { timeout: 20000 } });
    expect(res5).toEqual({ a: 3 });
  });
  test('deleteCacheByTag', async () => {
    const req = new AxiosRequestTemplate<CustomConfig>();
    (req as any).generateRequestKey = function (ctx) {
      return ctx.requestConfig.url;
    };
    const tag = Symbol('tag');
    const res = await req.request(
      { url: '/data', data: { a: 1 } },
      { cache: { timeout: 20000 }, tag },
    );
    expect(res).toEqual({ a: 1 });

    // 复用1
    const res2 = await req.request(
      { url: '/data', data: { a: 2 } },
      { cache: { timeout: 20000 }, tag },
    );
    expect(res2).toBe(res);

    req.deleteCacheByTag(tag);
    const res3 = await req.request({ url: '/data', data: { a: 3 } }, { cache: { timeout: 20000 } });
    expect(res3).toEqual({ a: 3 });

    // 复用3
    const res4 = await req.request({ url: '/data', data: { a: 4 } }, { cache: { timeout: 20000 } });
    expect(res4).toEqual({ a: 3 });

    // 复用3
    const res5 = await req.request({ url: '/data', data: { a: 5 } }, { cache: { timeout: 20000 } });
    expect(res5).toEqual({ a: 3 });
  });
});
