import axios from 'axios';
import { AxiosRequestTemplate } from '../src';
import { mockAxiosResponse } from './utils';

jest.mock('axios');
const map = new Map<string, Function>();
const mockCreate = () => {
  return function (requestConfig) {
    const { cancelToken } = requestConfig;
    return new Promise((res, rej) => {
      map.set(cancelToken, (msg?: string) => {
        rej({ message: msg });
      });
      setTimeout(() => {
        res(mockAxiosResponse(requestConfig, { code: 200, msg: 'success', data: 1 }));
      }, 200);
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
(axios as any).isCancel = (value: any) => typeof value === 'object' && 'message' in value;

test('场景：页面请求缓慢，然后开启了缓存并且取消了的场景，是否下一次请求时从缓存中拿的是取消请求', async () => {
  expect.assertions(3);
  const req = new AxiosRequestTemplate();
  const get = req.simplifyMethodFactory('get');

  const res = await get('/test2');
  expect(res).toEqual({ code: 200, msg: 'success', data: 1 });

  try {
    setTimeout(() => req.cancelAll('cancel'));
    await get('/test', {}, { cache: true });
  } catch (e) {
    expect(e).toEqual({ message: 'cancel' });
  }

  const res2 = await get('/test', {}, { cache: true });
  expect(res2).toEqual({ code: 200, msg: 'success', data: 1 });
});
