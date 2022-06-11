import type {
  ResType,
  CustomConfig,
  DynamicCustomConfig,
  RetryConfig,
  Configs,
  StatusHandlers,
} from './types';
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
import { Context, CustomCacheConfig, RetryContext } from './types';
import { mergeObj } from './utils';

// 使用模板方法模式处理axios请求, 具体类可实现protected的方法替换掉原有方法
export class AxiosRequestTemplate<CC extends CustomConfig = CustomConfig> {
  // 实例
  protected axiosIns!: AxiosInstance;
  protected cache!: Cache<AxiosPromise>;

  // 全局配置
  protected globalConfigs!: Configs<CC>;

  // cancel函数缓存
  protected readonly cancelerSet = new Set<Canceler>();
  protected readonly tagCancelMap = new Map<CustomConfig['tag'], Canceler[]>();

  cancelCurrentRequest?: Canceler;

  constructor(globalConfigs: Partial<Configs<CC>> = {}) {
    this.globalConfigs = { customConfig: {} as CC, requestConfig: {}, ...globalConfigs };
    this.init();
    this.setInterceptors();
  }

  protected init() {
    // 1、保存基础配置
    this.axiosIns = axios.create(this.globalConfigs.requestConfig);
    // 2、缓存初始化
    this.cache = new Cache();
  }

  // 根据配置生成key
  protected generateRequestKey(ctx: Omit<Context<CC>, 'requestKey'>): string {
    const { requestConfig } = ctx;
    const { url, headers, method, params, data } = requestConfig;
    return JSON.stringify({ url, data, headers, method, params });
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

    // 设置tag取消
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

    // 设置取消
    this.cancelerSet.add(cancel);
    // 清理取消
    const clearCanceler = () => {
      this.cancelerSet.delete(cancel);
    };
    clearSet.add(clearCanceler);
    // 取消
    // 注意：对于retry的无效，无法判断时机
    this.cancelCurrentRequest = (msg) => {
      cancel(msg);
      clearCanceler();
    };
  }

  // 处理requestConfig
  protected handleRequestConfig(requestConfig: AxiosRequestConfig): AxiosRequestConfig {
    // globalConfigs.requestConfig在axios内部会处理，不需要再手动处理
    const finalConfig: AxiosRequestConfig = { ...requestConfig };
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
    return merge(cacheConfig, merge(this.globalConfigs.customConfig.cache));
  }

  protected mergeRetryConfig(retryConfig: CustomConfig['retry']): RetryConfig {
    function merge(retry: CustomConfig['retry'], base: RetryConfig = {}) {
      switch (typeof retry) {
        case 'number':
          base.times = retry;
          break;
        case 'object':
          base = { ...base, ...retry };
          break;
      }
      return base;
    }
    return merge(retryConfig, merge(this.globalConfigs.customConfig.retry));
  }

  // 处理CustomConfig
  protected handleCustomConfig(customConfig: CC) {
    const config = { ...this.globalConfigs.customConfig, ...customConfig };
    config.cache = this.mergeCacheConfig(customConfig.cache);
    config.retry = this.mergeRetryConfig(customConfig.retry);
    return config;
  }

  // 处理响应结果
  protected handleStatus(
    ctx: Context<CC>,
    response: AxiosResponse<ResType<any>>,
    data: ResType<any>,
  ): Promise<any> | AxiosResponse<ResType<any>> | ResType<any> {
    const { customConfig } = ctx;
    const code = data?.code ?? 'default';
    const handlers: StatusHandlers = {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default() {},
      ...this.globalConfigs.customConfig.statusHandlers,
      ...customConfig.statusHandlers,
    };

    const statusHandler = handlers[code] || handlers.default;
    const handleResult = statusHandler(ctx, response, data);

    if (handleResult !== undefined) {
      return handleResult;
    }
    return customConfig.returnRes ? response : data;
  }

  // 请求
  protected useCache(ctx: Context<CC>, request: () => Promise<any>) {
    const { customConfig, requestKey } = ctx;

    const cacheConfig = customConfig.cache as CustomCacheConfig;

    // 缓存
    if (cacheConfig.enable) {
      const cache = this.cache.get(requestKey);
      if (cache) return cache;
      // 请求
      const promise = request();
      // 存储缓存
      this.cache.set(requestKey, promise, cacheConfig);
      // 如果该请求是被取消的话，就清理掉该缓存
      promise.catch((reason) => {
        if (!cacheConfig.failedReq || this.isCancel(reason)) {
          this.cache.delete(requestKey);
        }
      });
      return promise;
    }
    // 请求
    return request();
  }

  // 请求
  protected fetch(ctx: RetryContext<CC>) {
    return this.axiosIns(ctx.requestConfig);
  }

  protected handleRetry(ctx: Context<CC>) {
    // 太长了  以后可优化
    const { customConfig, clearSet } = ctx;
    const retryConfig = customConfig.retry as RetryConfig;

    if (retryConfig.times === undefined || retryConfig.times < 1) return;

    const maxTimex = retryConfig.times;
    let times = 0;
    let timer: NodeJS.Timer;
    let reject = (): any => undefined;
    const stop = () => {
      clearTimeout(timer);
      reject();
    };

    if (customConfig.tag) {
      this.tagCancelMap.get(customConfig.tag)?.push(stop);
    }
    this.cancelerSet.add(stop);
    clearSet.add(stop);

    ctx.retry = (e: AxiosError<ResType<any>>) => {
      return new Promise((res, rej) => {
        // retry期间取消，则返回上一次的结果
        reject = () => rej(e);
        const startRetry = (timeout?: number) => {
          if (times >= maxTimex) {
            reject();
            return;
          }
          // 立即执行时，间隔为undefined；否则为interval
          timer = setTimeout(retry, timeout);
        };
        const retry = () => {
          times++;
          this.execRequest({ ...ctx, isRetry: true }).then(
            (data) => res(data as AxiosResponse),
            (error) => {
              e = error;
              startRetry(retryConfig.interval);
            },
          );
        };
        startRetry(retryConfig.immediate ? undefined : retryConfig.interval);
      });
    };
  }

  protected beforeExecRequest(ctx: Context<CC>) {
    this.handleCanceler(ctx);
  }

  protected beforeRequest(ctx: Context<CC>) {
    this.handleRetry(ctx);
  }

  protected afterRequest(ctx: Context<CC>) {
    // 处理清理canceler等操作
    ctx.clearSet.forEach((clear) => clear());
    ctx.clearSet.clear();
  }

  protected generateContext(customConfig: CC, requestConfig: AxiosRequestConfig) {
    // 处理配置
    requestConfig = this.handleRequestConfig(requestConfig);
    customConfig = this.handleCustomConfig(customConfig);
    const ctx: Context<CC> = {
      requestConfig,
      customConfig,
      requestKey: '',
      clearSet: new Set(),
    };
    ctx.requestKey = this.generateRequestKey(ctx);
    return ctx;
  }

  protected async execRequest(ctx: RetryContext<CC>) {
    try {
      this.beforeExecRequest(ctx);
      // 请求
      const response: AxiosResponse = await this.fetch(ctx);
      // 请求结果数据结构处理
      const data = this.handleResponse(ctx, response);
      // 状态码处理，并返回结果
      return this.handleStatus(ctx, response, data);
    } catch (e: any) {
      // 重试
      if (!ctx.isRetry && ctx.retry && !this.isCancel(e)) {
        return ctx.retry(e);
      }
      return Promise.reject(e);
    }
  }

  // 使isCancel支持子类覆盖
  protected isCancel(value: any) {
    return axios.isCancel(value);
  }

  // 模板方法，请求入口。
  request<T = never, RC extends boolean = false>(
    requestConfig: Omit<AxiosRequestConfig, 'cancelToken' | 'url'> & { url: string },
    customConfig?: DynamicCustomConfig<CC, RC>,
  ): Promise<RC extends true ? AxiosResponse<ResType<T>> : ResType<T>>;
  async request(requestConfig: AxiosRequestConfig, customConfig = {} as CC): Promise<any> {
    const ctx = this.generateContext(customConfig, requestConfig);
    this.beforeRequest(ctx);
    try {
      return await this.useCache(ctx, () => this.execRequest(ctx));
    } catch (e: any) {
      return await this.handleError(ctx, e);
    } finally {
      this.afterRequest(ctx);
    }
  }

  protected handleError(ctx: Context<CC>, e: AxiosError<ResType<any>>) {
    // 错误处理
    const response = e.response as AxiosResponse<ResType<any>>;
    // 4、请求结果数据结构处理
    const data = this.handleResponse(ctx, response);
    if (data && data.code !== undefined) {
      // 5、状态码处理，并返回结果
      return this.handleStatus(ctx, response, data);
    }
    return Promise.reject(e);
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
  cancelWithTag(tag: CustomConfig['tag'], msg?: string) {
    const cancelers = this.tagCancelMap.get(tag);
    if (!cancelers) return;
    cancelers.forEach((canceler) => {
      canceler(msg);
      this.cancelerSet.delete(canceler);
    });

    this.tagCancelMap.delete(tag);
  }

  // 简单工厂：生成get post delete等method
  methodFactory(method: Method, handler?: (configs: Configs) => void) {
    return <T = never, RC extends boolean = false>(
      requestConfig: Omit<AxiosRequestConfig, 'cancelToken' | 'url' | 'method'> & { url: string },
      customConfig?: DynamicCustomConfig<CC, RC>,
    ) => {
      const configs: Configs = {
        requestConfig: requestConfig,
        customConfig: customConfig || {},
      };
      handler?.(configs);
      return this.request<T, RC>(
        { ...(configs.requestConfig as any), method },
        configs.customConfig as DynamicCustomConfig<CC, RC>,
      );
    };
  }

  // 简化版请求方法工厂 忽略data还是params；url前缀；只改axios的url，data/params，method,及自定义配置
  simplifyMethodFactory(method: Method, urlPrefix = '') {
    return <T = never, RC extends boolean = false>(
      url: string,
      data = {},
      customConfig = {} as DynamicCustomConfig<CC, RC>,
    ) => {
      const requestConfig: AxiosRequestConfig = { method };
      if (method === 'get') {
        requestConfig.params = data;
      } else {
        requestConfig.data = data;
      }
      requestConfig.url = urlPrefix + url;
      return this.request<T, RC>(requestConfig as any, customConfig);
    };
  }

  // 本质上跟methodFactory是一样的
  use(configs: Partial<Configs<CC>>) {
    const { customConfig: custom = {}, requestConfig: request = {} } = configs;
    return <T = never, RC extends boolean = false>(
      requestConfig: Omit<AxiosRequestConfig, 'cancelToken' | 'url'> & { url: string },
      customConfig?: DynamicCustomConfig<CC, RC>,
    ) => {
      // baseURL还是起作用的，所以使用外部的configs中的url作为url前缀
      requestConfig.url = `${request.url || ''}${requestConfig.url}`;
      requestConfig = mergeObj(request, requestConfig);

      customConfig = mergeObj(
        custom as DynamicCustomConfig<CC, boolean>,
        customConfig as DynamicCustomConfig<CC, RC>,
      );

      return this.request<T>(requestConfig, customConfig as any);
    };
  }
}
