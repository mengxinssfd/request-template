import { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * fetch结果处理器
 */
export class FetchResultHandler {
  constructor(protected config: AxiosRequestConfig) {}

  /**
   * 处理请求返回的数据
   */
  protected handleData(res: Response): Promise<any> | void {
    // | 'arraybuffer'
    // | 'blob'
    // | 'document'
    // | 'json'
    // | 'text'
    // | 'stream';
    switch (this.config.responseType) {
      case 'json':
        return res.json();
      case 'blob':
        return res.blob();
      case 'arraybuffer':
        return res.arrayBuffer();
      case 'text':
        return res.text();
      case 'stream':
        return Promise.resolve(res.body?.getReader());
      // case 'document':
      //   return;
    }
  }

  /**
   * 处理响应头
   */
  handleHeaders(res: Response): Record<string, string> {
    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => (headers[key] = value));
    return headers;
  }

  /**
   * 处理fetch结果
   */
  async getResult(responsePromise: Promise<Response>): Promise<AxiosResponse> {
    const { config: cfg } = this;

    const res = await responsePromise;

    return {
      status: res.status,
      data: await this.handleData(res),
      headers: this.handleHeaders(res),
      config: cfg,
    } as AxiosResponse;
  }
}
