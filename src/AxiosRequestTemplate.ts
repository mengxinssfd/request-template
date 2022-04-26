import type { ResType, CustomConfig, DynamicCustomConfig } from './types';
import axios, {
  AxiosInstance,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
  Canceler,
  AxiosError,
} from 'axios';
import { Cache } from './Cache';
import { Context, CustomCacheConfig } from './types';

// 使用模板方法模式处理axios请求, 具体类可实现protected方法替换掉原有方法
export class AxiosRequestTemplate<CC extends CustomConfig = CustomConfig> {
  // 实例
  protected axiosIns!: AxiosInstance;
  protected cache!: Cache<AxiosPromise>;

  // cancel函数缓存
  protected readonly cancelerSet = new Set<Canceler>();
  protected readonly tagCancelMap = new Map<string, Canceler[]>();

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
  protected generateRequestKey(ctx: Omit<Context<CC>, 'requestKey'>): string {
    const { requestConfig } = ctx;
    const data = requestConfig.data || requestConfig.params;
    const { url, headers, method } = requestConfig;
    return JSON.stringify({ url, data, headers, method });
  }

  // 转换数据结构为ResType
  protected handleResponse<T>(ctx: Context<CC>, response: AxiosResponse): ResType<T> {
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
  protected handleCanceler(ctx: Context<CC>) {
    const { requestConfig, customConfig, clearSet } = ctx;
    const { cancel, token } = axios.CancelToken.source();
    requestConfig.cancelToken = token;
    const tag = customConfig.tag;

    // 缓存tag取消
    if (tag) {
      if (!this.tagCancelMap.has(tag)) {
        this.tagCancelMap.set(tag, []);
      }
      (this.tagCancelMap.get(tag) as Canceler[]).push(cancel);
      clearSet.add(() => {
        const cancelers = this.tagCancelMap.get(tag);
        if (!cancelers || !cancelers.length) return;
        const index = cancelers.indexOf(cancel);
        cancelers.splice(index, 1);
      });
    }

    // 缓存取消
    this.cancelerSet.add(cancel);
    // 清理取消
    const clearCanceler = () => {
      this.cancelerSet.delete(cancel);
    };
    clearSet.add(clearCanceler);
    // 取消
    this.cancelCurrentRequest = (msg) => {
      cancel(msg);
      clearCanceler();
    };
  }
  // 处理requestConfig
  protected handleRequestConfig(
    url: string,
    requestConfig: AxiosRequestConfig,
  ): AxiosRequestConfig {
    // globalRequestConfig在axios内部会处理，不需要再手动处理
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
  protected handleRequestData(ctx: Context<CC>, data: {}) {
    const { requestConfig } = ctx;
    delete requestConfig.data;
    delete requestConfig.params;
    if (String(requestConfig.method).toLowerCase() === 'get') {
      requestConfig.params = data;
      return;
    }
    requestConfig.data = data;
  }
  // 处理响应结果
  protected handleStatus<T>(
    ctx: Context<CC>,
    response: AxiosResponse<ResType<any>>,
    data: ResType<any>,
  ): Promise<ResType<T>> {
    const { customConfig } = ctx;
    const code = data?.code ?? 'default';
    const handlers = {
      default: ({ customConfig }, res, data) => (customConfig.returnRes ? res : data),
      ...this.globalCustomConfig.statusHandlers,
      ...customConfig.statusHandlers,
    };

    const statusHandler = handlers[code] || handlers.default;
    return statusHandler(ctx, response, data);
  }

  // 请求
  protected execRequest(ctx: Context<CC>) {
    const { requestConfig, customConfig } = ctx;
    const requestKey = this.generateRequestKey(ctx);
    // 使用缓存
    const cacheConfig = customConfig.cache as CustomCacheConfig;
    const useCache = cacheConfig.enable;

    if (useCache) {
      const cache = this.cache.get(requestKey);
      if (cache) return cache;
    }

    // 请求
    const res = this.axiosIns(requestConfig);

    // 缓存
    if (useCache) {
      this.cache.set(requestKey, res, cacheConfig);
    }
    return res;
  }

  protected beforeRequest(ctx: Context<CC>) {
    this.handleCanceler(ctx);
  }

  protected afterRequest(ctx: Context<CC>) {
    ctx.clearSet.forEach((clear) => clear());
    ctx.clearSet.clear();
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
    requestConfig = this.handleRequestConfig(url, requestConfig);
    customConfig = this.handleCustomConfig(customConfig);
    const ctx: Context<CC> = {
      requestConfig,
      customConfig,
      clearSet: new Set(),
    };
    this.handleRequestData(ctx, data);
    // 2、处理cancel handler等等
    this.beforeRequest(ctx);
    try {
      // 3、请求
      const response: AxiosResponse = await this.execRequest(ctx);
      // 4、请求结果数据结构处理
      const data = this.handleResponse<T>(ctx, response);
      // 5、状态码处理，并返回结果
      return this.handleStatus<T>(ctx, response, data);
    } catch (error: any) {
      const e = error as AxiosError<ResType<any>>;
      // 错误处理
      const response = e.response as AxiosResponse<ResType<any>>;
      // 4、请求结果数据结构处理
      const data = this.handleResponse<T>(ctx, response);
      if (data && data.code !== undefined) {
        // 5、状态码处理，并返回结果
        return this.handleStatus<T>(ctx, response, data);
      }
      // 如未命中error处理 则再次抛出error
      return await this.handleError(ctx, e);
    } finally {
      // 6、处理清理canceler等操作
      this.afterRequest(ctx);
    }
  }

  protected handleError(ctx: Context<CC>, e: AxiosError<ResType<any>>): any {
    throw e;
  }

  // 取消所有请求
  cancelAll(msg?: string) {
    this.cancelerSet.forEach((canceler) => {
      canceler(msg);
    });
    this.cancelerSet.clear();
    this.tagCancelMap.clear();
  }

  // 根据tag标签取消请求
  cancelWithTag(tag: string, msg?: string) {
    const cancelers = this.tagCancelMap.get(tag);
    if (!cancelers) return;
    cancelers.forEach((canceler) => {
      canceler(msg);
      this.cancelerSet.delete(canceler);
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
