import { computed, type ComputedRef } from "@vue/reactivity";

export const unset = Symbol("unset");
type DefaultUnset = typeof unset;

type Getter<T> = () => T;

type OnErrorResult<T, U> =
  | { type: "continue" }
  | { type: "return"; value: T | U }
  | { type: "throw"; error?: unknown };

interface MultiComputedOptions<T, U> {
  unset?: U;
  onError?: (err: unknown, ctx: { index: number }) => OnErrorResult<T, U> | void;
}

export function multiComputed<T, U = DefaultUnset>(
  getters: Getter<T | U>[],
  options: MultiComputedOptions<T, U> = {}
): ComputedRef<T | U> {
  const unsetValue = (options.unset ?? (unset as unknown as U)) as U;

  return computed(() => {
    for (let i = 0; i < getters.length; i++) {
      const getter = getters[i]!;
      try {
        const value = getter();
        if (value !== unsetValue) return value;
      } catch (err) {
        if (!options.onError) throw err;

        const decision = options.onError(err, { index: i });
        if (!decision || decision.type === "throw") throw (decision?.error ?? err);
        if (decision.type === "continue") continue;
        if (decision.type === "return") return decision.value;
      }
    }
    return unsetValue;
  });
}
