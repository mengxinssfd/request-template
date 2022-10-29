import { Cache } from '../src';
import { sleep } from '@mxssfd/core';
describe('Cache', () => {
  test('base', async () => {
    const cache = new Cache<object>();
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

    cache.set(key, { a: 123 }, { timeout: 500 });
    expect(cache.get(key)).toEqual({ a: 123 });
    expect(cache.has(key)).toBeTruthy();

    cache.delete(key);
    expect(cache.get(key)).toEqual(null);
    expect(cache.has(key)).toBeFalsy();
  });
  // jest.setTimeout(7000);
  test('default timeout', async () => {
    const cache = new Cache<object>();
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
    const cache = new Cache<object>();
    const key = 'a';
    cache.set(key, { a: 123 });

    const now = Date.now();
    const map = (<any>cache).cache as Map<string, { expires: number; value: any }>;
    expect(map.size).toBe(1);
    expect(map.get(key)).toEqual({ expires: now + 5000, value: { a: 123 } });

    cache.set(key, { b: 123 }, { timeout: 9000 });
    expect(map.size).toBe(1);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const v = map.get(key)!;
    // expires会波动几秒，在时间范围内即可
    expect(v.expires).toBeGreaterThanOrEqual(now + 9000);
    expect(v.expires).toBeLessThanOrEqual(now + 9010);
    expect(v.value).toEqual({ b: 123 });

    cache.set(key, {}, { timeout: -1 });
    expect(map.size).toBe(0);
    expect(map.get(JSON.stringify(key))).toBeUndefined();
  });
  test('object as key', async () => {
    const cache = new Cache<object>();
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
    const cache = new Cache<object>();
    const key = { a: 123 };
    cache.set(key, { a: 123 }, { timeout: 200 });

    await sleep(300);

    const key2 = { b: 123 };
    cache.set(key2, { b: 222 }, { timeout: 200 });
    expect(cache.get(key)).toEqual(null);
    expect(cache.get(key2)).toEqual({ b: 222 });
  });
  test('deleteByTag', async () => {
    const cache = new Cache<object>();
    const tag = Symbol('1');
    cache.set(1, { a: 123 }, { timeout: 200, tag });
    cache.set(2, { b: 222 }, { timeout: 200, tag });

    cache.set(3, { c: 333 }, { timeout: 200, tag: 'other' });

    expect((cache as any).cache.size).toBe(3);
    expect((cache as any).tagMap.size).toBe(2);

    cache.deleteByTag(tag);
    expect((cache as any).cache.size).toBe(1);
    expect((cache as any).tagMap.size).toBe(1);

    cache.deleteByTag('other');
    expect((cache as any).cache.size).toBe(0);
    expect((cache as any).tagMap.size).toBe(0);

    // 测试自动清理
    cache.set(1, { a: 123 }, { timeout: 200, tag });
    expect(cache.get(1)).toEqual({ a: 123 });
    expect((cache as any).cache.size).toBe(1);
    expect((cache as any).tagMap.size).toBe(1);
    expect((cache as any).tagMap.get(tag).size).toBe(1);

    await sleep(350);
    expect(cache.get(1)).toBe(null);
    expect((cache as any).cache.size).toBe(0);
    expect((cache as any).tagMap.size).toBe(0);
    expect((cache as any).tagMap.get(tag)).toBe(undefined);
  });
  test('clear', async () => {
    const cache = new Cache<object>();
    const key = { a: 123 };
    cache.set(key, { a: 123 }, { timeout: 200 });

    const key2 = { b: 123 };
    cache.set(key2, { b: 222 }, { timeout: 200 });
    expect(cache.get(key)).toEqual(key);
    expect(cache.get(key2)).toEqual({ b: 222 });

    expect((cache as any).cache.size).toBe(2);
    cache.clear();
    expect((cache as any).cache.size).toBe(0);
  });
});
