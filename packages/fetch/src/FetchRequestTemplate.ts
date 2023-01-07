import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { RequestTemplate, CustomConfig, Context, RetryContext } from 'request-template';
import { isUrl } from '@mxssfd/core';

/**
 * fetch请求封装类，继承自RequestTemplate
 * ---
 * 使用模板方法模式处理fetch请求, 具体类可实现protected的方法替换掉原有方法
 */
export class FetchRequestTemplate<
  CC extends CustomConfig = CustomConfig,
> extends RequestTemplate<CC> {
  /**
   * 处理URL
   */
  protected handleURL(config: AxiosRequestConfig): URL {
    const { requestConfig: baseConfig } = this.globalConfigs;

    const urlParams = [
      config.url || baseConfig.url || '',
      config.baseURL || baseConfig.baseURL,
    ] as [string, string | undefined];

    // 如果传的url是完整的，那么不使用baseURL
    if (isUrl(urlParams[0])) urlParams.pop();
    // 如果传的url不是完整的，且不存在baseURL，那么baseURL使用当前的域名
    else if (!urlParams[1] || !isUrl(urlParams[1])) urlParams[1] = location.origin;

    const url = new URL(...urlParams);

    // 处理url query
    for (const [k, v] of Object.entries({ ...baseConfig.params, ...config.params })) {
      url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : (v as string));
    }

    return url;
  }

  /**
   * 处理data
   */
  protected handleData(config: AxiosRequestConfig): URLSearchParams | FormData | string {
    const { requestConfig: baseConfig } = this.globalConfigs;

    // 如果data是字符串，则什么都不做
    if (typeof config.data === 'string') return config.data;

    // 合并data，且不能影响到原来的入参data
    // 非FormData则合并，baseConfig有没有都行
    if (!(config.data instanceof FormData))
      return new URLSearchParams({ ...baseConfig.data, ...config.data });

    // 如果data是FormData且baseConfig不存在data，则原样返回
    if (!baseConfig.data) return config.data;

    const data = new FormData();
    // 复制baseConfig.data，注意：baseConfig.data不能是FormData类型
    Object.entries(baseConfig.data).forEach(([k, v]) =>
      data.set(k, typeof v === 'object' ? JSON.stringify(v) : (v as string)),
    );
    // 复制config.data
    config.data.forEach((value, key) => data.set(key, value));
    return data;
  }

  /**
   * 对接配置
   */
  protected override handleRequestConfig(config: AxiosRequestConfig): AxiosRequestConfig {
    const baseConfig = this.globalConfigs.requestConfig;

    const method = config.method || baseConfig.method || 'get';

    return {
      ...config,
      url: this.handleURL(config).toString(),
      method,
      data: method.toLowerCase() === 'get' ? undefined : this.handleData(config),
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
