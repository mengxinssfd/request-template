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
    /**
     * 立即把loading设置为true
     */
    immediate?: boolean;
    /**
     * 毫秒值；loading必须显示的时间，设置以后返回的loading与data不再同步
     */
    threshold?: number;
  };
}

export interface AliasOptions<A> extends CommonOptions {
  // 解构赋值的时候是可以改名的，这里好像有点多余了，再观察看看
  /**
   * 请求函数别名
   */
  requestAlias?: A;
}
export interface DataDriverOptions<D> extends CommonOptions {
  /**
   * 数据驱动时立即执行请求
   */
  immediate?: boolean;
  /**
   * 数据，必须是vue3的响应式数据才可以数据驱动
   */
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
