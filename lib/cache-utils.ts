// Cache simples para armazenar dados em memória
const cache: Record<string, { data: any; timestamp: number }> = {}

// Tempo padrão de expiração do cache (5 minutos)
const DEFAULT_CACHE_TIME = 5 * 60 * 1000

export function getCachedData<T>(key: string): T | null {
  const cachedItem = cache[key]

  if (!cachedItem) return null

  // Verificar se o cache expirou
  const now = Date.now()
  if (now - cachedItem.timestamp > DEFAULT_CACHE_TIME) {
    delete cache[key]
    return null
  }

  return cachedItem.data as T
}

export function setCachedData<T>(key: string, data: T): void {
  cache[key] = {
    data,
    timestamp: Date.now(),
  }
}

export function clearCache(keyPrefix?: string): void {
  if (keyPrefix) {
    Object.keys(cache).forEach((key) => {
      if (key.startsWith(keyPrefix)) {
        delete cache[key]
      }
    })
  } else {
    Object.keys(cache).forEach((key) => {
      delete cache[key]
    })
  }
}
