import type { AxiosResponse } from 'axios';

export type StatusHandler = (
  res: AxiosResponse<ResType<any>>,
  data: ResType<any>,
  requestConfig: CustomConfig,
) => any;

// StatusHandlers
export type StatusHandlers = Record<number, StatusHandler> & { default?: StatusHandler };
// CustomConfig
export interface CustomConfig<T extends boolean = false> {
  returnRes?: T; // 返回res
  silent?: boolean; // 报错不弹窗
  statusHandlers?: StatusHandlers;
  useCache?: boolean | { timeout: number };
}

export interface ResType<T = never> {
  code: number;
  msg: string;
  data: T;
}
