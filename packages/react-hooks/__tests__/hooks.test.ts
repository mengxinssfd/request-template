import { useState } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useWatch } from '../src/hooks';
import { sleep } from '@tool-pack/basic';

describe('hooks', function () {
  describe('useWatch', function () {
    test('common', async () => {
      let no: any[] = [];
      const { result } = renderHook(() => {
        const [state, setState] = useState(1);
        useWatch(state, (newVal, oldVal) => {
          times++;
          no = [newVal, oldVal];
        });
        return [state, setState] as const;
      });
      const [, setState] = result.current;
      let times = 0;

      expect(result.current[0]).toBe(1);
      expect(times).toBe(0);
      expect(no).toEqual([]);

      await act(() => setState(2));
      expect(result.current[0]).toBe(2);
      expect(times).toBe(1);
      expect(no).toEqual([2, 1]);

      await act(() => setState(3));
      expect(result.current[0]).toBe(3);
      expect(times).toBe(2);
      expect(no).toEqual([3, 2]);
    });
    test('immediate', async () => {
      let times = 0;
      let no: any[] = [];
      const { result } = renderHook(() => {
        const [state, setState] = useState(1);
        useWatch(
          state,
          (newVal, oldVal) => {
            times++;
            no = [newVal, oldVal];
          },
          { immediate: true },
        );
        return [state, setState] as const;
      });
      const [, setState] = result.current;

      expect(result.current[0]).toBe(1);
      expect(times).toBe(1);
      expect(no).toEqual([1, undefined]);

      await act(() => setState(2));
      expect(result.current[0]).toBe(2);
      expect(times).toBe(2);
      expect(no).toEqual([2, 1]);

      await act(() => setState(3));
      expect(result.current[0]).toBe(3);
      expect(times).toBe(3);
      expect(no).toEqual([3, 2]);
    });
    test('watch obj', async () => {
      const data = { a: 1 };
      let no: any[] = [];
      let times = 0;
      const { result } = renderHook(() => {
        const [state, setState] = useState({ ...data });
        const cancel = useWatch(state, (newVal, oldVal) => {
          times++;
          no = [newVal, oldVal];
        });
        return [state, setState, cancel] as const;
      });
      const [, setState, cancel] = result.current;

      expect(times).toBe(0);
      expect(no).toEqual([]);

      data.a = 2;
      await act(() => setState({ ...data }));
      expect(times).toBe(1);
      expect(no).toEqual([{ a: 2 }, { a: 1 }]);

      await act(() => {
        cancel();
        return sleep(20);
      });
      data.a = 3;
      await act(() => setState({ ...data }));
      expect(times).toBe(1);
      expect(no).toEqual([{ a: 2 }, { a: 1 }]);
    });
  });
});
