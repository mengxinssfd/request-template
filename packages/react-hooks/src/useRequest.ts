import { useCallback, useRef, useState } from 'react';
import type { FN, State } from './types';

/**
 * react 请求hooks
 * ---
 * 不依赖RequestTemplate，可独立使用
 *
 *
 * @example
 * ```ts
 * // 手动请求
 * const mockReq = async () => ({ data: { user: { name: 'foo' } } });
 * const res = useRequest(mockReq);
 * res.request(\/* 如果请求需要数据，填入数据 *\/);
 * console.log(res.data?.user);
 *```
 *
 * @param  requestFn 请求函数
 * @param  defaultData 请求失败时返回的默认数据
 */
export function useRequest<
  REQ extends FN,
  DF extends Awaited<ReturnType<REQ>>['data'] | null = null,
>(
  requestFn: REQ,
  defaultData = null as DF,
): State<REQ, DF> & Record<'request', (...args: Parameters<REQ>) => Promise<void> | void> {
  // request方法内部只用loading的话每次进来都是false，所以用loadingRef作为判断
  // loadingRef作为loading导出去后又不会刷新，所以保留了loading
  const loadingRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<unknown>(defaultData);
  const [error, setError] = useState<any>(null);

  const request = useCallback(
    (...args: unknown[]): Promise<void> | void => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      return requestFn(...args)
        .then(
          (res) => setData(res.data),
          (err) => {
            setError(err);
            setData(defaultData);
          },
        )
        .finally(() => {
          loadingRef.current = false;
          setLoading(false);
        });
    },
    [requestFn, defaultData],
  );

  return { data, loading, error, request };
}
