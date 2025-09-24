/*
 * このコードではJavaScriptの反復処理プロトコル及びジェネレーター関数を利用しています。
 * 詳細は https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/function*
 * を参照して下さい。
 */

/*
 * K: Key
 * V: Value
 * D: Default
 */
export interface Dictionary<K, V, D> {
	get(key: K): V | D;
	// 返り値はthis?void?val?
	set(key: K, val: V): void;
	// 返り値はthis?void?val?boolean?
	del(key: K): void;

	// getで代用可能なため必ずしも実装しなくてよい？
	// VとDが被るような場合は見分けがつかない場合があるかも
	has?(key: K): boolean;
	// 返り値は配列？イテレータ？イテラブル？ジェネレータ？
	// 実装によってはキーがハッシュ化されるためkeysを可能にするには追加のコストが必要に
	keys?(): K[];
	vals(): V[];
	kvs?(): [K, V][]; //entries, ipairs
}
export type DGenerator = Generator<[SeriExpToken[], V], void, undefined>

// TODO: 同時書き込みが発生した場合の衝突の解決
export class DicNode <K, V, D> {
	private data?: V;
	private children = new Map<SeriExpToken, DicNode<V>>();

	constructor(kvs?: [K, V][]) {
		if (!kvs) return;
		for (const [key, val] of kvs) this.set(key, val);
	}

	get(key: Value): V | undefined {
		return this.getRaw(serialize(key));
	}
	has(key: Value): boolean {
		return this.getRaw(serialize(key)) ? true : false;
	}
	getRaw(keyGen: Generator<SeriExpToken, void, undefined>): V | undefined {
		const { value: key, done } = keyGen.next();
		if (done) return this.data;
		else return this.children.get(key)?.getRaw(keyGen);
	}

	set(key: Value, val: V): void {
		this.setRaw(serialize(key), val);
	}
	setRaw(keyGen: Generator<SeriExpToken, void, undefined>, val: V): void {
		const { value: key, done } = keyGen.next();
		if (done) this.data = val;
		else {
			if (!this.children.has(key)) this.children.set(key, new DicNode<V>());
			this.children.get(key)!.setRaw(keyGen, val);
		}
	}

	*kvs(): Generator<[Value, V], void, undefined> {
		for (const [seriExp, val] of this.serializedKvs()) {
			yield [deserialize(seriExp), val];
		}
	}
	*serializedKvs(keyPrefix?: SeriExpToken[]): Generator<[SeriExpToken[], V], void, undefined> {
		const kp = keyPrefix ?? [];
		if (this.data) yield [kp, this.data];
		for (const [key, childNode] of this.children) {
			yield* childNode.serializedKvs([...kp, key]);
		}
	}
}

