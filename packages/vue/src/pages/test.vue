<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { multiComputed, unset } from "../lib/multiComputed";

type User = { id: string; name: string };

async function fetchUser(id: string): Promise<User> {
  await new Promise((r) => setTimeout(r, 300));
  if (id === "404") throw new Error("User not found");
  return { id, name: id === "1" ? "Alice" : id === "2" ? "Bob" : `User#${id}` };
}

/**
 * route.query.id を string に正規化
 * - ?id=1 -> "1"
 * - ?id=1&id=2 -> ["1","2"] になり得るので先頭を採用
 */
function readQueryIdFromRoute(routeQueryId: unknown): string | typeof unset {
  if (routeQueryId == null) return unset;
  if (Array.isArray(routeQueryId)) {
    const v = routeQueryId[0];
    return typeof v === "string" && v.length > 0 ? v : unset;
  }
  return typeof routeQueryId === "string" && routeQueryId.length > 0 ? routeQueryId : unset;
}

/**
 * localStorage（SSR安全）
 */
const LS_KEY = "demo:lastUserId";
function readLastIdFromStorage(): string | typeof unset {
  if (typeof window === "undefined") return unset; // SSRガード
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return unset;

  // デモ：壊れてたら例外（＝デフォルトrethrowなら落ちる）
  if (raw.startsWith("{")) {
    throw new Error("localStorage is corrupted (expected plain id string)");
  }
  return raw;
}
function writeLastIdToStorage(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, id);
}

const route = useRoute();
const router = useRouter();

const manualId = ref("");

/**
 * query -> manual -> storage の優先順位で id を決定
 * - query は Router が持ってくるので window 不要
 * - storage 例外は「次へ」にしたいケースが多いので onError で continue
 *   （デフォルトrethrowが良いなら onError を消してください）
 */
const selectedId = multiComputed<string>(
  [
    () => readQueryIdFromRoute(route.query.id),
    () => (manualId.value.trim() ? manualId.value.trim() : unset),
    () => readLastIdFromStorage(),
  ],
  {
    onError: (err, { index }) => {
      // index=2 が storage getter
      console.warn("getter error -> continue", { index, err });
      return { type: "continue" };
    },
  }
);

const loading = ref(false);
const user = ref<User | typeof unset>(unset);
const error = ref<unknown>(null);

/**
 * 選ばれた id でユーザーをロード
 */
watchEffect(async () => {
  const id = selectedId.value;
  user.value = unset;
  error.value = null;

  if (id === unset) return;

  loading.value = true;
  try {
    const u = await fetchUser(id);
    user.value = u;
    writeLastIdToStorage(id);
  } catch (e) {
    error.value = e;
  } finally {
    loading.value = false;
  }
});

/**
 * UI操作：手入力をクエリに反映（RouterでURLも更新）
 */
async function applyManualToQuery() {
  const id = manualId.value.trim();
  await router.replace({
    query: {
      ...route.query,
      id: id ? id : undefined, // 空ならクエリを消す
    },
  });
}

/**
 * UI操作：クエリ id を消す
 */
async function clearQueryId() {
  const q = { ...route.query };
  delete (q as any).id;
  await router.replace({ query: q });
}

const statusText = computed(() => {
  if (selectedId.value === unset) return "未選択（unset）";
  if (loading.value) return `読み込み中… (id=${selectedId.value})`;
  if (error.value) return `読み込み失敗: ${(error.value as any)?.message ?? String(error.value)}`;
  if (user.value !== unset) return `OK: ${(user.value as User).name} (id=${(user.value as User).id})`;
  return "待機中";
});
</script>

<template>
  <div style="padding:16px; font-family: system-ui; line-height:1.6;">
    <h2>Vue Router版：multiComputed で優先順位フォールバック</h2>

    <p>
      <strong>現在のクエリ id:</strong>
      <code>{{ Array.isArray(route.query.id) ? route.query.id.join(",") : (route.query.id ?? "null") }}</code>
    </p>

    <div style="display:flex; gap:12px; align-items:center; flex-wrap: wrap;">
      <label>手入力ID:</label>
      <input v-model="manualId" placeholder="例: 1 / 2 / 404" style="padding:6px 10px;" />
      <button @click="applyManualToQuery" style="padding:6px 10px;">クエリに反映</button>
      <button @click="clearQueryId" style="padding:6px 10px;">クエリidを消す</button>
      <button @click="manualId=''" style="padding:6px 10px;">手入力クリア</button>
    </div>

    <hr />

    <p>
      <strong>multiComputedで選ばれたID:</strong>
      <code>{{ selectedId === unset ? 'unset' : selectedId }}</code>
    </p>

    <p><strong>状態:</strong> {{ statusText }}</p>

    <details style="margin-top:12px;">
      <summary>補足</summary>
      <ul>
        <li>優先順位：<code>route.query.id</code> → 手入力 → localStorage → unset</li>
        <li>この例は storage 例外を <code>continue</code> しています（壊れていても次へ）。デフォルトrethrowに戻すなら <code>onError</code> を消してください。</li>
      </ul>
    </details>
  </div>
</template>
