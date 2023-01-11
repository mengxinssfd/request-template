import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { RequestTemplate, CustomConfig, Context, RetryContext } from 'request-template';
import { RequestConfigHandler } from './RequestConfigHandler';

/**
 * fetch请求封装类，继承自RequestTemplate
 * ---
 * 使用模板方法模式处理fetch请求, 具体类可实现protected的方法替换掉原有方法
 */
export class FetchRequestTemplate<
  CC extends CustomConfig = CustomConfig,
> extends RequestTemplate<CC> {
  /**
   * 获取请求配置处理器，单独一个方法方便子类实现替换
   */
  protected getRequestConfigHandler(config: AxiosRequestConfig): RequestConfigHandler {
    return new RequestConfigHandler(this.globalConfigs.requestConfig, config);
  }

  /**
   * 对接配置
   */
  protected override handleRequestConfig(config: AxiosRequestConfig): AxiosRequestConfig {
    const baseConfig = this.globalConfigs.requestConfig;

    const method = config.method || baseConfig.method || 'get';

    const rch = this.getRequestConfigHandler(config);

    return {
      ...config,
      url: rch.handleURL().toString(),
      method,
      data: method.toLowerCase() === 'get' ? undefined : rch.handleData(),
      headers: { ...baseConfig.headers, ...config.headers },
      withCredentials: config.withCredentials || baseConfig.withCredentials,
    };
  }

  /**
   * axios对接fetch的参数和返回值
   */
  protected override fetch(ctx: RetryContext<CC>): Promise<AxiosResponse> {
    const { requestConfig: cfg } = ctx;

    const responsePromise = fetch(cfg.url as string, {
      method: cfg.method,
      credentials: cfg.withCredentials ? 'include' : 'same-origin',
      body: cfg.data,
      headers: cfg.headers as Record<string, string>,
      signal: cfg.signal,
    });
    return this.handleFetchResult(responsePromise, ctx);
  }

  /**
   * 处理fetch结果
   */
  protected async handleFetchResult(
    responsePromise: Promise<Response>,
    ctx: RetryContext<CC>,
  ): Promise<AxiosResponse> {
    const res = await responsePromise;

    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => (headers[key] = value));

    return {
      status: res.status,
      data: await res.json(),
      headers,
      config: ctx.requestConfig,
    } as AxiosResponse;
  }

  /**
   * 请求中断控制器
   */
  protected abortController?: AbortController;

  /**
   * 实现取消请求判断
   */
  protected override isCancel(): boolean {
    return Boolean(this.abortController?.signal.aborted);
  }

  /**
   * 处理取消器
   */
  protected override handleCanceler(ctx: Context<CC>): void {
    const { requestConfig } = ctx;

    const abortController = (this.abortController = new AbortController());

    // 注册取消事件
    this.registerCanceler(ctx, (message) => {
      abortController.abort(message);
    });
    requestConfig.signal = abortController.signal;
  }
}
