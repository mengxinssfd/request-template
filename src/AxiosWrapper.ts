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
  // 为了提高子类的拓展性，子类可以访问并使用该实例，但如果没必要不要去访问该axios实例
  protected readonly axiosIns: AxiosInstance;
  // 子类不可访问缓存
  private readonly cache: Cache<AxiosRequestConfig, AxiosPromise>;

  constructor(config: AxiosRequestConfig = {}, private customConfig = {} as CC) {
    // 1、保存基础配置
    this.axiosIns = axios.create(config);
    this.setInterceptors();
    // 2、缓存初始化
    this.cache = new Cache(this.transformCacheKey);
  }

  // 转换缓存所用的key
  protected transformCacheKey(config: AxiosRequestConfig): string {
    const url = config.url;
    const data = config.data || config.params;
    const headers = config.headers;
    return JSON.stringify({ url, data, headers });
  }

  // 转换数据结构为ResType
  protected transformRes<T>(
    axiosConfig: AxiosRequestConfig,
    customConfig: CC,
    response: AxiosResponse,
  ): ResType<T> {
    return response?.data as ResType;
  }
  // 获取拦截器
  protected get interceptors() {
    return this.axiosIns.interceptors;
  }
  protected setInterceptors() {
    // 重写此函数会在Request中调用
    // example
    // this.interceptors.request.use(() => {
    //   /* do something */
    // });
  }
  // 处理axiosRequestConfig
  protected handleAxiosRequestConfig(url: string, config: AxiosRequestConfig): AxiosRequestConfig {
    const finalConfig: AxiosRequestConfig = { ...config, url };
    finalConfig.method = finalConfig.method || 'get';
    return finalConfig;
  }
  // 处理CustomConfig
  protected handleCustomConfig(config: CC) {
    return { ...this.customConfig, ...config };
  }
  // 处理请求的数据
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
  // 处理响应结果
  protected handleResponse<T>(
    res: AxiosResponse<ResType<any>>,
    data: ResType<any>,
    customConfig: CC,
  ): Promise<ResType<T>> {
    const code = data?.code ?? 'default';
    const handlers = {
      default: (res, data, customConfig) => (customConfig.returnRes ? res : data),
      ...this.customConfig.statusHandlers,
      ...customConfig.statusHandlers,
    };

    const statusHandler = handlers[code] || handlers.default;
    return statusHandler(res, data, customConfig as CustomConfig);
  }

  // 请求，子类不可更改
  private _request(axiosConfig: AxiosRequestConfig, customConfig: CC) {
    if (customConfig.useCache) {
      const c = this.cache.get(axiosConfig);
      if (c) {
        return c;
      }
    }
    const res = this.axiosIns(axiosConfig);

    const useCache = customConfig.useCache;
    if (useCache) {
      this.cache.set(axiosConfig, res, typeof useCache === 'object' ? useCache : undefined);
    }
    return res;
  }

  // 模板方法，最终请求所使用的方法。
  // 可子类覆盖，如非必要不建议子类覆盖
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
    customConfig = {} as CC,
    axiosConfig: AxiosRequestConfig = {},
  ): Promise<any> {
    // 1、处理配置
    axiosConfig = this.handleAxiosRequestConfig(url, axiosConfig);
    customConfig = this.handleCustomConfig(customConfig);
    // 2、处理参数
    this.handleParams(data, axiosConfig);
    try {
      // 3、请求
      const response: AxiosResponse = await this._request(axiosConfig, customConfig);
      // 4、请求结果数据结构处理
      const data = this.transformRes<T>(axiosConfig, customConfig, response);
      // 5、状态码处理，并返回结果
      return this.handleResponse<T>(response, data, customConfig);
    } catch (e: any) {
      // 错误处理
      const response: AxiosResponse<ResType<any>> = e.response;
      const data = this.transformRes<T>(axiosConfig, customConfig, response);
      if (data && data.code !== undefined) {
        return this.handleResponse<T>(response, data, customConfig);
      }
      // 如未命中error处理 则再次抛出error
      throw e;
    }
  }

  // todo 取消请求
  // cancelAllPending() {}

  // 简单工厂：生成get post delete等method
  methodFactory(method: Method) {
    return <T = never, RC extends boolean = false>(
      url: string,
      data?: {},
      customConfig?: DynamicCustomConfig<CC, RC>,
      axiosConfig?: AxiosRequestConfig,
    ) => this.request<T, RC>(url, data, customConfig, { ...axiosConfig, method });
  }
}
