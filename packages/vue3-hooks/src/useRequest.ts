import { reactive, toRefs, isReactive, watch, isRef } from 'vue';
import type { FN, State, Options } from './types';

/**
 * 请求hooks
 *
 * @example
 *
 * // 手动请求 request不带参数
 * const res = useRequest(User.getSelf, { requestAlias: 'getSelf', immediate: true });
 * res.getSelf();
 * console.log(res.data.value?.user);
 *
 * const formModel = reactive({ username: '', password: '' });
 *
 * // 手动请求 request带参数
 * const res2 = useRequest(User.login);
 * res2.request(formModel);
 * console.log(res2.data.value?.token);
 *
 * formModel.username = '1';
 * formModel.password = '1';
 *
 * // 数据驱动
 * const res3 = useRequest(User.login, {
 *   data: formModel, // 数据，注意：该数据一定要响应式的，例如ref，reactive,computed返回的数据
 *   immediate: true,
 * });
 * // res3.request(formModel); // error Property 'request' does not exist
 * // 修改formModel自动触发请求
 * formModel.username = '2';
 * formModel.password = '2';
 * console.log(res3.data.value?.token);
 *
 * @param  requestFn
 * @param  options
 * @param  defaultData
 */
export function useRequest<
  REQ extends FN,
  ALIAS extends string = 'request',
  DATA extends object | void = void,
  DF extends Awaited<ReturnType<REQ>>['data'] | null = null,
>(requestFn: REQ, options: Options<ALIAS, DATA> = {} as any, defaultData: DF = null as DF) {
  const state = reactive<State<REQ, DF>>({
    loading: false,
    data: defaultData,
    error: null,
  });

  const refs = toRefs(state);

  const request = (...args: any[]) => {
    // computed变量不能JSON.stringfy
    args = args.map((item) => (isRef(item) ? item.value : item));
    state.loading = true;
    state.error = null;
    requestFn(...args)
      .then(
        (res) => (state.data = res.data),
        (err) => (state.error = err),
      )
      .finally(() => {
        state.loading = false;
      });
  };

  const {
    requestAlias = 'request',
    immediate = false,
    data,
  } = options as Options<ALIAS, {}> & Options<ALIAS>;

  // 数据驱动
  if (data) {
    // 数据驱动没法从ts类型体操处限制，像vue的watch就能传普通对象，而不会有watch效果，也没有任何报错或者提示
    if (!(isReactive(data) || isRef(data))) throw new TypeError('数据驱动data必须是响应式数据');
    watch(data, (n) => request(n), { deep: true });
  }

  if (immediate) {
    request(data);
  }

  return {
    ...refs,
    // 数据驱动时as any一下还是能用的
    [requestAlias]: request,
  } as typeof refs &
    (DATA extends void
      ? { [k in keyof Record<ALIAS, void>]: (...args: Parameters<REQ>) => void }
      : void);
}
