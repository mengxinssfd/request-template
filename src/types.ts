import type { AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AxiosError } from 'axios';

export type StatusHandler<CC extends CustomConfig> = (
  ctx: Context<CC>,
  res: AxiosResponse<ResType<any>>,
  data: ResType<any>,
) => void | Promise<any>;

// StatusHandlers
export type StatusHandlers<CC extends CustomConfig = CustomConfig> = Record<
  number,
  StatusHandler<CC>
> & { default?: StatusHandler<CC> };

export interface CustomCacheConfig {
  /**
   * 开关
   */
  enable?: boolean;
  /**
   * 单位：毫秒
   */
  timeout?: number;
  /**
   * 是否缓存失败的请求 false时清理
   */
  failedReq?: boolean;
}
export interface RetryConfig {
  /**
   * 失败次数
   */
  times?: number;
  /**
   * 失败重试间隔，单位：毫秒
   */
  interval?: number;
  /**
   * 第一次请求失败后是否立即重试
   */
  immediate?: boolean;
}

/**
 * 自定义配置
 */
export interface CustomConfig {
  /**
   *  是否返回axios的response
   */
  returnRes?: boolean;
  /**
   * 报错不弹窗，需要自己实现
   */
  silent?: boolean;
  /**
   * 状态处理
   */
  statusHandlers?: StatusHandlers;
  /**
   * 缓存配置
   */
  cache?: boolean | CustomCacheConfig;
  /**
   * 标签，用于取消请求
   */
  tag?: string | symbol;
  /**
   * 失败重试次数
   */
  retry?: number | RetryConfig;
}

export interface ResType<T = never> {
  code: number;
  msg: string;
  data: T;
}

export type DynamicCustomConfig<CC extends CustomConfig, RC extends boolean> = Omit<
  CC,
  'returnRes'
> &
  (RC extends false ? { returnRes?: RC } : { returnRes: true });

export interface Configs<CC extends CustomConfig = CustomConfig> {
  customConfig: CC;
  requestConfig: AxiosRequestConfig;
}

export interface Context<CC> extends Configs<CC> {
  clearSet: Set<Function>;
  requestKey: string;
  retry?: (e: AxiosError<ResType<any>>) => AxiosPromise;
}

export interface RetryContext<CC> extends Context<CC> {
  isRetry?: boolean;
}
