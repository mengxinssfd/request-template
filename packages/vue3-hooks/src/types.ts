import { throttle } from '@tool-pack/basic';

/**
 * 请求函数
 */
export type FN = (...args: any[]) => Promise<any>;

/**
 * hook返回的状态
 */
export interface State<T extends FN, D, TD = Awaited<ReturnType<T>>['data']> {
  loading: boolean;
  data: D extends TD ? TD : TD | null;
  error: any | null;
}

type Throttle = Parameters<typeof throttle>[2] & { interval: number };

interface Debounce {
  immediate?: boolean;
  delay: number;
}

/**
 * hook需要的参数选项
 */
export type Options<A extends string, D extends object | void = void> = (D extends void
  ? { requestAlias?: A }
  : {
      immediate?: boolean;
      data?: D;
    }) &
  ({ debounce?: Debounce } | { throttle: Throttle });

/**
 * Options中所有的选项
 */
export interface AllOptions {
  requestAlias?: string;
  immediate?: boolean;
  data?: unknown;
  debounce?: Debounce;
  throttle?: Throttle;
}
