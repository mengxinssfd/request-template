import { FetchRequestTemplate } from '../src';

window.fetch = jest.fn((url, params) => {
  return new Promise((resolve) => {
    const res = {
      headers: new Headers(params?.headers),
      json: () => {
        return Promise.resolve({ a: 1 });
      },
      ok: true,
      redirected: false,
      status: 200,
      statusText: 'ok',
      type: 'basic',
      url: url.toString(),
      clone(): Response {
        return res;
      },
    } as Response;
    resolve(res);
  });
});
describe('FetchRequestTemplate.ts', function () {
  test('base', async () => {
    const frt = new FetchRequestTemplate();

    const res = await frt.request({
      url: 'test',
      params: { a: 1, b: 2 },
      data: { c: 3, d: 4, e: 5 },
      headers: { test: 1 },
    });

    expect(res).toEqual({ a: 1 });

    await frt.request({
      url: 'test',
      method: 'post',
      params: { a: 1, b: 2 },
      data: { c: 3, d: 4, e: 5 },
      headers: { test: 1 },
      withCredentials: true,
    });
    frt.cancelCurrentRequest?.('test');
  });
  test('retry', async () => {
    const frt = new FetchRequestTemplate();
    await frt.request(
      {
        url: 'test',
        method: 'post',
        params: { a: 1, b: 2 },
        data: { c: 3, d: 4, e: 5 },
        headers: { test: 1 },
      },
      {
        retry: 2,
        statusHandlers: {
          default: (() => {
            let times = 0;
            return (): Promise<void> | void => {
              if (times === 0) {
                times++;
                return Promise.reject('111');
              }
            };
          })(),
        },
      },
    );
  });
});
