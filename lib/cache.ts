// 简单的内存缓存实现
class MemoryCache {
  private cache = new Map<string, { data: unknown; expiry: number }>()

  set(key: string, data: unknown, ttlSeconds: number = 300) {
    const expiry = Date.now() + ttlSeconds * 1000
    this.cache.set(key, { data, expiry })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  // 清理过期缓存
  cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

export const cache = new MemoryCache()

// 定期清理过期缓存
setInterval(() => {
  cache.cleanup()
}, 60000) // 每分钟清理一次
