import { mergeObj } from '../src/utils';

test('mergeObj', () => {
  const a = { a: [1, 2], o: { a: 1, b: 2, c: 3 }, c: 3, d: 'dd' };
  const b = { a: [1, 22], o: { b: 22 }, c: 33 };
  expect(mergeObj(a, b)).toEqual({
    a: [1, 2, 1, 22],
    o: { a: 1, b: 22, c: 3 },
    c: 33,
    d: 'dd',
  });
});
