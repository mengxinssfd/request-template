import { useRequest } from '../src';
import { debounce, sleep, throttle } from '@tool-pack/basic';
import { isRef, reactive, ref, isReactive, computed, watch } from 'vue';

// 模拟请求api
function requestFn<T extends { a: number; b: string }>(data: T): Promise<{ data: T }> {
  return new Promise<any>((resolve) => {
    setTimeout(resolve, 5, { data });
  });
}
const mockRequest = jest.fn(requestFn);
const mockRequestFail = jest.fn((data: { a: number; b: string }) => {
  return Promise.reject('error:' + JSON.stringify(data));
});

describe('vue', function () {
  test('isRef/isReactive', () => {
    expect(isRef(reactive({}))).toBeFalsy();
    expect(isReactive(reactive({}))).toBeTruthy();
    const r = ref({});
    expect(isRef(r)).toBeTruthy();
    expect(isRef([ref({})][0])).toBeTruthy();
    expect(isRef([...[ref({})]][0])).toBeTruthy();

    const c = computed(() => ({ a: 1 }));
    expect(isRef(c)).toBeTruthy();
    const a = reactive<number[]>([]);
    a.push(1);
    expect(a).toEqual([1]);
  });
  test('解构', () => {
    expect([...reactive([1, 2, 3])]).toEqual([1, 2, 3]);
    expect([...ref([1, 2, 3]).value]).toEqual([1, 2, 3]);
    expect([...computed(() => [1, 2, 3]).value]).toEqual([1, 2, 3]);
  });
});
describe('useRequest', function () {
  afterEach(() => {
    mockRequest.mock.calls.length = 0;
    mockRequestFail.mock.calls.length = 0;
  });
  test('手动调用', async () => {
    const { data, loading, requestFn } = useRequest(mockRequest, { requestAlias: 'requestFn' });

    expect(typeof requestFn === 'function').toBeTruthy();

    // 初始时data值为null，loading还是false，请求也没调用过
    expect(data.value).toBe(null);
    expect(loading.value).toBeFalsy();
    expect(mockRequest).not.toBeCalled();

    const _data = { a: 1, b: '2' };
    requestFn(_data);
    // 请求手动调用后，data为null，loading是true，请求被调用过
    expect(data.value).toBe(null);
    expect(loading.value).toBeTruthy();
    expect(mockRequest.mock.calls.length).toBe(1);
    expect(mockRequest.mock.calls[0][0]).toBe(_data);

    await sleep(20);

    // 请求完成后，data为_data，loading是false
    expect(data.value).toEqual(_data);
    expect(loading.value).toBeFalsy();
    expect(mockRequest.mock.calls.length).toBe(1);
  });
  test('手动调用:请求失败', async () => {
    const mockFn = mockRequestFail;
    const { data, loading, request, error } = useRequest(mockFn);

    expect(typeof request === 'function').toBeTruthy();

    // 初始时data值为null，loading还是false，请求也没调用过
    expect(data.value).toBe(null);
    expect(loading.value).toBeFalsy();
    expect(mockFn).not.toBeCalled();
    expect(error.value).toBe(null);

    const params = { a: 1, b: '2' };
    request(params);
    // 请求手动调用后，data为null，error是null，loading是true，请求被调用过
    expect(error.value).toBe(null);
    expect(data.value).toBe(null);
    expect(loading.value).toBeTruthy();
    expect(mockFn.mock.calls.length).toBe(1);
    expect(mockFn.mock.calls[0][0]).toBe(params);

    await sleep(20);

    // 请求完成后，data为_data，loading是false，error是string
    expect(data.value).toBe(null);
    expect(loading.value).toBeFalsy();
    expect(mockFn.mock.calls.length).toBe(1);
    expect(error.value).toBe('error:' + JSON.stringify(params));

    // 第二次请求
    const params2 = { a: 2, b: '2' };
    request(params2);
    // 请求手动调用后，data为null，error是null，loading是true，请求被调用过
    expect(error.value).toBe(null);
    expect(data.value).toBe(null);
    expect(loading.value).toBeTruthy();
    expect(mockFn.mock.calls.length).toBe(2);
    expect(mockFn.mock.calls[1][0]).toBe(params2);

    await sleep(20);
    // 请求完成后，data为_data，loading是false，error是string
    expect(data.value).toBe(null);
    expect(loading.value).toBeFalsy();
    expect(mockFn.mock.calls.length).toBe(2);
    expect(error.value).toBe('error:' + JSON.stringify(params2));
  });
  test('数据驱动:数据变动启动', async () => {
    const params = reactive({ a: 1, b: '2' });
    const _data = computed<Parameters<typeof requestFn>>(() => [params]);
    const { data, loading, error } = useRequest(requestFn, { data: _data });

    // 初始时data值为null，loading还是false，请求也没调用过
    expect(data.value).toBe(null);
    expect(loading.value).toBeFalsy();
    expect(error.value).toBe(null);

    // 数据变动：触发请求
    params.a = 2;
    await sleep(0);
    // 请求手动调用后，data为null，loading是true，请求被调用过
    expect(data.value).toBe(null);
    expect(loading.value).toBeTruthy();
    expect(error.value).toBe(null);

    await sleep(15);

    // 请求完成后，data为_data，loading是false
    expect(data.value?.a).toEqual(params.a);
    expect(loading.value).toBeFalsy();
    expect(error.value).toBe(null);

    // 赋值但是数据没有变动，不会触发第二次请求
    params.a = 2;
    await sleep(0);
    expect(loading.value).toBeFalsy();
    expect(error.value).toBe(null);

    // 数据变动，触发第二次请求
    params.a = 3;
    // data不会自动重置，需要手动设置
    data.value = null;
    await sleep(2);
    // 请求手动调用后，data为null，loading是true，请求被调用过
    expect(data.value).toBe(null);
    expect(loading.value).toBeTruthy();
    expect(error.value).toBe(null);

    await sleep(15);

    // 请求完成后，data为_data，loading是false
    expect(data.value).toEqual(params);
    expect(loading.value).toBeFalsy();
    expect(error.value).toBe(null);
  });
  test('数据驱动:立即启动', async () => {
    const params = ref<Parameters<typeof mockRequest>>([{ a: 1, p: '2' }]);
    const { data, loading, error } = useRequest(mockRequest, { data: params, immediate: true });

    // 立即启动 初始时data值为null，loading是true，请求已经调用过
    expect(data.value).toBe(null);
    expect(loading.value).toBeTruthy();
    expect(mockRequest.mock.calls.length).toBe(1);
    expect(mockRequest.mock.calls[0][0]).toBe(params.value[0]);
    expect(error.value).toBe(null);

    await sleep(15);

    // 请求完成后，data为_data，loading是false
    expect(data.value).toEqual(params.value[0]);
    expect(data.value.a).toBe(params.value[0].a);
    expect(loading.value).toBeFalsy();
    expect(mockRequest.mock.calls.length).toBe(1);
    expect(error.value).toBe(null);

    // 数据变动，触发第二次请求
    params.value[0].a = 2;
    // data不会自动重置，需要手动设置
    data.value = null;
    await sleep(0);
    // 请求手动调用后，data为null，loading是true，请求被调用过
    expect(data.value).toBe(null);
    expect(loading.value).toBeTruthy();
    expect(mockRequest.mock.calls.length).toBe(2);
    expect(mockRequest.mock.calls[1][0]).toBe(params.value[0]);
    expect(error.value).toBe(null);

    await sleep(15);

    // 请求完成后，data为_data，loading是false
    expect(data.value).toEqual(params.value[0]);
    expect(loading.value).toBeFalsy();
    expect(mockRequest.mock.calls.length).toBe(2);
    expect(error.value).toBe(null);
  });

  test('数据驱动时手动调用报错', () => {
    const params = reactive<Parameters<typeof requestFn>>([{ a: 1, b: '2' }]);
    const hooks = useRequest(requestFn, { data: params });
    // @ts-expect-error
    expect(typeof hooks.request).toBe('function');

    const hooks2 = useRequest(requestFn, {
      data: ref<Parameters<typeof requestFn>>([{ a: 1, b: '2' }]),
    });
    // @ts-expect-error
    expect(typeof hooks2.request).toBe('function');
  });
  test('数据驱动:data非响应式', async () => {
    const params = { a: 1, b: '2' };
    expect(() => useRequest(mockRequest, { data: [params] })).toThrowError();
  });
  test('默认值', async () => {
    const params = { a: 1, b: '2' };

    // 有默认Data
    const res = useRequest(requestFn, {}, params);
    expect(res.loading.value).toBeFalsy();
    expect(res.error.value).toBe(null);
    expect(res.data.value.a).toBe(1);

    // 无默认Data
    const res2 = useRequest(requestFn);
    expect(res2.loading.value).toBeFalsy();
    expect(res2.error.value).toBe(null);
    // 未传默认data时，data.value可能是null，所以要加可选连
    expect(res2.data.value?.a).toBe(undefined);
    expect(() => {
      // @ts-expect-error
      console.log(res2.data.value.a);
    }).toThrow();

    // 数据驱动也可以手动请求，request还是要传参的
    const params2 = computed<Parameters<typeof requestFn>>(() => [params2]);
    const res3 = useRequest(requestFn, { data: params2 });
    expect(typeof (res3 as any).request === 'function').toBeTruthy();
  });
  test('默认值：失败请求', async () => {
    const req = (): Promise<{ data: { a: string } }> => Promise.reject('fail');
    const { data, request } = useRequest(req, {}, { a: '1' });
    expect(data.value.a).toBe('1');
    data.value = { a: '2' };
    expect(data.value.a).toBe('2');
    request();
    await sleep(10);
    expect(data.value.a).toBe('1');
  });
  describe('debounce', () => {
    test('debounce 1', async () => {
      let times = 0;
      const req = debounce(() => times++, 10, true);

      req();
      req();
      req();
      req();
      req();

      await sleep(100);

      expect(times).toBe(2);
    });
    describe('手动调用', function () {
      test('leading:false', async () => {
        const { loading, req, setInnerRequest } = useRequest(requestFn, {
          requestAlias: 'req',
        });

        setInnerRequest((req) => debounce(req, 10));

        const values: [boolean, boolean][] = [];
        let times = 0;

        watch(loading, (o, n) => {
          values.push([o, n]);
          times++;
        });

        await sleep(60);

        expect(values).toEqual([]);
        expect(times).toBe(0);

        req({ a: 1, b: '' });
        req({ a: 1, b: '' });
        req({ a: 1, b: '' });

        await sleep(100);

        expect(values).toEqual([
          [true, false],
          [false, true],
        ]);
      });
      test('leading:true', async () => {
        const { loading, req, setInnerRequest } = useRequest(requestFn, {
          requestAlias: 'req',
        });

        setInnerRequest((req) => debounce(req, 10, true));

        const values: [boolean, boolean][] = [];
        let times = 0;

        watch(loading, (o, n) => {
          values.push([o, n]);
          times++;
        });

        await sleep(60);

        expect(values).toEqual([]);
        expect(times).toBe(0);

        req({ a: 1, b: '' });
        req({ a: 1, b: '' });
        req({ a: 1, b: '' });

        await sleep(100);

        expect(values).toEqual([
          [true, false],
          [false, true],
          [true, false],
          [false, true],
        ]);
      });
    });
    describe('数据驱动', function () {
      test('不使用debounce', async () => {
        const data = reactive({ a: 1, b: '2' });
        const params = computed<Parameters<typeof requestFn>>(() => [data]);
        const { loading } = useRequest(requestFn, { data: params });

        const values: [boolean, boolean][] = [];

        watch(loading, (o, n) => {
          values.push([o, n]);
        });

        // 1不会触发
        data.a = 1;
        await sleep(20);
        data.a = 2;
        await sleep(20);
        data.a = 3;

        await sleep(20);

        expect(values).toEqual([
          [true, false],
          [false, true],
          [true, false],
          [false, true],
        ]);

        data.a = 1;
        await sleep(20);
        expect(values).toEqual([
          [true, false],
          [false, true],
          [true, false],
          [false, true],
          [true, false],
          [false, true],
        ]);
      });
      test('leading:false', async () => {
        const data = reactive({ a: 1, b: '2' });
        const params = computed<Parameters<typeof requestFn>>(() => [data]);
        const { loading, setInnerRequest } = useRequest(requestFn, {
          data: params,
        });
        setInnerRequest((req) => debounce(req, 10));

        const values: [boolean, boolean][] = [];
        let times = 0;

        watch(loading, (o, n) => {
          values.push([o, n]);
          times++;
        });

        await sleep(20);

        expect(values).toEqual([]);
        expect(times).toBe(0);

        data.a = 1;
        await sleep(1);
        data.a = 2;
        await sleep(1);
        data.a = 3;

        await sleep(100);

        expect(values).toEqual([
          [true, false],
          [false, true],
        ]);
      });
      test('leading:true', async () => {
        const data = reactive({ a: 1, b: '2' });
        const params = computed<Parameters<typeof requestFn>>(() => [data]);
        const { loading, setInnerRequest } = useRequest(requestFn, {
          data: params,
        });
        setInnerRequest((req) => debounce(req, 10, true));

        const values: [boolean, boolean][] = [];
        let times = 0;

        watch(loading, (o, n) => {
          values.push([o, n]);
          times++;
        });

        await sleep(20);

        expect(values).toEqual([]);
        expect(times).toBe(0);

        data.a = 1;
        await sleep(1);
        data.a = 2;
        await sleep(1);
        data.a = 3;

        await sleep(100);

        expect(values).toEqual([
          [true, false],
          [false, true],
          [true, false],
          [false, true],
        ]);
      });
      test('immediate:leading:true', async () => {
        const data = reactive({ a: 1, b: '2' });
        const params = computed<Parameters<typeof requestFn>>(() => [data]);
        const { loading, setInnerRequest } = useRequest(requestFn, {
          immediate: true,
          data: params,
        });
        setInnerRequest((req) => debounce(req, 10, true));

        const values: [boolean, boolean][] = [];
        let times = 0;

        watch(loading, (o, n) => {
          values.push([o, n]);
          times++;
        });

        await sleep(50);

        // 由于immediate useRequest内部早就调用过一次请求
        // 外部的watch还没来得及监听，所以第一次变true会被漏掉
        expect(values).toEqual([
          [false, true],
          // [true, false],
          // [false, true],
        ]);
        expect(times).toBe(1);

        data.a = 1;
        await sleep(1);
        data.a = 2;
        await sleep(1);
        data.a = 3;

        await sleep(100);

        expect(values).toEqual([
          [false, true],
          // [true, false],
          // [false, true],
          [true, false],
          [false, true],
          [true, false],
          [false, true],
        ]);
      });
    });
  });
  describe('throttle', () => {
    test('leading:false,trailing:false', async () => {
      const { loading, req, setInnerRequest } = useRequest(requestFn, {
        requestAlias: 'req',
      });
      setInnerRequest((req) => throttle(req, 10, { leading: false }));

      const values: [boolean, boolean][] = [];
      let times = 0;

      watch(loading, (o, n) => {
        values.push([o, n]);
        times++;
      });

      expect(values).toEqual([]);
      expect(times).toBe(0);

      req({ a: 1, b: '' });
      req({ a: 1, b: '' });
      req({ a: 1, b: '' });

      expect(values).toEqual([]);

      // 等待一段时间后throttle被重置了，底下的req才可以被调用
      await sleep(50);
      expect(values).toEqual([]);

      req({ a: 1, b: '' });
      req({ a: 1, b: '' });
      req({ a: 1, b: '' });
      await sleep(50);

      expect(values).toEqual([
        [true, false],
        [false, true],
      ]);
    });
    test('leading:true', async () => {
      const { loading, req, setInnerRequest } = useRequest(requestFn, {
        requestAlias: 'req',
      });
      setInnerRequest((req) => throttle(req, 10, { leading: true }));

      const values: [boolean, boolean][] = [];
      let times = 0;

      watch(loading, (o, n) => {
        values.push([o, n]);
        times++;
      });

      await sleep(60);

      expect(values).toEqual([]);
      expect(times).toBe(0);

      req({ a: 1, b: '' });
      req({ a: 1, b: '' });
      req({ a: 1, b: '' });

      await sleep(100);

      expect(values).toEqual([
        [true, false],
        [false, true],
      ]);
    });
    test('leading:false,trailing:true', async () => {
      const { loading, req, setInnerRequest } = useRequest(requestFn, {
        requestAlias: 'req',
      });
      setInnerRequest((req) => throttle(req, 10, { leading: false, trailing: true }));

      const values: [boolean, boolean][] = [];
      let times = 0;

      watch(loading, (o, n) => {
        values.push([o, n]);
        times++;
      });

      expect(values).toEqual([]);
      expect(times).toBe(0);

      req({ a: 1, b: '' });
      req({ a: 1, b: '' });
      req({ a: 1, b: '' });

      expect(values).toEqual([]);

      // 加了trailing，最后会执行一次
      await sleep(50);
      expect(values).toEqual([
        [true, false],
        [false, true],
      ]);

      req({ a: 1, b: '' });
      req({ a: 1, b: '' });
      req({ a: 1, b: '' });
      await sleep(50);

      expect(values).toEqual([
        [true, false],
        [false, true],
        [true, false],
        [false, true],
        [true, false],
        [false, true],
      ]);
    });
    test('leading:true,trailing:true', async () => {
      const { loading, req, setInnerRequest } = useRequest(requestFn, {
        requestAlias: 'req',
      });
      setInnerRequest((req) => throttle(req, 10, { leading: true, trailing: true }));

      const values: [boolean, boolean][] = [];
      let times = 0;

      watch(loading, (o, n) => {
        values.push([o, n]);
        times++;
      });

      await sleep(60);

      expect(values).toEqual([]);
      expect(times).toBe(0);

      req({ a: 1, b: '' });
      req({ a: 1, b: '' });
      req({ a: 1, b: '' });

      await sleep(100);

      expect(values).toEqual([
        [true, false],
        [false, true],
        [true, false],
        [false, true],
      ]);
    });
  });
  describe('loading', () => {
    test('threshold', async () => {
      const { data, loading, requestFn } = useRequest(mockRequest, {
        requestAlias: 'requestFn',
        loading: { threshold: 100 },
      });

      // 初始时data值为null，loading还是false，请求也没调用过
      expect(data.value).toBe(null);
      expect(loading.value).toBeFalsy();
      expect(mockRequest).not.toBeCalled();

      const _data = { a: 1, b: '2' };
      requestFn(_data);
      // 请求手动调用后，data为null，loading是true，请求被调用过
      expect(data.value).toBe(null);
      expect(loading.value).toBeTruthy();
      expect(mockRequest.mock.calls.length).toBe(1);
      expect(mockRequest.mock.calls[0][0]).toBe(_data);

      await sleep(20);
      expect(data.value).toEqual(_data);
      expect(loading.value).toBeTruthy();
      expect(mockRequest.mock.calls.length).toBe(1);

      await sleep(100);
      expect(data.value).toEqual(_data);
      expect(loading.value).toBeFalsy();
      expect(mockRequest.mock.calls.length).toBe(1);
    });
    test('immediate', async () => {
      const { loading, requestFn } = useRequest(mockRequest, {
        requestAlias: 'requestFn',
        loading: { immediate: true },
      });

      // 立即把loading改为true
      expect(loading.value).toBeTruthy();

      const _data = { a: 1, b: '2' };
      requestFn(_data);
      // 请求手动调用后，loading是true
      expect(loading.value).toBeTruthy();

      await sleep(20);
      // 请求完成后，loading是false
      expect(loading.value).toBeFalsy();
    });
  });
  test('request promise', async () => {
    const { loading, requestFn } = useRequest(mockRequest, {
      requestAlias: 'requestFn',
      loading: { immediate: true },
    });

    // 立即把loading改为true
    expect(loading.value).toBeTruthy();

    const _data = { a: 1, b: '2' };
    await requestFn(_data);

    // 请求完成后，loading是false
    expect(loading.value).toBeFalsy();
  });
});
