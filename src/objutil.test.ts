import { describe, it, expectTypeOf } from 'vitest';
import { ObjEntry, FromEntry } from './objutil.js';

describe('primary', () => {
	it('ObjEntry<T> は [K, V] ユニオンになる', () => {
		type Sample = ObjEntry<{ key1: 1; key2: 2 }>
		type Expected = ["key1", 1] | ["key2", 2];

		expectTypeOf<Sample>().toEqualTypeOf<Expected>();
	});

	it('FromEntry<E> は [K, V] ユニオンからオブジェクトを復元する', () => {
		type E = ["key1", 1] | ["key2", 2];
		type O = FromEntry<E>;
		type Expected = { key1: 1; key2: 2 };

		expectTypeOf<O>().toEqualTypeOf<Expected>();

		// 値レベルでも型チェック（正例）
		const ok: O = { key1: 1, key2: 2 };
		void ok;

		// 型誤り（値の型不一致）
		// @ts-expect-error - key2 は 2 でなければならない
		const ng1: O = { key1: 1, key2: "2" };
		void ng1;

		// 型誤り（プロパティ欠落）
		// @ts-expect-error - key2 が欠落
		const ng2: O = { key1: 1 };
		void ng2;
	});

	it('双方向性: FromEntry<ObjEntry<T>> は T に等しい', () => {
		type T = { a: "A"; b: 0 };
		type RoundTrip = FromEntry<ObjEntry<T>>;
		expectTypeOf<RoundTrip>().toEqualTypeOf<T>();
	});

	it('Symbol や number キーも扱える（型レベル）', () => {
		const s = Symbol('s');
		type T = { 0: "zero"; [s]: true };
		type E = ObjEntry<T>;
		type O = FromEntry<E>;

		// E は ["0", "zero"] | [typeof s, true] になる（number キーは文字列キーに正規化される点に注意）
		expectTypeOf<O>().toEqualTypeOf<T>();

		// 値レベルの検証（symbol は実値が必要）
		const obj: O = { 0: "zero", [s]: true };
		void obj;
	});
});
