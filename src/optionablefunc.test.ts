import { describe, it, expect, expectTypeOf } from 'vitest';
import { OptionableFunc } from '../src/optionablefunc.js';

describe('OptionableFunc (Values → Switches → Args → R)', () => {
  it('基本: 関数として呼び出せる', () => {
    const fn = OptionableFunc(
      {},
      (_o, a: string, b: string) => `${a}/${b}`,
    );

    expect(fn('image', 'png')).toBe('image/png');

    // 型: 引数と戻り値
    expectTypeOf(fn).toBeCallableWith('a', 'b');
    expectTypeOf(fn).returns.toEqualTypeOf<string>();
  });

  it('switches: boolean オプションをプロパティで指定できる', () => {
    // Values={}, Switches='reversed'
    const fn = OptionableFunc<{}, 'reversed', [string, string], string>(
      { switches: ['reversed'] as const },
      ({ reversed }, a, b) => (reversed ? `${b}/${a}` : `${a}/${b}`),
    );

    expect(fn('image', 'png')).toBe('image/png');
    expect(fn.reversed('image', 'png')).toBe('png/image');

    // 型: reversed プロパティが「(a,b) => string」であること
    expectTypeOf(fn.reversed).toBeCallableWith('a', 'b');
    expectTypeOf(fn.reversed).returns.toEqualTypeOf<string>();

    // @ts-expect-error 存在しないスイッチは型エラー
    void fn.flip;
  });

  it('values: setter チェーンで任意型の値オプションを設定できる', () => {
    type Values = { repeat: number };

    const fn = OptionableFunc<Values>(
      { values: ['repeat'] as const },
      ({ repeat }, a: string, b: string) => {
        let result = '';
        for (let i = 0; i < (repeat ?? 0); i++) {
          result = i % 2 === 0 ? `${result}/${a}` : `${result}/${b}`;
        }
        return result || `${a}/${b}`;
      },
    );

    expect(fn('image', 'png')).toBe('image/png');
    expect(fn.repeat(5)('image', 'png')).toBe('/image/png/image/png/image');
    expect(fn.repeat(5).repeat(3)('image', 'png')).toBe('/image/png/image');

    // 型: repeat の引数/戻り値
    expectTypeOf(fn.repeat).parameter(0).toEqualTypeOf<number>();
    expectTypeOf(fn.repeat(1)).toMatchTypeOf<typeof fn>();

    // @ts-expect-error 値の型不一致はエラー
    fn.repeat('3');

    // @ts-expect-error 未定義の values キーはエラー
    expect(() => fn.times(2)).toThrow(/is not a function/);
  });

  it('switches と values の併用 & 型の伝播', () => {
    type Values = { repeat: number };

    const fn = OptionableFunc<Values, 'reversed', [string, string], string>(
      { switches: ['reversed'] as const, values: ['repeat'] as const },
      ({ repeat, reversed }, a, b) => {
        const base = reversed ? `${b}/${a}` : `${a}/${b}`;
        if (!repeat || repeat <= 1) return base;

        let out = '';
        for (let i = 0; i < repeat; i++) {
          out += (i === 0 ? '' : '') + (i % 2 === 0 ? `/${a}` : `/${b}`);
        }
        return out || base;
      },
    );

    expect(fn('image', 'png')).toBe('image/png');
    expect(fn.reversed('image', 'png')).toBe('png/image');
    expect(fn.repeat(3)('image', 'png')).toBe('/image/png/image');
    expect(fn.repeat(4).reversed('image', 'png')).toBe('/image/png/image/png');

    // 型: reversed は (a,b)=>string、repeat は (n)=>OptionableFunc<...>
    expectTypeOf(fn.reversed).toBeCallableWith('a', 'b');
    expectTypeOf(fn.reversed).returns.toEqualTypeOf<string>();
    expectTypeOf(fn.repeat(2)).toMatchTypeOf<typeof fn>();
  });

  it('型：OptionableFunc 型レベルの整合性（Values, Switches の順）', () => {
    type Values = { repeat: number; sep: string };
    type Sw = 'reversed' | 'debug';

    // 戻り値の型は string、引数は [string, string]
    const f: OptionableFunc<Values, Sw, [string, string], string> = OptionableFunc<
      Values,
      Sw,
      [string, string],
      string
    >(
      { switches: ['reversed', 'debug'] as const, values: ['repeat', 'sep'] as const },
      ({ repeat, sep, reversed, debug }, a, b) => {
        const s = sep ?? '/';
        const base = reversed ? `${b}${s}${a}` : `${a}${s}${b}`;
        const head = debug ? '[DEBUG]' : '';
        if (!repeat || repeat <= 1) return head + base;

        let out = '';
        for (let i = 0; i < repeat; i++) {
          out += (i === 0 ? '' : '') + (i % 2 === 0 ? `${s}${a}` : `${s}${b}`);
        }
        return head + out;
      },
    );

    // 値・スイッチの存在を型で確認
    expectTypeOf(f.repeat).parameter(0).toEqualTypeOf<number>();
    expectTypeOf(f.sep).parameter(0).toEqualTypeOf<string>();
    expectTypeOf(f.reversed).toBeCallableWith('x', 'y');
    expectTypeOf(f.debug).toBeCallableWith('x', 'y');

    // ランタイム確認
    expect(f('A', 'B')).toBe('A/B');
    expect(f.reversed('A', 'B')).toBe('B/A');
    expect(f.sep('-')('A', 'B')).toBe('A-B');
    expect(f.sep('-').reversed('A', 'B')).toBe('B-A');
    expect(f.repeat(3)('A', 'B')).toBe('/A/B/A');
    expect(f.sep('-').repeat(4).debug('A', 'B')).toBe('[DEBUG]-A-B-A-B');
  });
});
