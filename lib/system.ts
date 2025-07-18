import * as si from 'systeminformation'

export interface SystemInfo {
  cpu: {
    usage: number
    temperature?: number
    cores: number
  }
  memory: {
    total: number
    used: number
    free: number
    usage: number
  }
  disk: {
    total: number
    used: number
    free: number
    usage: number
  }
  network?: {
    rx: number
    tx: number
  }
}





export async function getSystemInfo(): Promise<SystemInfo> {
  try {
    const [cpuLoad, memory, disk, networkStats] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats()
    ])

    // 获取主磁盘信息（通常是第一个）
    const mainDisk = disk[0] || { size: 0, used: 0, available: 0 }

    // 获取网络统计（主要网络接口）
    const mainNetwork = networkStats[0] || { rx_bytes: 0, tx_bytes: 0 }

    // 计算内存使用率
    let memoryUsage = 0
    let memoryTotal = 0
    let memoryUsed = 0
    let memoryFree = 0

    if (memory) {
      // 使用本地内存数据
      memoryTotal = memory.total
      memoryUsed = memory.used
      memoryFree = memory.free
      // 计算使用率
      if (memory.available) {
        memoryUsage = Math.round(((memory.total - memory.available) / memory.total) * 10000) / 100
      } else {
        const activeMemory = memory.active || (memory.used - (memory.buffcache || 0))
        memoryUsage = Math.round((activeMemory / memory.total) * 10000) / 100
      }
    }

    return {
      cpu: {
        usage: Math.round(cpuLoad.currentLoad * 100) / 100,
        cores: cpuLoad.cpus?.length || 1
      },
      memory: {
        total: memoryTotal,
        used: memoryUsed,
        free: memoryFree,
        usage: memoryUsage
      },
      disk: {
        total: mainDisk.size,
        used: mainDisk.used,
        free: mainDisk.available,
        usage: Math.round((mainDisk.used / mainDisk.size) * 10000) / 100
      },
      network: {
        rx: mainNetwork.rx_bytes,
        tx: mainNetwork.tx_bytes
      }
    }
  } catch (error) {
    console.error('Error fetching system info:', error)
    // 返回默认值
    return {
      cpu: { usage: 0, cores: 1 },
      memory: { total: 0, used: 0, free: 0, usage: 0 },
      disk: { total: 0, used: 0, free: 0, usage: 0 }
    }
  }
}

// 格式化字节数
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
