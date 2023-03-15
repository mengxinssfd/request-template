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
