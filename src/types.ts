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
export interface CustomConfig {
  returnRes?: boolean; // 返回res
  silent?: boolean; // 报错不弹窗
  statusHandlers?: StatusHandlers;
  useCache?: boolean | { timeout: number };
  tag?: string;
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
