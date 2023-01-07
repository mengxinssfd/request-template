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
   * 对接配置
   */
  protected override handleRequestConfig(config: AxiosRequestConfig): AxiosRequestConfig {
    const baseConfig = this.globalConfigs.requestConfig;

    const method = config.method || baseConfig.method || 'get';

    const urls = [config.url || baseConfig.url || '', config.baseURL || baseConfig.baseURL] as [
      string,
      string | undefined,
    ];

    if (isUrl(urls[0])) urls.pop();

    const url = new URL(...urls);
    if (method === 'get') {
      // 处理url query
      for (const [k, v] of Object.entries({ ...baseConfig.params, ...config.params })) {
        url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : (v as string));
      }
    }

    let data;
    // 合并data，且不能影响到原来的入参data
    if (baseConfig.data) {
      if (config.data instanceof FormData) {
        data = new FormData();
        // 复制baseConfig.data，注意：baseConfig.data不能是FormData类型
        Object.entries(baseConfig.data).forEach(([k, v]) =>
          data.set(k, typeof v === 'object' ? JSON.stringify(v) : (v as string)),
        );
        // 复制config.data
        config.data.forEach((value, key) => data.set(key, value));
      } else data = { ...baseConfig.data, ...config.data };
    }

    return {
      ...config,
      url: url.toString(),
      method,
      data,
      headers: { ...baseConfig.headers, ...config.headers },
      withCredentials: config.withCredentials || baseConfig.withCredentials,
    };
  }

  /**
   * axios对接fetch的参数和返回值
   */
  protected override fetch(ctx: RetryContext<CC>) {
    const config = ctx.requestConfig;

    return fetch(config.url as string, {
      method: config.method,
      credentials: config.withCredentials ? 'include' : 'same-origin',
      body: config.data,
      headers: config.headers as Record<string, string>,
      signal: config.signal,
    }).then((res) => {
      const headers: Record<string, string> = {};
      res.headers.forEach((value, key) => (headers[key] = value));

      return { status: res.status, data: res.json(), headers, config } as AxiosResponse;
    });
  }

  /**
   * 请求中断控制器
   */
  protected abortController?: AbortController;

  /**
   * 实现取消请求判断
   */
  protected override isCancel() {
    return Boolean(this.abortController?.signal.aborted);
  }

  /**
   * 处理取消器
   */
  protected override handleCanceler(ctx: Context<CC>) {
    const { requestConfig } = ctx;

    const abortController = (this.abortController = new AbortController());

    // 注册取消事件
    this.registerCanceler(ctx, (message) => {
      abortController.abort(message);
    });
    requestConfig.signal = abortController.signal;
  }
}
