import { FetchRequestTemplate } from '../src';
import { readFile } from '@tool-pack/dom';

window.fetch = jest.fn((url, params) => {
  return new Promise((resolve) => {
    const res = {
      headers: new Headers(params?.headers),
      json: () => {
        return Promise.resolve({ a: 1 });
      },
      blob(): Promise<Blob> {
        const blob = new Blob(['hello world'], { type: 'text/plain' });
        return Promise.resolve(blob);
      },
      text() {
        return Promise.resolve('hello world');
      },
      arrayBuffer: () => {
        const ab = new ArrayBuffer(10);
        return Promise.resolve(ab);
      },
      bodyUsed: false,
      formData(): Promise<FormData> {
        return Promise.resolve(new FormData());
      },
      body: {
        getReader(): ReadableStreamDefaultReader<Uint8Array> {
          return { read: () => Promise.resolve({ done: true, value: 1 }) } as any;
        },
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
  const frt = new FetchRequestTemplate();
  test('base', async () => {
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
  test('blob', async () => {
    const res = await frt.request<Blob>({ url: 'test', responseType: 'blob' });
    expect(await readFile(res)).toBe('hello world');
  });
  test('text', async () => {
    const res = await frt.request<string>({ url: 'test', responseType: 'text' });
    expect(res).toBe('hello world');
  });
  test('arraybuffer', async () => {
    const res = await frt.request<ArrayBuffer>({ url: 'test', responseType: 'arraybuffer' });
    expect(res.byteLength).toBe(10);
  });
  test('stream', async () => {
    const res = await frt.request<ReadableStreamDefaultReader>({
      url: 'test',
      responseType: 'stream',
    });
    res.read().then((r) => {
      console.log(r);
    });
  });
});
