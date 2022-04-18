import Qs from 'qs';

function buildRes(res: { code: number; data?: any; msg: string }) {
  return Promise.resolve({ data: res, status: 200 });
}

export const routers = {
  '/user'() {
    return buildRes({ code: 200, data: { username: 'test', id: 1 }, msg: 'success' });
  },
  '/login'(data: string) {
    const d: any = Qs.parse(data);
    if (d.username === 'foo' && d.password === 'bar') {
      return buildRes({ code: 200, msg: 'success' });
    }
    return buildRes({ code: 0, msg: '账号或密码错误' });
  },
  '404'(d: string) {
    if (d === 'returnRes=1') {
      return Promise.reject({ status: 404, response: { data: { code: 200 } } });
    }
    return Promise.reject('404');
  },
};
