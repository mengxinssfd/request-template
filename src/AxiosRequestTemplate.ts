import type { ResType, CustomConfig, DynamicCustomConfig } from './types';
import axios, {
  AxiosInstance,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
  Canceler,
  CancelToken,
  AxiosError,
} from 'axios';
import { Cache } from './Cache';
import { CustomCacheConfig } from './types';

// 使用模板方法模式处理axios请求, 具体类可实现protected方法替换掉原有方法
export class AxiosRequestTemplate<CC extends CustomConfig = CustomConfig> {
  // 实例
  protected axiosIns!: AxiosInstance;
  protected cache!: Cache<AxiosPromise>;

  // cancel函数缓存
  protected readonly cancelerMap = new Map<CancelToken, Canceler>();
  protected readonly tagCancelMap = new Map<string, CancelToken[]>();

  // 当前配置
  protected requestConfig!: AxiosRequestConfig;
  protected customConfig!: CC;

  cancelCurrentRequest?: Canceler;

  constructor(
    // 全局配置
    protected globalRequestConfig: AxiosRequestConfig = {},
    protected globalCustomConfig = {} as CC,
  ) {
    this.init();
    this.setInterceptors();
  }

  protected init() {
    // 1、保存基础配置
    this.axiosIns = axios.create(this.globalRequestConfig);
    // 2、缓存初始化
    this.cache = new Cache();
  }

  // 根据配置生成key
  protected generateRequestKey(requestConfig: AxiosRequestConfig): string {
    const data = requestConfig.data || requestConfig.params;
    const { url, headers, method } = requestConfig;
    return JSON.stringify({ url, data, headers, method });
  }

  // 转换数据结构为ResType
  protected handleResponse<T>(response: AxiosResponse): ResType<T> {
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
  protected handleCanceler(): Function {
    const { requestConfig, customConfig } = this;
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
  // 处理请求用的数据
  protected handleRequestData(data: {}) {
    const requestConfig = this.requestConfig;
    if (String(requestConfig.method).toLowerCase() === 'get') {
      requestConfig.params = data;
      return;
    }
    requestConfig.data = data;
  }
  // 处理响应结果
  protected handleStatus<T>(
    response: AxiosResponse<ResType<any>>,
    data: ResType<any>,
  ): Promise<ResType<T>> {
    const { customConfig, requestConfig } = this;
    const code = data?.code ?? 'default';
    const handlers = {
      default: (res, data, customConfig) => (customConfig.returnRes ? res : data),
      ...this.globalCustomConfig.statusHandlers,
      ...customConfig.statusHandlers,
    };

    const statusHandler = handlers[code] || handlers.default;
    return statusHandler(response, data, customConfig, requestConfig);
  }

  // 请求
  protected execRequest() {
    const { requestConfig, customConfig } = this;
    // 使用缓存
    const cacheConfig = customConfig.cache as CustomCacheConfig;
    const useCache = cacheConfig.enable;
    const key = this.generateRequestKey(requestConfig);
    if (useCache) {
      const cache = this.cache.get(key);
      if (cache) return cache;
    }

    // 请求
    const res = this.axiosIns(requestConfig);

    // 缓存
    if (useCache) {
      this.cache.set(key, res, cacheConfig);
    }
    return res;
  }

  // 模板方法，最终请求所使用的方法。
  // 可子类覆盖，如非必要不建议子类覆盖
  request<T = never, RC extends boolean = false>(
    url: string,
    data?: {},
    customConfig?: DynamicCustomConfig<CC, RC>,
    requestConfig?: Omit<AxiosRequestConfig, 'data' | 'params'>,
  ): Promise<RC extends true ? AxiosResponse<ResType<T>> : ResType<T>>;
  async request<T>(
    url: string,
    data: {} = {},
    customConfig = {} as CC,
    requestConfig: AxiosRequestConfig = {},
  ): Promise<any> {
    // 1、处理配置
    this.requestConfig = this.handleRequestConfig(url, requestConfig);
    this.handleRequestData(data);
    this.customConfig = this.handleCustomConfig(customConfig);
    // 2、处理cancel handler
    const clearCanceler = this.handleCanceler();
    try {
      // 3、请求
      const response: AxiosResponse = await this.execRequest();
      // 清理cancel
      clearCanceler();
      // 4、请求结果数据结构处理
      const data = this.handleResponse<T>(response);
      // 5、状态码处理，并返回结果
      return this.handleStatus<T>(response, data);
    } catch (error: any) {
      const e = error as AxiosError<ResType<any>>;
      // 清理cancel
      clearCanceler();
      // 错误处理
      const response = e.response as AxiosResponse<ResType<any>>;
      // 4、请求结果数据结构处理
      const data = this.handleResponse<T>(response);
      if (data && data.code !== undefined) {
        // 5、状态码处理，并返回结果
        return this.handleStatus<T>(response, data);
      }
      // 如未命中error处理 则再次抛出error
      return this.handleError(e);
    }
  }

  protected handleError(e: AxiosError<ResType<any>>): any {
    throw e;
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
      requestConfig?: Omit<AxiosRequestConfig, 'data' | 'params' | 'method'>,
    ) => this.request<T, RC>(url, data, customConfig, { ...requestConfig, method });
  }
}
