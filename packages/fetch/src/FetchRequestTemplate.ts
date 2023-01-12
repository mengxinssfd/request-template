import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { RequestTemplate, CustomConfig, Context, RetryContext } from 'request-template';
import { RequestConfigHandler } from './RequestConfigHandler';
import { FetchResultHandler } from './FetchResultHandler';

export interface FetchContext<CC extends CustomConfig> extends Context<CC> {
  /**
   * 请求中断控制器
   */
  abortController?: AbortController;
}
/**
 * fetch请求封装类，继承自RequestTemplate
 * ---
 * 使用模板方法模式处理fetch请求, 具体类可实现protected的方法替换掉原有方法
 */
export class FetchRequestTemplate<
  CC extends CustomConfig = CustomConfig,
> extends RequestTemplate<CC> {
  /**
   * 对接配置
   */
  protected override handleRequestConfig(config: AxiosRequestConfig): AxiosRequestConfig {
    return new RequestConfigHandler(this.globalConfigs.requestConfig, config).getResult();
  }

  /**
   * 处理fetch结果
   */
  protected async handleFetchResult(
    responsePromise: Promise<Response>,
    ctx: RetryContext<CC>,
  ): Promise<AxiosResponse> {
    return new FetchResultHandler(ctx.requestConfig).getResult(responsePromise);
  }

  /**
   * axios对接fetch的参数和返回值
   */
  protected override fetch(ctx: RetryContext<CC>): Promise<AxiosResponse> {
    const { requestConfig: cfg } = ctx;

    const responsePromise = fetch(cfg.url as string, {
      method: cfg.method as string,
      credentials: cfg.withCredentials ? 'include' : 'same-origin',
      body: cfg.data,
      headers: cfg.headers as Record<string, string>,
      signal: cfg.signal as AbortSignal,
    });
    return this.handleFetchResult(responsePromise, ctx);
  }

  /**
   * 实现取消请求判断
   */
  protected override isCancel(_: unknown, ctx: FetchContext<CC>): boolean {
    return Boolean(ctx.abortController?.signal.aborted);
  }

  /**
   * 处理取消器
   */
  protected override handleCanceler(ctx: FetchContext<CC>): void {
    const { requestConfig } = ctx;

    const abortController = (ctx.abortController = new AbortController());

    // 注册取消事件
    this.registerCanceler(ctx, (message) => {
      abortController.abort(message);
    });
    requestConfig.signal = abortController.signal;
  }
}
