import { reactive, toRefs, isRef, type Ref, type ComputedRef, type ToRefs } from 'vue'
import { tryUseNuxtApp } from '#app'

type StoreRegistry = Record<string, unknown>

const clientFallbackRegistry: StoreRegistry = {}

// типизированная реализация definestore совместимая с pinia и ssr в nuxt 4
export function defineStore<Id extends string, SS extends Record<string, unknown>>(
  id: Id,
  setup: () => SS
): () => VueUnwrapStore<SS> & { $id: Id } {
  return () => {
    const nuxtApp = tryUseNuxtApp()
    const registry: StoreRegistry = nuxtApp
      ? ((nuxtApp as unknown as { _wfPiniaStores?: StoreRegistry })._wfPiniaStores ||= {})
      : clientFallbackRegistry

    if (!registry[id]) {
      const rawSetup = setup()
      const storeInstance = reactive(rawSetup) as unknown as VueUnwrapStore<SS> & {
        $id: Id
        _rawSetup?: SS
      }
      Object.defineProperty(storeInstance, '$id', {
        value: id,
        enumerable: false
      })
      Object.defineProperty(storeInstance, '_rawSetup', {
        value: rawSetup,
        enumerable: false
      })
      registry[id] = storeInstance
    }

    return registry[id] as VueUnwrapStore<SS> & { $id: Id }
  }
}

export type VueUnwrapStore<SS> = {
  [K in keyof SS]: SS[K] extends Ref<infer V>
    ? V
    : SS[K] extends ComputedRef<infer C>
      ? C
      : SS[K]
}

export type StoreRefs<SS> = {
  [K in keyof SS as SS[K] extends (...args: never[]) => unknown ? never : K]: SS[K] extends Ref<infer V>
    ? Ref<V>
    : SS[K] extends ComputedRef<infer C>
      ? ComputedRef<C>
      : Ref<SS[K]>
}

export function storeToRefs<SS extends Record<string, unknown>>(
  store: SS
): ToRefs<SS> {
  const raw = (store as unknown as { _rawSetup?: Record<string, unknown> })._rawSetup
  if (raw) {
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(raw)) {
      const val = raw[key]
      if (isRef(val)) {
        result[key] = val
      }
    }
    return result as ToRefs<SS>
  }
  return toRefs(store)
}
