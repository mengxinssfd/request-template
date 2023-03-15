import { reactive, toRefs, isReactive, watch, isRef } from 'vue';
import type { FN, State, Options, AllOptions } from './types';

/**
 * vue3 请求hooks
 *
 * 不依赖RequestTemplate，可独立使用
 *
 * @example
 * ```ts
 * // 手动请求 request不带参数
 * const res = useRequest(User.getSelf, { requestAlias: 'getSelf', immediate: true });
 * res.getSelf();
 * console.log(res.data.value?.user);
 *```
 *
 * @example
 * ```ts
 * // 手动请求 request带参数
 * const formModel = reactive({ username: '', password: '' });
 * const res2 = useRequest(User.login);
 * res2.request(formModel);
 * console.log(res2.data.value?.token);
 *
 * // 改变数据不会触发请求
 * formModel.username = '1';
 * formModel.password = '1';
 * ```
 *
 * @example
 * ```ts
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
 * ```
 *
 * @example
 * 直接对requestFn使用防抖虽然对最终的请求有防抖效果，
 * 但是hooks的loading、error的变动不会跟随防抖，
 * 这时需要额外处理下hooks的内部请求
 * ```ts
 * // 添加防抖
 * const data = reactive({ a: 1, b: '2' });
 * const { loading, setInnerRequest } = useRequest(requestFn, { data});
 * // 使用setInnerRequest对内部请求函数添加防抖效果
 * setInnerRequest((req) => debounce(req, 10));
 * ```
 *
 * @param  requestFn 请求函数
 * @param  options
 * @param  [options.requestAlias='request'] 手动调用请求时的别名
 * @param  [options.immediate=false] 立即执行
 * @param  {any} options.data requestFn的参数
 * @param  defaultData 请求失败时返回的默认数据
 */
export function useRequest<
  REQ extends FN,
  ALIAS extends string = 'request',
  DATA extends Parameters<REQ>[0] | void = void,
  DF extends Awaited<ReturnType<REQ>>['data'] | null = null,
>(requestFn: REQ, options = {} as Options<ALIAS, DATA>, defaultData: DF = null as DF) {
  const state = reactive<State<REQ, DF>>({
    loading: false,
    data: defaultData,
    error: null,
  });

  const refs = toRefs(state);

  let request = (...args: unknown[]) => {
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

  const { requestAlias = 'request', immediate = false, data } = options as AllOptions;

  // 数据驱动
  if (data) {
    // 数据驱动没法从ts类型体操处限制，像vue的watch就能传普通对象，而不会有watch效果，也没有任何报错或者提示
    if (!(isReactive(data) || isRef(data))) throw new TypeError('数据驱动data必须是响应式数据');
    watch(data, (n) => request(n), { deep: true, immediate });
  }

  return {
    ...refs,
    // 数据驱动时as any一下还是能用的
    [requestAlias]: (...args) => request(...args),
    // 对请求添加防抖节流时使用
    setInnerRequest: (cb) => (request = cb(request)),
  } as typeof refs & {
    setInnerRequest(cb: (req: typeof request) => typeof request): void;
  } & Record<DATA extends void ? ALIAS : never, (...args: Parameters<REQ>) => void>;
}
