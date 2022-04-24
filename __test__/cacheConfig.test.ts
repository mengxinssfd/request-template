import { useMockAxios, routers } from './mock-server';
useMockAxios(routers);
import { AxiosRequestTemplate } from '../src';
import { CustomConfig } from '../types';

describe('mock cacheConfig', () => {
  test('empty global', async () => {
    const req = new AxiosRequestTemplate();
    const mock = jest.fn();
    (<any>req).cache.set = mock;
    let mockCallTimes = 0;

    await req.request('/user', {}, { cache: { timeout: 20000 } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20000 });
    ++mockCallTimes;

    await req.request('/user', {}, { cache: { timeout: 20000 } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20000 });
    ++mockCallTimes;

    await req.request('/user', {}, { cache: true });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true });
    ++mockCallTimes;

    await req.request('/user', {}, { cache: { enable: true } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true });
    ++mockCallTimes;
    expect(mock.mock.calls.length).toBe(mockCallTimes);

    await req.request('/user');
    expect(mock.mock.calls.length).toBe(mockCallTimes);

    await req.request('/user', {}, { cache: false });
    expect(mock.mock.calls.length).toBe(mockCallTimes);
  });
  test('global false', async () => {
    const req = new AxiosRequestTemplate<CustomConfig>({}, { cache: false });
    const mock = jest.fn();
    (<any>req).cache.set = mock;
    let mockCallTimes = 0;

    await req.request('/user', {}, { cache: { timeout: 20000 } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20000 });
    ++mockCallTimes;

    await req.request('/user', {}, { cache: { timeout: 20000 } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20000 });
    ++mockCallTimes;

    await req.request('/user', {}, { cache: true });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true });
    ++mockCallTimes;

    await req.request('/user', {}, { cache: { enable: true } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true });
    ++mockCallTimes;
    expect(mock.mock.calls.length).toBe(mockCallTimes);

    await req.request('/user');
    expect(mock.mock.calls.length).toBe(mockCallTimes);

    await req.request('/user', {}, { cache: false });
    expect(mock.mock.calls.length).toBe(mockCallTimes);
  });
  test('global true', async () => {
    const req = new AxiosRequestTemplate<CustomConfig>({}, { cache: true });
    const mock = jest.fn();
    (<any>req).cache.set = mock;
    let mockCallTimes = 0;

    await req.request('/user', {}, { cache: { timeout: 20000 } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20000 });
    ++mockCallTimes;

    await req.request('/user', {}, { cache: { timeout: 20000 } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20000 });
    ++mockCallTimes;

    await req.request('/user', {}, { cache: true });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true });
    ++mockCallTimes;

    await req.request('/user', {}, { cache: { enable: true } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true });
    ++mockCallTimes;
    expect(mock.mock.calls.length).toBe(mockCallTimes);

    await req.request('/user');
    ++mockCallTimes;
    expect(mock.mock.calls.length).toBe(mockCallTimes);

    await req.request('/user', {}, { cache: false });
    expect(mock.mock.calls.length).toBe(mockCallTimes);
  });
  test('global object true', async () => {
    const req = new AxiosRequestTemplate<CustomConfig>({}, { cache: { enable: true } });
    const mock = jest.fn();
    (<any>req).cache.set = mock;
    let mockCallTimes = 0;

    await req.request('/user', {}, { cache: { timeout: 20000 } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20000 });
    ++mockCallTimes;

    await req.request('/user', {}, { cache: { timeout: 20000 } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20000 });
    ++mockCallTimes;

    await req.request('/user', {}, { cache: true });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true });
    ++mockCallTimes;

    await req.request('/user', {}, { cache: { enable: true } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true });
    ++mockCallTimes;
    expect(mock.mock.calls.length).toBe(mockCallTimes);

    await req.request('/user');
    ++mockCallTimes;
    expect(mock.mock.calls.length).toBe(mockCallTimes);

    await req.request('/user', {}, { cache: false });
    expect(mock.mock.calls.length).toBe(mockCallTimes);
  });
  test('mixin', async () => {
    const req = new AxiosRequestTemplate<CustomConfig>(
      {},
      { cache: { enable: true, timeout: 20 } },
    );
    const mock = jest.fn();
    (<any>req).cache.set = mock;
    let mockCallTimes = 0;

    await req.request('/user', {}, { cache: { timeout: 20000 } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20000 });
    ++mockCallTimes;

    await req.request('/user', {}, { cache: { timeout: 20000 } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20000 });
    ++mockCallTimes;

    await req.request('/user', {}, { cache: true });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20 });
    ++mockCallTimes;

    await req.request('/user', {}, { cache: { enable: true } });
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20 });
    ++mockCallTimes;
    expect(mock.mock.calls.length).toBe(mockCallTimes);

    await req.request('/user');
    expect(mock.mock.calls[mockCallTimes][2]).toEqual({ enable: true, timeout: 20 });
    ++mockCallTimes;

    await req.request('/user', {}, { cache: false });
    expect(mock.mock.calls.length).toBe(mockCallTimes);
  });
});
