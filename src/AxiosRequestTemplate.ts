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
import { CustomCacheConfig } from './types';

const root = Function('return this')();

// 使用模板方法模式处理axios请求, 具体类可实现protected方法替换掉原有方法
export class AxiosRequestTemplate<CC extends CustomConfig = CustomConfig> {
  // 为了提高子类的拓展性，子类可以访问并使用该实例，但如果没必要不要去访问该axios实例
  protected axiosIns!: AxiosInstance;
  protected cache!: Cache<AxiosRequestConfig, AxiosPromise>;
  protected readonly cancelerMap = new Map<CancelToken, Canceler>();
  protected readonly tagCancelMap = new Map<string, CancelToken[]>();

  cancelCurrentRequest?: Canceler;

  constructor(
    private globalRequestConfig: AxiosRequestConfig = {},
    private globalCustomConfig = {} as CC,
  ) {
    this.init();
    this.setInterceptors();
  }

  protected init() {
    // 1、保存基础配置
    this.axiosIns = axios.create(this.globalRequestConfig);
    // 2、缓存初始化
    this.cache = new Cache(this.transformCacheKey);
  }

  // 转换缓存所用的key
  protected transformCacheKey(requestConfig: AxiosRequestConfig): string {
    const url = requestConfig.url;
    const data = requestConfig.data || requestConfig.params;
    const headers = requestConfig.headers;
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

  // 设置取消handler
  protected handleCanceler(
    requestConfig: AxiosRequestConfig,
    customConfig: CustomConfig,
  ): Function {
    const { cancel, token } = axios.CancelToken.source();
    requestConfig.cancelToken = token;
    const tag = customConfig.tag;

    // 缓存tag取消
    if (tag) {
      if (!this.tagCancelMap.has(tag)) {
        this.tagCancelMap.set(tag, []);
      }
      (this.tagCancelMap.get(tag) as CancelToken[]).push(token);
    }

    // 缓存取消
    this.cancelerMap.set(token, cancel);
    // 清理取消
    const clearCanceler = () => {
      this.cancelerMap.delete(token);
      if (!tag) return;
      const tokens = this.tagCancelMap.get(tag);
      if (!tokens || !tokens.length) return;
      const index = tokens.indexOf(token);
      tokens.splice(index, 1);
    };
    // 取消
    this.cancelCurrentRequest = (msg) => {
      cancel(msg);
      clearCanceler();
    };
    return clearCanceler;
  }
  // 处理requestConfig
  protected handleRequestConfig(
    url: string,
    requestConfig: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const finalConfig: AxiosRequestConfig = { ...requestConfig, url };
    finalConfig.method = finalConfig.method || 'get';
    return finalConfig;
  }
  // 合并缓存配置
  protected mergeCacheConfig(cacheConfig: CustomConfig['cache']): CustomCacheConfig {
    function merge(cache: CustomConfig['cache'], base: CustomCacheConfig = {}) {
      switch (typeof cache) {
        case 'boolean':
          base.enable = cache;
          break;
        case 'object':
          base = { ...base, ...cache };
          if (cache.enable === undefined) {
            base.enable = true;
          }
          break;
      }
      return base;
    }
    return merge(cacheConfig, merge(this.globalCustomConfig.cache));
  }
  // 处理CustomConfig
  protected handleCustomConfig(customConfig: CC) {
    const config = { ...this.globalCustomConfig, ...customConfig };
    config.cache = this.mergeCacheConfig(customConfig.cache);
    return config;
  }
  // 处理请求的数据
  protected handleRequestData(data: {}, requestConfig: AxiosRequestConfig) {
    if (String(requestConfig.method).toLowerCase() === 'get') {
      requestConfig.params = data;
      return;
    }
    // node里面没有FormData
    if (!(root as typeof window).FormData || !(data instanceof FormData)) {
      // 使用Qs.stringify处理过的数据不会有{}包裹
      // 使用Qs.stringify其实就是转成url的参数形式：a=1&b=2&c=3
      // 格式化模式有三种：indices、brackets、repeat
      data = Qs.stringify(data, { arrayFormat: 'repeat' });
    }
    requestConfig.data = data;
  }
  // 处理响应结果
  protected handleResponse<T>(
    response: AxiosResponse<ResType<any>>,
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
    return statusHandler(response, data, customConfig);
  }

  // 请求
  protected execRequest(requestConfig: AxiosRequestConfig, customConfig: CC) {
    // 使用缓存
    const cacheConfig = customConfig.cache as CustomCacheConfig;
    const useCache = cacheConfig.enable;
    if (useCache) {
      const cache = this.cache.get(requestConfig);
      if (cache) return cache;
    }

    // 请求
    const res = this.axiosIns(requestConfig);

    // 缓存
    if (useCache) {
      this.cache.set(requestConfig, res, cacheConfig);
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
    requestConfig = this.handleRequestConfig(url, requestConfig);
    customConfig = this.handleCustomConfig(customConfig);
    const clearCanceler = this.handleCanceler(requestConfig, customConfig);
    // 2、处理参数
    this.handleRequestData(data, requestConfig);
    try {
      // 3、请求
      const response: AxiosResponse = await this.execRequest(requestConfig, customConfig);
      // 清理cancel
      clearCanceler();
      // 4、请求结果数据结构处理
      const data = this.transformRes<T>(requestConfig, customConfig, response);
      // 5、状态码处理，并返回结果
      return this.handleResponse<T>(response, data, customConfig);
    } catch (e: any) {
      // 清理cancel
      clearCanceler();
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

  // 取消所有请求
  cancelAll(msg?: string) {
    this.cancelerMap.forEach((canceler) => canceler(msg));
    this.cancelerMap.clear();
    this.tagCancelMap.clear();
  }

  // 根据tag标签取消请求
  cancelWithTag(tag: string, msg?: string) {
    const tokens = this.tagCancelMap.get(tag);
    if (!tokens) return;
    tokens.forEach((token) => {
      this.cancelerMap.get(token)?.(msg);
      this.cancelerMap.delete(token);
    });
    this.tagCancelMap.delete(tag);
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
