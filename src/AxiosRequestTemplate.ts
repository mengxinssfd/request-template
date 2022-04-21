import type { ResType, CustomConfig, DynamicCustomConfig } from './types';
import axios, {
  AxiosInstance,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
  Canceler,
  CancelToken,
} from 'axios';
import Qs from 'qs';
import { Cache } from './Cache';

// 使用模板方法模式处理axios请求, 具体类可实现protected方法替换掉原有方法
export class AxiosRequestTemplate<CC extends CustomConfig = CustomConfig> {
  // 为了提高子类的拓展性，子类可以访问并使用该实例，但如果没必要不要去访问该axios实例
  protected readonly axiosIns: AxiosInstance;
  protected readonly cache: Cache<AxiosRequestConfig, AxiosPromise>;
  protected readonly cancelerMap = new Map<CancelToken, Canceler>();

  cancelCurrentRequest!: Canceler;

  constructor(globalRequestConfig: AxiosRequestConfig = {}, private globalCustomConfig = {} as CC) {
    // 1、保存基础配置
    this.axiosIns = axios.create(globalRequestConfig);
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
    requestConfig: AxiosRequestConfig,
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
    // 缓存取消函数
    const { cancel, token } = axios.CancelToken.source();
    this.cancelerMap.set(token, cancel);
    this.cancelCurrentRequest = (msg) => {
      cancel(msg);
      // 请求成功后去除取消函数
      this.cancelerMap.delete(token);
    };

    const finalConfig: AxiosRequestConfig = { ...config, url, cancelToken: token };
    finalConfig.method = finalConfig.method || 'get';
    return finalConfig;
  }
  // 处理CustomConfig
  protected handleCustomConfig(config: CC) {
    return { ...this.globalCustomConfig, ...config };
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
      ...this.globalCustomConfig.statusHandlers,
      ...customConfig.statusHandlers,
    };

    const statusHandler = handlers[code] || handlers.default;
    return statusHandler(res, data, customConfig as CustomConfig);
  }

  // 请求，子类不可更改
  protected async _request(requestConfig: AxiosRequestConfig, customConfig: CC) {
    // 使用缓存
    const useCache = customConfig.useCache;
    if (useCache) {
      const cache = this.cache.get(requestConfig);
      if (cache) return cache;
    }

    // 请求
    const res = this.axiosIns(requestConfig);

    // 缓存
    if (useCache) {
      this.cache.set(requestConfig, res, typeof useCache === 'object' ? useCache : undefined);
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
    requestConfig?: AxiosRequestConfig,
  ): Promise<RC extends true ? AxiosResponse<ResType<T>> : ResType<T>>;
  async request<T>(
    url: string,
    data: {} = {},
    customConfig = {} as CC,
    requestConfig: AxiosRequestConfig = {},
  ): Promise<any> {
    // 1、处理配置
    requestConfig = this.handleAxiosRequestConfig(url, requestConfig);
    customConfig = this.handleCustomConfig(customConfig);
    // 2、处理参数
    this.handleParams(data, requestConfig);
    try {
      // 3、请求
      const response: AxiosResponse = await this._request(requestConfig, customConfig);
      // 移除cancel
      this.cancelCurrentRequest();
      // 4、请求结果数据结构处理
      const data = this.transformRes<T>(requestConfig, customConfig, response);
      // 5、状态码处理，并返回结果
      return this.handleResponse<T>(response, data, customConfig);
    } catch (e: any) {
      // 移除cancel
      this.cancelCurrentRequest();
      // 错误处理
      const response: AxiosResponse<ResType<any>> = e.response;
      // 4、请求结果数据结构处理
      const data = this.transformRes<T>(requestConfig, customConfig, response);
      if (data && data.code !== undefined) {
        // 5、状态码处理，并返回结果
        return this.handleResponse<T>(response, data, customConfig);
      }
      // 如未命中error处理 则再次抛出error
      throw e;
    }
  }

  // 取消请求
  cancelAll(msg?: string) {
    this.cancelerMap.forEach((canceler) => canceler(msg));
    this.cancelerMap.clear();
  }

  // 简单工厂：生成get post delete等method
  methodFactory(method: Method) {
    return <T = never, RC extends boolean = false>(
      url: string,
      data?: {},
      customConfig?: DynamicCustomConfig<CC, RC>,
      requestConfig?: AxiosRequestConfig,
    ) => this.request<T, RC>(url, data, customConfig, { ...requestConfig, method });
  }
}
