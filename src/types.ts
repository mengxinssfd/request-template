import type { AxiosResponse } from 'axios';

export type StatusHandler<CC extends CustomConfig> = (
  res: AxiosResponse<ResType<any>>,
  data: ResType<any>,
  customConfig: CC,
) => any;

// StatusHandlers
export type StatusHandlers<CC extends CustomConfig = CustomConfig> = Record<
  number,
  StatusHandler<CC>
> & { default?: StatusHandler<CC> };
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
