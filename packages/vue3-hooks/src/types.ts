export type FN = (...args: any[]) => Promise<any>;

export interface State<T extends FN, D, TD = Awaited<ReturnType<T>>['data']> {
  loading: boolean;
  data: D extends TD ? TD : TD | null;
  error: any | null;
}

export type Options<A extends string, D extends object | void = void> = D extends void
  ? { requestAlias?: A; immediate?: boolean }
  : {
      immediate?: boolean;
      data?: D;
    };
