import { useEffect, useRef } from 'react';

/**
 * react实现vue3的watch功能
 * ---
 * 太复杂的情况(hooks层层嵌套)下不适合使用
 */
export function useWatch<T>(
  value: T,
  cb: (newVal: T, oldVal: T | void) => void,
  { immediate = false }: { immediate?: boolean } = {},
): () => void {
  const isInit = useRef(true);
  const oldVal = useRef<T>();
  const canceled = useRef(false);

  useEffect(() => {
    if (canceled.current) return;
    if (isInit.current) {
      isInit.current = false;
      immediate && cb(value, oldVal.current);
    } else cb(value, oldVal.current);

    oldVal.current = value;
  }, [value]);

  return () => {
    canceled.current = true;
  };
}
