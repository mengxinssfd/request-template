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

export interface CommonOptions {
  loading?: {
    // 立即把loading设置为true
    immediate?: boolean;
    // 毫秒值；loading必须显示的时间
    threshold?: number;
  };
}

export interface AliasOptions<A> extends CommonOptions {
  requestAlias?: A;
}
export interface DataDriverOptions<D> extends CommonOptions {
  immediate?: boolean;
  data: D;
}

/**
 * Options中所有的选项
 */
export interface AllOptions extends CommonOptions {
  requestAlias?: string;
  immediate?: boolean;
  data?: unknown[];
}
