<template>
  <div class="app">
    <header class="header">
      <h1>multiComputed Playground</h1>
      <p class="sub">
        別フィールドは <code>名前.value</code> で参照できます（例: <code>A.value</code>）。フォールバックは <code>return unset</code>。
      </p>
    </header>

    <main class="grid">
      <button class="btn fieldAdder" @click="addFieldAt(0)">＋ フィールドを追加</button>

      <template v-for="(f, fi) in fields" :key="f.id">
        <section class="card">
          <button class="deleter" @click="removeField(f.id)" title="このフィールドを削除"><i class="bi bi-trash" /></button>

          <div class="row">
            <label class="label">名前</label>
            <input class="input" v-model.trim="f.name" placeholder="例: A" />
          </div>

          <div class="row">
            <label class="label">現在値</label>
            <div class="value">
              <code>{{ formatValue(getComputedRef(f.id)?.value) }}</code>
            </div>
          </div>

          <div class="codesHead">
            <div class="label">JavaScript コード（上から順に試す）</div>
          </div>
          <div class="codes">
            <!-- コード追加（先頭） -->
            <button class="btn codeAdder" @click="addCodeAt(f.id, 0)">＋ コードを追加</button>

            <template v-for="(c, ci) in f.codes" :key="c.id">
              <div class="codeRow">
                <textarea
                  class="textarea"
                  v-model="c.code"
                  spellcheck="false"
                  placeholder="例:
if (A.value !== unset) return A.value + 1;
return unset;"
                />
                <div class="codeActions">
                  <button class="deleter" @click="removeCode(f.id, c.id)" title="このコードを削除"><i class="bi bi-trash" /></button>
                </div>
              </div>

              <!-- 各コード欄ごとのエラー -->
              <div class="codeError" v-if="c.error">
                <pre class="codeErrorText">{{ c.error }}</pre>
              </div>

              <!-- コード追加（各コードの下 = 間 + 末尾 になる） -->
              <button class="btn codeAdder" @click="addCodeAt(f.id, ci + 1)">＋ コードを追加</button>
            </template>
          </div>
        </section>

        <!-- フィールド追加（各カードの下 = 間 + 末尾 になる） -->
        <button class="btn fieldAdder" @click="addFieldAt(fi + 1)">＋ フィールドを追加</button>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, shallowRef, watchEffect } from "vue";
import trashSvgUrl from '../assets/trash.svg';
import { multiComputed, unset } from "../lib/multiComputed";

// --------------------
// types
// --------------------
type CodeItem = { id: string; code: string; error: string };
type FieldItem = { id: string; name: string; codes: CodeItem[] };

// --------------------
// state
// --------------------
const fields = reactive<FieldItem[]>([
  {
    id: crypto.randomUUID(),
    name: "A",
    codes: [{ id: crypto.randomUUID(), code: "return 1;", error: "" }],
  },
  {
    id: crypto.randomUUID(),
    name: "B",
    codes: [
      {
        id: crypto.randomUUID(),
        code: `if (A.value !== unset) return A.value + 10;
return unset;`,
        error: "",
      },
      { id: crypto.randomUUID(), code: "return 999;", error: "" },
    ],
  },
]);

// フィールドごとの computedRef を保持（id -> ComputedRef）
const computedById = shallowRef(new Map<string, ReturnType<typeof multiComputed<any, any>>>());

// その時点の「名前 -> ComputedRef」辞書（JS評価時に使う）
const refsByName = shallowRef<Record<string, any>>({});

// --------------------
// helpers (UI ops)
// --------------------
function addFieldAt(index: number) {
  fields.splice(index, 0, {
    id: crypto.randomUUID(),
    name: suggestName(),
    codes: [{ id: crypto.randomUUID(), code: "return unset;", error: "" }],
  });
}

function removeField(id: string) {
  const idx = fields.findIndex((f) => f.id === id);
  if (idx >= 0) fields.splice(idx, 1);

  const m = new Map(computedById.value);
  m.delete(id);
  computedById.value = m;
}

function addCodeAt(fieldId: string, index: number) {
  const f = fields.find((x) => x.id === fieldId);
  if (!f) return;
  f.codes.splice(index, 0, { id: crypto.randomUUID(), code: "return unset;", error: "" });
}

function removeCode(fieldId: string, codeId: string) {
  const f = fields.find((x) => x.id === fieldId);
  if (!f) return;
  const idx = f.codes.findIndex((c) => c.id === codeId);
  if (idx >= 0) f.codes.splice(idx, 1);
}

function getComputedRef(fieldId: string) {
  return computedById.value.get(fieldId);
}

function suggestName() {
  const used = new Set(fields.map((f) => f.name).filter(Boolean));
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (const ch of alphabet) if (!used.has(ch)) return ch;
  return `X${fields.length + 1}`;
}

function formatValue(v: unknown) {
  if (v === unset) return "unset";
  if (typeof v === "string") return JSON.stringify(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

// --------------------
// JS evaluation
// --------------------
function isValidIdentifier(name: string) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
}

function currentParamNames() {
  const names = fields.map((f) => f.name).filter((n) => isValidIdentifier(n));
  const uniq: string[] = [];
  const seen = new Set<string>();
  for (const n of names) {
    if (!seen.has(n)) {
      seen.add(n);
      uniq.push(n);
    }
  }
  return uniq;
}

function makeGetter(code: string, params: string[], refsDict: Record<string, any>) {
  return () => {
    const args = params.map((p) => refsDict[p]).concat(unset);
    const fn = new Function(...params, "unset", code) as (...xs: any[]) => any;
    return fn(...args);
  };
}

// --------------------
// build computedRefs reactively
// --------------------
watchEffect(() => {
  const nextMap = new Map(computedById.value);

  // 一旦、既存computedを拾って name->ref を作る（未作成は後で上書き）
  const tempRefs: Record<string, any> = {};
  for (const f of fields) {
    if (f.name && isValidIdentifier(f.name)) {
      const existing = nextMap.get(f.id);
      if (existing) tempRefs[f.name] = existing;
    }
  }

  const params = currentParamNames();

  for (const f of fields) {
    const getterList = f.codes.map((c, codeIndex) => {
      return () => {
        const refsDict = refsByName.value;
        try {
          const v = makeGetter(c.code, params, refsDict)();
	  c.error = "";
	  return v;
        } catch (err) {
          // ここで c.error をセットし、throw して multiComputed の onError に渡す
          const msg = err instanceof Error ? err.stack ?? err.message : String(err);
          c.error = msg;
          throw err;
        }
      };
    });

    const comp = multiComputed(getterList, {
      unset,
      onError: (_err, _ctx) => {
        // getter側で codeItem.error に入れているので、ここでは「次へ」
        return { type: "continue" } as const;
      },
    });

    nextMap.set(f.id, comp);

    if (f.name && isValidIdentifier(f.name)) {
      tempRefs[f.name] = comp; // 重複名は後勝ち
    }
  }

  computedById.value = nextMap;
  refsByName.value = tempRefs;
});
</script>

<style scoped>
.app {
  padding: 20px;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  --color-danger: rgb(220, 38, 38);
}
.header {
  margin-bottom: 14px;
}
.sub {
  margin: 6px 0 0;
  opacity: 0.8;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 12px;
  align-items: start;
}

.card {
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  padding: 48px 12px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}
.card > .deleter {
  position: absolute;
  top: 12px;
  right: 12px;
}

.row {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}
.row > .cardHeader {
  flex: auto;
}
.row > .label {
  width: 70px;
  font-weight: 600;
  opacity: 0.85;
}
.row > .input {
  flex: 1;
  width: 100%;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.15);
}
.row > .value {
  flex: auto;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.04);
  overflow-x: auto;
}
.codes {
  display: flex;
  flex-direction: column;
}

.btn {
  padding: 2px 10px;
  border-radius: 10px;
  border: 1px solid #222;
  background: white;
  cursor: pointer;
  opacity: 0.5;
}
.btn:hover {
  opacity: 1;
}

.codesHead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0 6px;
}

.codeRow {
  position: relative;
  display: flex;
}
.textarea {
  width: 100%;
  min-height: 96px;
  field-sizing: content;
  resize: none;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12.5px;
  line-height: 1.35;
}
.codeActions {
  position: absolute;
  height: 100%;
  right: 0;
  padding: 5px;
  display: flex;
  align-items: start;
}

.codeError {
  border-radius: 12px;
  border: 1px solid rgb(from var(--color-danger) r g b / 0.35);
  background-color: rgb(from var(--color-danger) r g b / 0.06);
  padding: 10px;
}
.codeErrorText {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
}

.codes {
  border: 1px #ddd solid;
  border-radius: 5px;
}
.codes * {
  border-radius: 0;
  border: none;
}
.fieldAdder {
  border-radius: 5px;
  border-color: #28e;
  background-color: #fff;
}
.fieldAdder:hover {
  background-color: #ccf5ff
}
.codeAdder {
  color: #CCC;
  background-color: #CCC;
}
.codeAdder:hover {
  color: inherit;
  background-color: #AAA;
}
.deleter {
  width: 1.5em;
  height: 1.5em;
  padding: 0;
  opacity: 0.5;
  border: 1px #888 solid;
  color: #888;
  background-color: #8883;
  border-radius: 100%;
}
.deleter:hover {
  color: #e33;
  background-color: #e333;
  border-color: #e33;
  opacity: 1;
}
</style>
