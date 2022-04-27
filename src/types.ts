import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AxiosError } from 'axios';

export type StatusHandler<CC extends CustomConfig> = (
  config: Context<CC>,
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

// CustomConfig
export interface CustomConfig {
  returnRes?: boolean; // 返回res
  silent?: boolean; // 报错不弹窗
  statusHandlers?: StatusHandlers;
  cache?: boolean | CustomCacheConfig;
  tag?: string;
  retry?: number;
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
  retry?: (e: AxiosError<ResType<any>>) => Promise<any>;
}
