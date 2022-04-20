import type { ResType, CustomConfig } from './types';
import axios, {
  AxiosInstance,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from 'axios';
import Qs from 'qs';
import { Cache } from './Cache';

type DynamicCustomConfig<CC extends CustomConfig<boolean>, RC extends boolean> = Omit<
  CC,
  'returnRes'
> &
  (RC extends false ? { returnRes?: RC } : { returnRes: true });

// 使用模板方法模式处理axios请求, 具体类可实现protected方法替换掉原有方法
export class AxiosWrapper<CC extends CustomConfig<boolean> = CustomConfig<boolean>> {
  private readonly axios: AxiosInstance;
  private readonly cache: Cache<AxiosRequestConfig, AxiosPromise>;
  constructor(config: AxiosRequestConfig = {}, private customConfig = {} as CC) {
    // 1、保存基础配置
    this.axios = axios.create(config);
    this.setInterceptors();
    // 缓存初始化
    this.cache = new Cache((config) => {
      const url = config.url;
      const data = config.data || config.params;
      const headers = config.headers;
      return JSON.stringify({ url, data, headers });
    });
  }
  // 转换数据结构为ResType
  protected transferRes<T>(res: AxiosResponse): ResType<T> {
    return res?.data as ResType;
  }
  // 获取拦截器
  protected get interceptors() {
    return this.axios.interceptors;
  }
  protected setInterceptors() {
    // 重写此函数会在Request中调用
    // example
    // this.interceptors.request.use(() => {
    //   /* do something */
    // });
  }
  protected handleConfig(url: string, config: AxiosRequestConfig): AxiosRequestConfig {
    const finalConfig: AxiosRequestConfig = { ...config, url };
    finalConfig.method = finalConfig.method || 'get';
    return finalConfig;
  }
  protected handleCustomConfig(config: CC) {
    return { ...this.customConfig, ...config };
  }
  protected handleParams(data: {}, config: AxiosRequestConfig) {
    if (config.method === 'get') {
      config.params = data;
      return;
    }
    if (!(data instanceof FormData)) {
      // 使用Qs.stringify处理过的数据不会有{}包裹
      // 使用Qs.stringify其实就是转成url的参数形式：a=1&b=2&c=3
      // 格式化模式有三种：indices、brackets、repeat
      data = Qs.stringify(data, { arrayFormat: 'repeat' });
    }
    config.data = data;
  }
  protected handleResponse<T>(
    res: AxiosResponse<ResType<any>>,
    data: ResType<any>,
    customConfig: CC,
  ): Promise<ResType<T>> {
    const code = data?.code ?? 'default';
    const handlers = {
      default: (res, data, customConfig) => Promise.reject(customConfig.returnRes ? res : data),
      ...this.customConfig.statusHandlers,
      ...customConfig.statusHandlers,
    };

    const statusHandler = handlers[code] || handlers.default;
    return statusHandler(res, data, customConfig as CustomConfig);
  }

  private _request(customConfig: CC, axiosConfig: AxiosRequestConfig) {
    if (customConfig.useCache) {
      const c = this.cache.get(axiosConfig);
      if (c) {
        return c;
      }
    }
    const res = this.axios(axiosConfig);

    const useCache = customConfig.useCache;
    if (useCache) {
      this.cache.set(axiosConfig, res, typeof useCache === 'object' ? useCache : undefined);
    }

    return res;
  }

  request<T = never>(url: string, data?: {}): Promise<ResType<T>>;
  request<T = never, RC extends boolean = false>(
    url: string,
    data?: {},
    customConfig?: DynamicCustomConfig<CC, RC>,
    axiosConfig?: AxiosRequestConfig,
  ): Promise<RC extends true ? AxiosResponse<ResType<T>> : ResType<T>>;
  async request<T>(
    url: string,
    data: {} = {},
    customConfig = {} as any,
    axiosConfig: AxiosRequestConfig = {},
  ): Promise<any> {
    // 1、处理配置
    const config = this.handleConfig(url, axiosConfig);
    customConfig = this.handleCustomConfig(customConfig);
    // 2、处理参数
    this.handleParams(data, config);
    try {
      // 3、请求
      const response: AxiosResponse = await this._request(customConfig, config);
      // 4、请求结果数据结构处理
      const data = this.transferRes<T>(response);
      // 5、状态码处理，并返回结果
      return this.handleResponse<T>(response, data, customConfig);
    } catch (e: any) {
      // 错误处理
      const response: AxiosResponse<ResType<any>> = e.response;
      const data = this.transferRes<T>(response);
      if (data && data.code !== undefined) {
        return this.handleResponse<T>(response, data, customConfig);
      }
      throw e;
    }
  }

  methodFactory(method: Method) {
    return <T = never, RC extends boolean = false>(
      url: string,
      data?: {},
      customConfig?: DynamicCustomConfig<CC, RC>,
      axiosConfig?: AxiosRequestConfig,
    ) => this.request<T, RC>(url, data, customConfig, { ...axiosConfig, method });
  }
}