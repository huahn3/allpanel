import { NextResponse } from 'next/server'
import { getSystemInfo } from '../../../../lib/system'
import { cache } from '../../../../lib/cache'

export async function GET() {
  try {
    // 尝试从缓存获取数据
    const cacheKey = 'system-info'
    let systemInfo = cache.get(cacheKey)

    if (!systemInfo) {
      // 缓存未命中，获取新数据
      systemInfo = await getSystemInfo()
      // 缓存5秒，避免频繁调用系统API
      cache.set(cacheKey, systemInfo, 5)
    }

    return NextResponse.json(systemInfo)
  } catch (error) {
    console.error('System API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system information' },
      { status: 500 }
    )
  }
}
