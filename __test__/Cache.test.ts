import { Cache } from '../src';
import { sleep } from './utils';
describe('Cache', () => {
  test('base', async () => {
    const cache = new Cache<string, object>();
    const key = 'a';
    cache.set(key, { a: 123 }, { timeout: 500 });

    expect(cache.get(key)).toEqual({ a: 123 });
    expect(cache.has(key)).toBeTruthy();

    await sleep(200);
    expect(cache.get(key)).toEqual({ a: 123 });
    expect(cache.has(key)).toBeTruthy();

    await sleep(350);
    expect(cache.get(key)).toEqual(null);
    expect(cache.has(key)).toBeFalsy();
  });
  // jest.setTimeout(7000);
  test('default timeout', async () => {
    const cache = new Cache<string, object>();
    const key = 'a';
    cache.set(key, { a: 123 }, { timeout: 20 });

    expect(cache.get(key)).toEqual({ a: 123 });
    expect(cache.has(key)).toBeTruthy();

    await sleep(10);
    expect(cache.get(key)).toEqual({ a: 123 });
    expect(cache.has(key)).toBeTruthy();

    await sleep(20);
    expect(cache.get(key)).toEqual(null);
    expect(cache.has(key)).toBeFalsy();
  });
  test('test map value', () => {
    const cache = new Cache<string, object>();
    const key = 'a';
    cache.set(key, { a: 123 });

    const now = Date.now();
    const map = (<any>cache).cache as Map<string, { expires: number; value: any }>;
    expect(map.size).toBe(1);
    expect(map.get(JSON.stringify(key))).toEqual({ expires: now + 5000, value: { a: 123 } });

    cache.set(key, { b: 123 }, { timeout: 9000 });
    expect(map.size).toBe(1);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const v = map.get(JSON.stringify(key))!;
    // expires会波动几秒，在时间范围内即可
    expect(v.expires).toBeGreaterThanOrEqual(now + 9000);
    expect(v.expires).toBeLessThanOrEqual(now + 9010);
    expect(v.value).toEqual({ b: 123 });

    cache.set(key, {}, { timeout: -1 });
    expect(map.size).toBe(0);
    expect(map.get(JSON.stringify(key))).toBeUndefined();
  });
  test('object as key', async () => {
    const cache = new Cache<object, object>();
    const key = { a: 123 };
    cache.set(key, { a: 123 }, { timeout: 200 });

    expect(cache.get(key)).toEqual({ a: 123 });
    expect(cache.has(key)).toBeTruthy();

    await sleep(100);
    expect(cache.get(key)).toEqual({ a: 123 });
    expect(cache.has(key)).toBeTruthy();

    await sleep(200);
    expect(cache.get(key)).toEqual(null);
    expect(cache.has(key)).toBeFalsy();
  });
  test('遍历删除过期缓存', async () => {
    const cache = new Cache<object, object>();
    const key = { a: 123 };
    cache.set(key, { a: 123 }, { timeout: 200 });

    await sleep(300);

    cache.set({ b: 123 }, { b: 222 }, { timeout: 200 });
    expect(cache.get(key)).toEqual(null);
    expect(cache.get({ b: 123 })).toEqual({ b: 222 });
  });
});
