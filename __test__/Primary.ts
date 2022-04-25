// 主域名请求
import { StatusHandlers, AxiosRequestTemplate } from '../src';

const statusHandlers: StatusHandlers = {
  200: (res, data, customConfig) => {
    return customConfig.returnRes ? res : data;
  },
};
export default class Primary extends AxiosRequestTemplate {
  static readonly ins = new Primary();
  static readonly get = Primary.ins.methodFactory('get');
  static readonly post = Primary.ins.methodFactory('post');

  private constructor() {
    super({ baseURL: 'http://test.test' }, { statusHandlers });
  }

  protected handleRequestData(data: {}) {
    super.handleRequestData({ ...data, token: 123 });
  }

  protected setInterceptors() {
    this.interceptors.request.use((config) => {
      if (!config.headers) config.headers = {};
      const headers = config.headers;
      // Token.exists() && (headers.authorization = `Bearer ${Token.get()}`);
      headers.authorization = `Bearer 123123123123123123`;
      // headers.uuid = getUUID();
    });
  }
}
