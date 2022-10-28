// 主域名请求
import { AxiosRequestTemplate } from '../src';
import { StatusHandlers } from 'request-template';
import './utils';

const statusHandlers: StatusHandlers = {
  200: async (config, res, data) => {
    return config.customConfig.returnRes ? res : data;
  },
};
export default class Primary extends AxiosRequestTemplate {
  static readonly ins = new Primary();
  static readonly get = Primary.ins.methodFactory('get');
  static readonly post = Primary.ins.methodFactory('post');

  private constructor() {
    super({ requestConfig: { baseURL: 'http://test.test' }, customConfig: { statusHandlers } });
  }

  protected handleRequestConfig(config) {
    if (config.method === 'get') {
      if (!config.params) config.params = {};
      config.params.token = 1;
    } else {
      if (!config.data) config.data = {};
      config.data.token = 1;
    }
    return super.handleRequestConfig(config);
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
