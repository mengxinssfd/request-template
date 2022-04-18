import { StatusHandlers } from '../src/types';
import AxiosWrapper from '../src';

const statusHandlers: StatusHandlers = {
  200: (res, data, customConfig) => {
    return customConfig.returnRes ? res : data;
  },
};
export class Req extends AxiosWrapper {
  static readonly ins = new Req();
  static readonly get = AxiosWrapper.methodFactory('get', Req.ins);
  static readonly post = AxiosWrapper.methodFactory('post', Req.ins);
  constructor() {
    super({ baseURL: 'http://test.test' }, { statusHandlers });
  }
}
