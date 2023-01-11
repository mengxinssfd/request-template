import { ins } from '../src';
import { useRequest } from '@request-template/vue3-hooks';
import { sleep } from '@tool-pack/basic';

describe('test', function () {
  test('base', () => {
    expect(typeof ins === 'object').toBeTruthy();
    // console.log(ins);
  });
  test('vue3-hooks', async () => {
    // 模拟请求api
    function mockRequest<T extends { a: number; b: string }>(data: T): Promise<{ data: T }> {
      return new Promise<any>((resolve) => {
        setTimeout(resolve, 5, { data });
      });
    }

    const { data, loading, requestFn } = useRequest(mockRequest, { requestAlias: 'requestFn' });

    expect(typeof requestFn === 'function').toBeTruthy();

    // 初始时data值为null，loading还是false，请求也没调用过
    expect(data.value).toBe(null);
    expect(loading.value).toBeFalsy();

    const _data = { a: 1, b: '2' };
    requestFn(_data);
    // 请求手动调用后，data为null，loading是true，请求被调用过
    expect(data.value).toBe(null);
    expect(loading.value).toBeTruthy();

    await sleep(20);

    // 请求完成后，data为_data，loading是false
    expect(data.value).toEqual(_data);
    expect(loading.value).toBeFalsy();
  });
});
