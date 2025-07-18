'use client'

import { useState, useEffect } from 'react'
import { Cpu, MemoryStick, HardDrive, Activity } from 'lucide-react'

interface SystemInfo {
  cpu: {
    usage: number
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

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function ProgressBar({ value, max, color = 'blue' }: { value: number; max: number; color?: string }) {
  const percentage = (value / max) * 100
  
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }

  const bgColor = percentage > 80 ? colorClasses.red :
                  percentage > 60 ? colorClasses.yellow :
                  colorClasses[color] || colorClasses.blue
  
  return (
    <div className="w-full bg-slate-700 rounded-full h-2">
      <div 
        className={`h-2 rounded-full transition-all duration-300 ${bgColor}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  )
}

function MetricCard({
  title,
  icon: Icon,
  value,
  total,
  percentage
}: {
  title: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  value: number
  total?: number
  percentage: number
}) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon className="text-blue-400" size={20} />
          <h3 className="text-white font-medium">{title}</h3>
        </div>
        <span className="text-2xl font-bold text-white">{percentage.toFixed(1)}%</span>
      </div>
      
      <ProgressBar value={percentage} max={100} />
      
      <div className="mt-3 text-sm text-slate-300">
        <div className="flex justify-between">
          <span>已使用: {formatBytes(value)}</span>
          {total && <span>总计: {formatBytes(total)}</span>}
        </div>
      </div>
    </div>
  )
}

export default function SystemMonitor() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch('/api/system')
      if (!response.ok) {
        throw new Error('Failed to fetch system info')
      }
      const data = await response.json()
      setSystemInfo(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSystemInfo()
    const interval = setInterval(fetchSystemInfo, 5000) // 每5秒更新一次
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
        <p className="text-red-200">错误: {error}</p>
        <button 
          onClick={fetchSystemInfo}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          重试
        </button>
      </div>
    )
  }

  if (!systemInfo) {
    return <div className="text-white">无法获取系统信息</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="CPU 使用率"
          icon={Cpu}
          value={systemInfo.cpu.usage}
          percentage={systemInfo.cpu.usage}
        />
        
        <MetricCard
          title="内存使用率"
          icon={MemoryStick}
          value={systemInfo.memory.used}
          total={systemInfo.memory.total}
          percentage={systemInfo.memory.usage}
        />

        <MetricCard
          title="磁盘使用率"
          icon={HardDrive}
          value={systemInfo.disk.used}
          total={systemInfo.disk.total}
          percentage={systemInfo.disk.usage}
        />
      </div>

      {/* 详细信息 */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
        <h3 className="text-white font-medium mb-4 flex items-center">
          <Activity className="mr-2" size={20} />
          系统详情
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>CPU 核心数:</span>
              <span className="text-white">{systemInfo.cpu.cores}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>内存总量:</span>
              <span className="text-white">{formatBytes(systemInfo.memory.total)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>可用内存:</span>
              <span className="text-white">{formatBytes(systemInfo.memory.free)}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>磁盘总量:</span>
              <span className="text-white">{formatBytes(systemInfo.disk.total)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>可用磁盘:</span>
              <span className="text-white">{formatBytes(systemInfo.disk.free)}</span>
            </div>
            {systemInfo.network && (
              <div className="flex justify-between text-slate-300">
                <span>网络流量:</span>
                <span className="text-white">
                  ↓{formatBytes(systemInfo.network.rx)} ↑{formatBytes(systemInfo.network.tx)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
