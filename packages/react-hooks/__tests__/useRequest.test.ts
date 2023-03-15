import { useRequest } from '../src';
import { sleep } from '@tool-pack/basic';
import { useState } from 'react';
import { renderHook, act } from '@testing-library/react';

// 模拟请求api
function requestFn<T extends { a: number; b: string }>(data: T): Promise<{ data: T }> {
  return new Promise<any>((resolve) => {
    setTimeout(resolve, 5, { data });
  });
}
const mockRequest = jest.fn(requestFn);
const mockRequestFail = jest.fn((data: { a: number; b: string }) => {
  return Promise.reject('error:' + JSON.stringify(data));
});

describe('useRequest react', function () {
  afterEach(() => {
    mockRequest.mock.calls.length = 0;
    mockRequestFail.mock.calls.length = 0;
  });
  test('renderHook', () => {
    const { result } = renderHook(() => useState(0));
    const [, setState] = result.current;
    expect(result.current[0]).toBe(0);
    act(() => setState(1));
    expect(result.current[0]).toBe(1);
  });
  test('手动调用', async () => {
    const { result } = renderHook(() => useRequest(mockRequest));
    const { request: requestFn } = result.current;
    expect(typeof requestFn === 'function').toBeTruthy();

    // 初始时data值为null，loading还是false，请求也没调用过
    expect(result.current.data).toBe(null);
    expect(result.current.loading).toBeFalsy();
    expect(mockRequest).not.toBeCalled();

    const _data = { a: 1, b: '2' };
    act(() => {
      requestFn(_data);
    });
    // 请求手动调用后，data为null，loading是true，请求被调用过
    expect(result.current.data).toBe(null);
    expect(result.current.loading).toBeTruthy();
    expect(mockRequest.mock.calls.length).toBe(1);
    expect(mockRequest.mock.calls[0][0]).toBe(_data);

    // await sleep(20);
    await act(() => sleep(20));

    // 请求完成后，data为_data，loading是false
    expect(result.current.data).toEqual(_data);
    expect(result.current.loading).toBeFalsy();
    expect(mockRequest.mock.calls.length).toBe(1);
  });
  test('手动调用:请求失败', async () => {
    const mockFn = mockRequestFail;
    const { result } = renderHook(() => useRequest(mockFn));

    const { request } = result.current;

    expect(typeof request === 'function').toBeTruthy();

    // 初始时data值为null，loading还是false，请求也没调用过
    expect(result.current.data).toBe(null);
    expect(result.current.loading).toBeFalsy();
    expect(mockFn).not.toBeCalled();
    expect(result.current.error).toBe(null);

    const params = { a: 1, b: '2' };
    act(() => {
      request(params);
      // loading中，不会被调用
      request(params);
    });
    // 请求手动调用后，data为null，error是null，loading是true，请求被调用过
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
    expect(result.current.loading).toBeTruthy();
    expect(mockFn.mock.calls.length).toBe(1);
    expect(mockFn.mock.calls[0][0]).toBe(params);

    await act(() => sleep(20));

    // 请求完成后，data为_data，loading是false，error是string
    expect(result.current.data).toBe(null);
    expect(result.current.loading).toBeFalsy();
    expect(mockFn.mock.calls.length).toBe(1);
    expect(result.current.error).toBe('error:' + JSON.stringify(params));

    // 第二次请求
    const params2 = { a: 2, b: '2' };
    act(() => {
      request(params2);
    });
    // 请求手动调用后，data为null，error是null，loading是true，请求被调用过
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
    expect(result.current.loading).toBeTruthy();
    expect(mockFn.mock.calls.length).toBe(2);
    expect(mockFn.mock.calls[1][0]).toBe(params2);

    await act(() => sleep(20));
    // 请求完成后，data为_data，loading是false，error是string
    expect(result.current.data).toBe(null);
    expect(result.current.loading).toBeFalsy();
    expect(mockFn.mock.calls.length).toBe(2);
    expect(result.current.error).toBe('error:' + JSON.stringify(params2));
  });
  test('默认值', async () => {
    const params = { a: 1, b: '2' };

    // 有默认Data
    const { result } = renderHook(() => useRequest(requestFn, params));
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBe(null);
    expect(result.current.data.a).toBe(1);

    // 无默认Data
    const { result: result2 } = renderHook(() => useRequest(requestFn));
    expect(result2.current.loading).toBeFalsy();
    expect(result2.current.error).toBe(null);
    // 未传默认data时，data可能是null，所以要加可选连
    expect(result2.current.data?.a).toBe(undefined);
    expect(() => {
      // @ts-expect-error
      console.log(result2.data.a);
    }).toThrow();
  });
  test('默认值：失败请求', async () => {
    const { result } = renderHook(() => {
      const req = (): Promise<{ data: { a: string } }> => Promise.reject('fail');
      return useRequest(req, { a: '1' });
    });
    const { request } = result.current;
    expect(result.current.data.a).toBe('1');
    // result.current.data = { a: '2' };
    // expect(result.current.data.a).toBe('2');
    await act(() => request());
    expect(result.current.data.a).toBe('1');
  });
});
