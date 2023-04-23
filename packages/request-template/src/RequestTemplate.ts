import type {
  ResType,
  CustomConfig,
  DynamicCustomConfig,
  RetryConfig,
  Configs,
  StatusHandlers,
  Tag,
  Context,
  CustomCacheConfig,
  RetryContext,
} from './types';
import type {
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
  Canceler as AxiosCanceler,
  AxiosError,
} from 'axios';
import { Cache } from './Cache';
import { mergeObj } from './utils';
import { Canceler } from './Canceler';

/**
 * 请求封装基类
 *
 * 使用模板方法模式处理请求封装抽象类, 具体类可实现protected的方法替换掉原有方法，需要实现抽象方法
 *
 * 可参考`@request-template/axios` `@request-template/wechat`
 * @see https://github.com/mengxinssfd/request-template/tree/main/packages/axios
 * @see https://github.com/mengxinssfd/request-template/tree/main/packages/wechat
 *
 * @example
 *
 * ```ts
 * // 主请求封装类
 * export class PrimaryRequest<CC extends CustomConfig = CustomConfig> extends RequestTemplate<CC> {
 *   protected fetch(ctx: RetryContext<CC>): Promise<any> {
 *     // 在此使用自己熟悉的请求工具重写fetch方法
 *     return Promise.resolve(undefined);
 *   }
 *
 *   protected handleCanceler(ctx: Context<CC>): void {
 *     // 在此重写如何挂载canceler，可为空
 *   }
 *
 *   protected isCancel(value: unknown, ctx: Context<CC>): boolean {
 *     // 在此重写如何判断是取消的请求
 *     return false;
 *   }
 * }
 * ```
 */
export abstract class RequestTemplate<CC extends CustomConfig = CustomConfig> {
  /**
   * 缓存
   */
  protected cache!: Cache<AxiosPromise<unknown> | Promise<unknown>>;

  /**
   * 全局配置
   */
  protected globalConfigs!: Configs<CC>;

  /**
   * 缓存管理器
   */
  protected cancelerManager!: Canceler;

  constructor(globalConfigs: Partial<Configs<CC>> = {}) {
    this.globalConfigs = { customConfig: {} as CC, requestConfig: {}, ...globalConfigs };
    this.init();
  }

  /**
   * 初始化
   */
  protected init(): void {
    // 1、缓存初始化
    this.cache = new Cache();
    // 2、初始化Canceler
    this.cancelerManager = new Canceler<CustomConfig>();
  }

  /**
   * 根据配置生成key
   */
  protected generateRequestKey(ctx: Omit<Context<CC>, 'requestKey'>): string {
    const { requestConfig } = ctx;
    const { url, headers, method, params, data } = requestConfig;
    return JSON.stringify({ url, data, headers, method, params });
  }

  /**
   * 转换数据结构为ResType
   */
  protected handleResponse<T>(ctx: Context<CC>, response: AxiosResponse): ResType<T> {
    return response?.data as ResType;
  }

  /**
   * 注册canceler
   */
  protected registerCanceler(ctx: Context<CC>, canceler: AxiosCanceler): void {
    this.cancelerManager.register(ctx, canceler);
  }

  /**
   * 设置取消handler
   */
  protected abstract handleCanceler(ctx: Context<CC>): void;

  /**
   * 请求
   */
  protected abstract fetch(ctx: RetryContext<CC>): Promise<unknown>;

  /**
   * 使isCancel支持子类覆盖
   */
  protected abstract isCancel(value: unknown, ctx: RetryContext<CC>): boolean;

  /**
   * 处理requestConfig
   */
  protected handleRequestConfig(requestConfig: AxiosRequestConfig): AxiosRequestConfig {
    // globalConfigs.requestConfig在axios内部会处理，不需要再手动处理
    const finalConfig: AxiosRequestConfig = { ...requestConfig };
    finalConfig.method = finalConfig.method || 'get';
    return finalConfig;
  }

  /**
   * 合并缓存配置
   */
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

  /**
   * 合并retry配置
   */
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

  /**
   * 处理CustomConfig
   */
  protected handleCustomConfig(customConfig: CC): CC {
    const config = { ...this.globalConfigs.customConfig, ...customConfig };
    config.cache = this.mergeCacheConfig(customConfig.cache);
    config.retry = this.mergeRetryConfig(customConfig.retry);
    return config;
  }

  /**
   * 处理响应结果
   */
  protected handleStatus(
    ctx: Context<CC>,
    response: AxiosResponse<ResType<unknown>>,
    data: ResType<unknown>,
  ): Promise<unknown> | AxiosResponse<ResType<unknown>> | ResType<unknown> {
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

  /**
   * 使用缓存
   */
  protected useCache(
    ctx: Context<CC>,
    request: () => Promise<unknown>,
  ): Promise<unknown> | AxiosPromise<unknown> {
    const { customConfig, requestKey } = ctx;

    const cacheConfig = customConfig.cache as CustomCacheConfig;

    // 缓存
    if (cacheConfig.enable) {
      if (cacheConfig.refresh) {
        // 只要刷新一次缓存，那么之前的相同key的缓存就作废
        this.cache.delete(requestKey);
      } else {
        const cache = this.cache.get(requestKey);
        if (cache) return cache;
      }
      // 请求
      const promise = request();
      // 存储缓存
      this.cache.set(requestKey, promise, { ...cacheConfig, tag: customConfig.tag });
      // 如果该请求是被取消的话，就清理掉该缓存
      promise.catch((reason) => {
        if (!cacheConfig.failedReq || this.isCancel(reason, ctx)) {
          this.cache.delete(requestKey);
        }
      });
      return promise;
    }
    // 请求
    return request();
  }

  /**
   * 处理重试
   */
  protected handleRetry(ctx: Context<CC>): void {
    // 太长了  以后可优化
    const { customConfig } = ctx;
    const retryConfig = customConfig.retry as RetryConfig;

    if (retryConfig.times === undefined || retryConfig.times < 1) return;

    const maxTimex = retryConfig.times;
    let times = 0;
    let timer: ReturnType<typeof setTimeout>;
    let reject = (): unknown => undefined;
    const stop = () => {
      clearTimeout(timer);
      reject();
    };

    this.registerCanceler(ctx, stop);

    ctx.retry = (e: unknown) => {
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

  /**
   * 执行请求前回调
   */
  protected beforeExecRequest(ctx: Context<CC>): void {
    this.handleCanceler(ctx);
  }

  /**
   * 请求前回调
   */
  protected beforeRequest(ctx: Context<CC>): void {
    this.handleRetry(ctx);
  }

  /**
   * 请求后回调
   */
  protected afterRequest(ctx: Context<CC>): void {
    // 处理清理canceler等操作
    ctx.clearSet.forEach((clear) => clear());
    ctx.clearSet.clear();
  }

  /**
   * 生成上下文
   */
  protected generateContext(customConfig: CC, requestConfig: AxiosRequestConfig): Context<CC> {
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

  /**
   * 执行请求，重试会调用该方法
   */
  protected async execRequest(ctx: RetryContext<CC>): Promise<unknown> {
    try {
      this.beforeExecRequest(ctx);
      // 请求
      const response = (await this.fetch(ctx)) as AxiosResponse;
      // 请求结果数据结构处理
      const data = this.handleResponse(ctx, response);
      // 状态码处理，并返回结果
      return await this.handleStatus(ctx, response, data);
    } catch (e: unknown) {
      // 重试
      if (!ctx.isRetry && ctx.retry && !this.isCancel(e, ctx)) return ctx.retry(e);
      return Promise.reject(e);
    }
  }

  /**
   * json类返回值类型
   *
   * 模板方法，请求入口，重试不会执行该方法
   *
   * @overload
   */
  request<T = never, RC extends boolean = false>(
    requestConfig: Omit<AxiosRequestConfig, 'cancelToken' | 'url' | 'responseType'> & {
      url: string;
      responseType?: 'json';
    },
    customConfig?: DynamicCustomConfig<CC, RC>,
  ): Promise<RC extends true ? AxiosResponse<ResType<T>> : ResType<T>>;
  /**
   * 非json返回值类型
   *
   * 模板方法，请求入口，重试不会执行该方法
   *
   * @overload
   */
  request<T = never, RC extends boolean = false>(
    requestConfig: Omit<AxiosRequestConfig, 'cancelToken' | 'url'> & {
      url: string;
    },
    customConfig?: DynamicCustomConfig<CC, RC>,
  ): Promise<RC extends true ? AxiosResponse<T> : T>;
  /**
   * 模板方法，请求入口，重试不会执行该方法
   */
  async request(requestConfig: AxiosRequestConfig, customConfig = {} as CC): Promise<unknown> {
    const ctx = this.generateContext(customConfig, requestConfig);
    this.beforeRequest(ctx);
    try {
      return await this.useCache(ctx, () => this.execRequest(ctx));
    } catch (e: any) {
      return this.handleError(ctx, e);
    } finally {
      this.afterRequest(ctx);
    }
  }

  /**
   * 请求失败回调
   */
  protected handleError(
    ctx: Context<CC>,
    e: AxiosError<ResType<unknown>>,
  ): ReturnType<typeof RequestTemplate.prototype.handleStatus> {
    // 错误处理
    const response = e.response as AxiosResponse<ResType<unknown>>;
    // 4、请求结果数据结构处理
    const data = this.handleResponse(ctx, response);
    if (data && data.code !== undefined) {
      // 5、状态码处理，并返回结果
      return this.handleStatus(ctx, response, data);
    }
    return Promise.reject(e);
  }

  /**
   * 取消所有请求
   */
  cancelAll(msg?: string): void {
    this.cancelerManager.cancelAll(msg);
  }

  /**
   * 根据tag标签取消请求
   */
  cancelWithTag(tag: CustomConfig['tag'], msg?: string): void {
    this.cancelerManager.cancelWithTag(tag, msg);
  }

  get cancelCurrentRequest() {
    return this.cancelerManager.cancelCurrentRequest;
  }

  /**
   * 简单工厂：生成get post delete等method
   */
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

  /**
   * 简化版请求方法工厂 忽略data还是params；url前缀；只改axios的url，data/params，method,及自定义配置
   */
  simplifyMethodFactory(method: Method, urlPrefix = '') {
    return <T = never, RC extends boolean = false>(
      url: string,
      data = {},
      customConfig = {} as DynamicCustomConfig<CC, RC>,
    ) => {
      const requestConfig: AxiosRequestConfig = { method };

      if (method.toLowerCase() === 'get') requestConfig.params = data;
      else requestConfig.data = data;

      requestConfig.url = urlPrefix + url;
      return this.request<T, RC>(requestConfig as any, customConfig);
    };
  }

  /**
   * 本质上跟methodFactory是一样的
   */
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

  /**
   * 根据tag移除缓存
   *
   * 为什么要做这个功能：因为在移动端这类无限上拉下一页分页场景，如果下拉刷新了缓存，
   * 那么必须清除这一url下所有分页的缓存，然而分页场景下每一页都会生成一个key，不好删除缓存
   */
  deleteCacheByTag(tag: Tag): void {
    this.cache.deleteByTag(tag);
  }

  /**
   *  清理所有缓存
   */
  clearCache(): void {
    this.cache.clear();
  }
}
