import { NextRequest } from 'next/server'

// 速率限制
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(ip: string, maxRequests: number = 100, windowMs: number = 60000) {
  const now = Date.now()
  const windowStart = now - windowMs
  
  // 清理过期记录
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitMap.delete(key)
    }
  }
  
  const current = rateLimitMap.get(ip)
  
  if (!current) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }
  
  if (current.resetTime < now) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }
  
  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }
  
  current.count++
  return { allowed: true, remaining: maxRequests - current.count }
}

// 获取客户端IP
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// 输入验证
export function validateURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function sanitizeString(input: string): string {
  return input.replace(/[<>\"'&]/g, (match) => {
    const map: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;'
    }
    return map[match]
  })
}

// Docker容器ID验证
export function validateContainerID(id: string): boolean {
  // Docker容器ID应该是12或64位十六进制字符串
  return /^[a-f0-9]{12}$|^[a-f0-9]{64}$/i.test(id)
}
