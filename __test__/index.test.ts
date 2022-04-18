import AxiosWrapper from '../src';
import { StatusHandlers } from '../src/types';
import axios from 'axios';

jest.mock('axios');
(axios as any).create.mockReturnValue(
  jest.fn(function ({ url }) {
    if (url === '/user') {
      return { data: { code: 200, data: { username: 'test', id: 1 }, msg: 'success' } };
    }
    return Promise.resolve({ data: { code: 200, data: 1, msg: 'success' } });
  }),
);
describe('AxiosWrapper', () => {
  const statusHandlers: StatusHandlers = {
    200: (res, data, customConfig) => {
      return customConfig.returnRes ? res : data;
    },
  };
  class Req extends AxiosWrapper {
    static readonly ins = new Req();
    static readonly get = AxiosWrapper.methodFactory('get', Req.ins);
    constructor() {
      super({ baseURL: 'http://test.test' }, { statusHandlers });
    }
  }
  test('base', async () => {
    // console.log((axios.create({ url: 'test' }) as any)(1, 2, 3), Req);
    const res = await Req.get<{ username: string; id: number }>('/user');
    expect(res).toEqual({ code: 200, data: { username: 'test', id: 1 }, msg: 'success' });

    const res2 = await Req.get<{ username: string; id: number }, true>(
      '/user',
      {},
      { returnRes: true },
    );
    expect(res2).toEqual({
      data: { code: 200, data: { username: 'test', id: 1 }, msg: 'success' },
    });
  });
});
