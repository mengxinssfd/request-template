import { RequestConfigHandler as RCH } from '@request-template/fetch';

describe('RequestConfigHandler', function () {
  test('handleURL', () => {
    expect(new RCH({}, {}).handleURL().toString()).toBe('http://localhost/');
    expect(new RCH({ baseURL: 'https://test.com' }, { url: 'test' }).handleURL().toString()).toBe(
      'https://test.com/test',
    );
    expect(
      new RCH({ baseURL: 'https://test.com' }, { url: 'test', params: { a: 1, b: 2 } })
        .handleURL()
        .toString(),
    ).toBe('https://test.com/test?a=1&b=2');

    // 完整url，不使用baseURL
    expect(
      new RCH({ baseURL: 'https://test.com' }, { url: 'http://localhost/test' })
        .handleURL()
        .toString(),
    ).toBe('http://localhost/test');

    // obj params
    const url = new RCH(
      { baseURL: 'https://test.com' },
      { url: 'test', params: { a: { b: 2, c: 3 } } },
    )
      .handleURL()
      .toString();
    expect(url).toBe('https://test.com/test?a=%7B%22b%22%3A2%2C%22c%22%3A3%7D');
    expect(new URL(url).searchParams.get('a')).toBe('{"b":2,"c":3}');
  });
  test('handleData', () => {
    expect(new RCH({}, {}).handleData()).toEqual(new URLSearchParams());

    // FormData
    const fd = new FormData();
    fd.append('b', '2');
    expect(new RCH({}, { data: fd }).handleData()).toBe(fd);

    const fd2 = new FormData();
    fd2.append('a', '1');
    fd2.append('b', '2');
    expect(new RCH({ data: { a: 1 } }, { data: fd }).handleData()).toEqual(fd2);

    // string
    expect(new RCH({ data: { a: 1 } }, { data: 'b=2' }).handleData()).toEqual('b=2');

    // baseURL obj
    const fd3 = new FormData();
    fd3.append('a', JSON.stringify({ aa: 1 }));
    fd3.append('b', '2');
    expect(new RCH({ data: { a: { aa: 1 } } }, { data: fd }).handleData()).toEqual(fd3);
  });
});
