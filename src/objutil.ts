export type ObjEntry<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T];

export type FromEntry<E extends [PropertyKey, unknown]> = {
  [K in E as K[0]]: K[1]
};

/*
 * 標準の型をもうちょい狭くしたもの
 * declareでもよくない？とは思う
 */
export const kvs2obj: <E extends [PropertyKey, unknown]>(kvs: E[]) => E
	= Object.fromEntries as never;

export const obj2kvs: <T>(obj: T) => ObjEntry<T>[]
	= Object.entries as never;

export type Assigned<T extends object, S extends object>
	= Omit<T, keyof S> & S;

export const objAssign: <T extends object, S extends object>
	(target: T, source: S) => Assigned<T, S>
	= Object.assign as never;

// 型ガードは元に代入可能な型でしかできない
export const objAssertedAssign: <T extends object, S extends Partial<T>>
	(target: T, source: S) => asserts target is T & S
	= Object.assign as never;

export const hasOwn: <T extends object>(obj: T, key: unknown) => key is keyof T
	= Object.hasOwn as never;

export const arrIncl: <T>(arr: readonly T[], elem: unknown) => elem is T
	= Array.prototype.includes.call as never;

/*
 * Object <-> Map の変換
 */
export function map2obj<K extends PropertyKey, V>(map: Map<K, V>): Record<K, V> {
	const obj = {} as Record<K, V>;
	for (const [k, v] of map.entries()) {
		obj[k] = v;
	}
	return obj;
}

export function obj2map<K extends PropertyKey, V>(obj: Record<K, V>): Map<K, V> {
	return new Map(obj2kvs(obj));
}

/*
 * 配列用の関数をobject向けにしたもの
 */
export function objMap<K extends PropertyKey, V, V2>(obj: Record<K, V>, cb: (v: V, k: K) => V2): Record<K, V2> {
	return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, cb(v as V, k as K)])) as never;
}

/*
 * 再帰系
 */
export type RecursiveGet<T, K extends readonly PropertyKey[], Fail> =
	K extends [] ? T
		: K extends [infer K0 extends keyof T, ...infer KR extends readonly PropertyKey[]]
			? RecursiveGet<T[K0], KR, Fail> : Fail;

export function recursiveGet<T, K extends readonly PropertyKey[], Fail = undefined>(
	obj: T, path: K,
	// onFailの引数はもう少し考えたい
	onFail?: (key: K[number]) => Fail,
): RecursiveGet<T, K, Fail> {
	let cd = obj;
	for (const key of path) {
		// has判定どうする？（できれば型と合わせたい）
		if (cd == null) return onFail?.(key) as never;
		cd = cd[key as never];
	}
	return cd as never;
}

export function repeatApply<T>(initial: T, func: (v: T, i: number) => T, n: number) {
  let v = initial;
  for (let i = 0; i < n; i++) v = func(v, i);
  return v;
}
export function applyWhile<T>(initial: T, func: (v: T, i: number) => T, isContinue: (v: T, i: number) => boolean) {
  let v = initial;
  for (let i = 0; isContinue(v, i); i++) v = func(v, i);
  return v;
}
export function applyDoWhile<T>(initial: T, func: (v: T, i: number) => T, isContinue: (v: T, i: number) => boolean) {
  let v = func(initial, 0);
  for (let i = 1; isContinue(v, i); i++) v = func(v, i);
  return v;
}
