import axios, { AxiosRequestConfig } from 'axios';
import { AxiosRequestTemplate } from '../src';
import { mockAxiosResponse } from './utils';

jest.mock('axios');
const map = new Map<string, Function>();
const mockCreate = (/*config: AxiosRequestConfig*/) => {
  // console.log(config);
  return function (config) {
    const { url, cancelToken } = config;
    return new Promise((res, rej) => {
      map.set(cancelToken, rej);
      if (/^\/use/.test(url)) {
        setTimeout(() =>
          res(mockAxiosResponse(config, { code: 200, data: config, msg: 'success' })),
        );
        return;
      }
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
describe('use', () => {
  const req = new AxiosRequestTemplate();
  test('empty', async () => {
    const request = req.use({});
    const res = await request<AxiosRequestConfig>({ url: '/use' });
    expect(res.data.url).toBe('/use');
    expect(res.data.method).toBe('get');
  });
  test('url', async () => {
    const post = req.use({ requestConfig: { url: '/use/', method: 'post' } });
    const res = await post<AxiosRequestConfig>({ url: 'test' });
    expect(res.data.url).toBe('/use/test');
    expect(res.data.method).toBe('post');
    const res2 = await post<AxiosRequestConfig>({ url: 'test2' });
    expect(res2.data.url).toBe('/use/test2');
    expect(res2.data.method).toBe('post');
  });
  test('methodFactory url', async () => {
    const post = req.methodFactory('post', (configs) => {
      configs.requestConfig.url = '/use/' + configs.requestConfig.url;
    });
    const res = await post<AxiosRequestConfig>({ url: 'test' });
    expect(res.data.url).toBe('/use/test');
    expect(res.data.method).toBe('post');
    const res2 = await post<AxiosRequestConfig>({ url: 'test2' });
    expect(res2.data.url).toBe('/use/test2');
  });
  test('data', async () => {
    const post = req.use({ requestConfig: { url: '/use', method: 'post', data: { a: 1 } } });
    const res = await post<AxiosRequestConfig>({ url: 'test' });
    expect(res.data.data).toEqual({ a: 1 });
    const res2 = await post<AxiosRequestConfig>({ url: 'test', data: { b: 2 } });
    expect(res2.data.data).toEqual({ a: 1, b: 2 });
  });
});
