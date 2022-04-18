import Cache from '../src/Cache';
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
  jest.setTimeout(7000);
  test('default timeout', async () => {
    const cache = new Cache<string, object>();
    const key = 'a';
    cache.set(key, { a: 123 });

    expect(cache.get(key)).toEqual({ a: 123 });
    expect(cache.has(key)).toBeTruthy();

    await sleep(2000);
    expect(cache.get(key)).toEqual({ a: 123 });
    expect(cache.has(key)).toBeTruthy();

    await sleep(4000);
    expect(cache.get(key)).toEqual(null);
    expect(cache.has(key)).toBeFalsy();
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
});
