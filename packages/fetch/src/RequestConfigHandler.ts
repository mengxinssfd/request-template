import type { AxiosRequestConfig } from 'axios';
import { isUrl } from '@mxssfd/core';

/**
 * 请求配置处理器
 */
export class RequestConfigHandler {
  constructor(protected baseConfig: AxiosRequestConfig, protected config: AxiosRequestConfig) {}
  /**
   * 处理url参数
   * ---
   * 把URL params和URL处理分开，因为config的param与baseConfig的param的关系可能是append也可能是set的关系，分开方便子类替换
   */
  protected mergeURLParams(params: URLSearchParams): void {
    const { baseConfig, config } = this;
    // 处理url query
    for (const [k, v] of Object.entries({ ...baseConfig.params, ...config.params })) {
      params.set(k, typeof v === 'object' ? JSON.stringify(v) : (v as string));
    }
  }

  /**
   * 处理URL
   */
  handleURL(): URL {
    const { baseConfig, config } = this;

    const urlParams = [
      config.url || baseConfig.url || '',
      config.baseURL || baseConfig.baseURL,
    ] as [string, string | undefined];

    // 如果传的url是完整的，那么不使用baseURL
    if (isUrl(urlParams[0])) urlParams.pop();
    // 如果传的url不是完整的，且不存在baseURL，那么baseURL使用当前的域名
    else if (!urlParams[1] || !isUrl(urlParams[1])) urlParams[1] = location.origin;

    const url = new URL(...urlParams);

    // 处理url search params
    this.mergeURLParams(url.searchParams);

    return url;
  }

  /**
   * 处理data
   */
  handleData(): URLSearchParams | FormData | string {
    const { baseConfig, config } = this;

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

  getResult(): AxiosRequestConfig {
    const { baseConfig, config } = this;

    const method = config.method || baseConfig.method || 'get';

    return {
      ...config,
      url: this.handleURL().toString(),
      method,
      responseType: config.responseType || baseConfig.responseType || 'json',
      data: method.toLowerCase() === 'get' ? undefined : this.handleData(),
      headers: { ...baseConfig.headers, ...config.headers },
      withCredentials: config.withCredentials || baseConfig.withCredentials,
    };
  }
}
