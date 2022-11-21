import type { AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AxiosError } from 'axios';

/**
 * 单个状态处理类型声明
 */
export type StatusHandler<CC extends CustomConfig> = (
  ctx: Context<CC>,
  res: AxiosResponse<ResType<any>>,
  data: ResType<any>,
) => void | Promise<any>;

/**
 * 多状态处理类型声明
 */
export type StatusHandlers<CC extends CustomConfig = CustomConfig> = Record<
  number,
  StatusHandler<CC>
> & { default?: StatusHandler<CC> };

/**
 * 自定义缓存配置项
 */
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
  /**
   * 是否刷新缓存
   */
  refresh?: boolean;
}
/**
 * 重试配置项
 * @public
 */
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
 * 标签，用于通过标签取消请求等功能
 */
export type Tag = string | symbol;
/**
 * @public
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
  tag?: Tag;
  /**
   * 失败重试次数
   */
  retry?: number | RetryConfig;
}

/**
 * 请求返回值类型
 * @public
 */
export interface ResType<T = never> {
  /**
   * 状态码
   */
  code: number;
  /**
   * 提示信息
   */
  msg: string;
  /**
   * 数据
   */
  data: T;
}

/**
 * 自动推导自定义类型，不推荐外部使用
 * @public
 */
export type DynamicCustomConfig<CC extends CustomConfig, RC extends boolean> = Omit<
  CC,
  'returnRes'
> &
  (RC extends false ? { returnRes?: RC } : { returnRes: true });

/**
 * 配置总项
 * @public
 */
export interface Configs<CC extends CustomConfig = CustomConfig> {
  /**
   * 自定义配置
   */
  customConfig: CC;
  /**
   * 请求配置
   */
  requestConfig: AxiosRequestConfig;
}

/**
 * 请求上下文
 * @public
 */
export interface Context<CC extends CustomConfig> extends Configs<CC> {
  clearSet: Set<Function>;
  requestKey: string;
  retry?: (e: AxiosError<ResType<any>>) => AxiosPromise;
}

/**
 * 请求上下文+重试上下文
 * @public
 */
export interface RetryContext<CC extends CustomConfig> extends Context<CC> {
  isRetry?: boolean;
}
