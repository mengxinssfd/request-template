// 其他域名请求
import { AxiosRequestTemplate } from '../src';
import { StatusHandlers, CustomConfig } from 'request-template';
import './utils';

interface MyCustomConfig extends CustomConfig {
  p1?: number;
  p2?: string;
}

const statusHandlers: StatusHandlers<MyCustomConfig> = {
  200: async (config, res, data) => {
    return config.customConfig.returnRes ? res : data;
  },
};

export default class Other extends AxiosRequestTemplate<MyCustomConfig> {
  static readonly ins = new Other();
  static readonly get = Other.ins.methodFactory('get');
  static readonly post = Other.ins.methodFactory('post');

  private constructor() {
    super({ requestConfig: { baseURL: 'http://test.test' }, customConfig: { statusHandlers } });
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
