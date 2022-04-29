import type { AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AxiosError } from 'axios';

export type StatusHandler<CC extends CustomConfig> = (
  ctx: Context<CC>,
  res: AxiosResponse<ResType<any>>,
  data: ResType<any>,
) => any;

// StatusHandlers
export type StatusHandlers<CC extends CustomConfig = CustomConfig> = Record<
  number,
  StatusHandler<CC>
> & { default?: StatusHandler<CC> };

export interface CustomCacheConfig {
  enable?: boolean;
  timeout?: number;
}
export interface RetryConfig {
  times?: number;
  interval?: number;
  immediate?: boolean;
}

// 自定义配置
export interface CustomConfig {
  // 是否返回axios的response
  returnRes?: boolean;
  // 报错不弹窗，需要自己实现
  silent?: boolean;
  // 状态处理
  statusHandlers?: StatusHandlers;
  // 缓存配置
  cache?: boolean | CustomCacheConfig;
  // 标签，用于取消请求
  tag?: string | symbol;
  // 失败重试次数
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

export interface Context<CC> {
  customConfig: CC;
  requestConfig: AxiosRequestConfig;
  clearSet: Set<Function>;
  requestKey: string;
  retry?: (e: AxiosError<ResType<any>>) => AxiosPromise;
}

export interface RetryContext<CC> extends Context<CC> {
  isRetry?: boolean;
}
