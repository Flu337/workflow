import { ref, watch, onBeforeUnmount, type Ref } from 'vue'

// задержка обновления поискового запроса для снижения числа обращений к серверу
export function useDebounce<T>(source: Ref<T>, delayMs = 300): Ref<T> {
  const debounced = ref<T>(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(
    source,
    (newVal) => {
      if (timer) {
        clearTimeout(timer)
      }
      if (typeof newVal === 'string' && newVal.trim() === '') {
        debounced.value = newVal
        return
      }
      timer = setTimeout(() => {
        debounced.value = newVal
      }, delayMs)
    },
    { flush: 'sync' }
  )

  onBeforeUnmount(() => {
    if (timer) {
      clearTimeout(timer)
    }
  })

  return debounced
}
