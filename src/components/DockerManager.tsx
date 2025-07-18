'use client'

import { useState, useEffect } from 'react'
import { Play, Square, RotateCcw, Container, Activity, Clock } from 'lucide-react'

interface ContainerInfo {
  id: string
  name: string
  image: string
  status: string
  state: string
  ports: Array<{
    privatePort: number
    publicPort?: number
    type: string
  }>
  created: number
}

function ContainerCard({ container, onAction }: { 
  container: ContainerInfo
  onAction: (id: string, action: string) => void 
}) {
  const isRunning = container.state === 'running'
  const statusColor = isRunning ? 'text-green-400' : 'text-red-400'
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Container className="text-blue-400" size={20} />
          <div>
            <h3 className="text-white font-medium">{container.name}</h3>
            <p className="text-slate-400 text-sm">{container.image}</p>
          </div>
        </div>
        <span className={`text-sm font-medium ${statusColor}`}>
          {container.state}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">容器ID:</span>
          <span className="text-slate-300 font-mono">{container.id}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">状态:</span>
          <span className="text-slate-300">{container.status}</span>
        </div>
        
        {container.ports.length > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">端口:</span>
            <span className="text-slate-300">
              {container.ports.map(port => 
                `${port.publicPort || ''}:${port.privatePort}/${port.type}`
              ).join(', ')}
            </span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">创建时间:</span>
          <span className="text-slate-300">
            {new Date(container.created * 1000).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex space-x-2">
        {!isRunning && (
          <button
            onClick={() => onAction(container.id, 'start')}
            className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
          >
            <Play size={14} />
            <span>启动</span>
          </button>
        )}
        
        {isRunning && (
          <button
            onClick={() => onAction(container.id, 'stop')}
            className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
          >
            <Square size={14} />
            <span>停止</span>
          </button>
        )}
        
        <button
          onClick={() => onAction(container.id, 'restart')}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
        >
          <RotateCcw size={14} />
          <span>重启</span>
        </button>
      </div>
    </div>
  )
}

export default function DockerManager() {
  const [containers, setContainers] = useState<ContainerInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [dockerConnected, setDockerConnected] = useState<boolean | null>(null)

  const checkDockerStatus = async () => {
    try {
      const response = await fetch('/api/docker/status')
      const data = await response.json()
      setDockerConnected(data.connected)

      if (!data.connected) {
        setError(`Docker连接失败: ${data.error || data.message}`)
        setContainers([])
        return false
      }
      return true
    } catch (err) {
      setDockerConnected(false)
      setError('无法检查Docker状态')
      return false
    }
  }

  const fetchContainers = async () => {
    try {
      // 首先检查Docker连接状态
      const isConnected = await checkDockerStatus()
      if (!isConnected) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/docker/containers')
      if (!response.ok) {
        throw new Error('Failed to fetch containers')
      }
      const data = await response.json()
      setContainers(data)
      setError(null)
      setDockerConnected(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setDockerConnected(false)
    } finally {
      setLoading(false)
    }
  }

  const handleContainerAction = async (containerId: string, action: string) => {
    setActionLoading(containerId)
    try {
      const response = await fetch(`/api/docker/containers/${containerId}/${action}`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} container`)
      }
      
      // 等待一秒后刷新容器列表
      setTimeout(() => {
        fetchContainers()
      }, 1000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchContainers()
    const interval = setInterval(fetchContainers, 10000) // 每10秒更新一次
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
      <div className="bg-red-500/20 border border-red-500 rounded-lg p-6">
        <h3 className="text-red-200 font-semibold mb-2">Docker连接错误</h3>
        <p className="text-red-200 mb-4">{error}</p>

        {dockerConnected === false && (
          <div className="bg-red-500/10 rounded-lg p-4 mb-4">
            <h4 className="text-red-200 font-medium mb-2">可能的解决方案：</h4>
            <ul className="text-red-200 text-sm space-y-1 list-disc list-inside">
              <li>确保Docker Desktop正在运行</li>
              <li>检查Docker Desktop设置中是否启用了&quot;Expose daemon on tcp://localhost:2375 without TLS&quot;</li>
              <li>或者在Docker Desktop设置中启用&quot;Use the WSL 2 based engine&quot;</li>
              <li>重启Docker Desktop服务</li>
            </ul>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={fetchContainers}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            重试连接
          </button>
          <button
            onClick={checkDockerStatus}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            检查状态
          </button>
        </div>
      </div>
    )
  }

  const runningContainers = containers.filter(c => c.state === 'running')
  const stoppedContainers = containers.filter(c => c.state !== 'running')

  return (
    <div className="space-y-6">
      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
          <div className="flex items-center space-x-2">
            <Container className="text-blue-400" size={20} />
            <div>
              <p className="text-slate-400 text-sm">总容器数</p>
              <p className="text-white text-2xl font-bold">{containers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
          <div className="flex items-center space-x-2">
            <Activity className="text-green-400" size={20} />
            <div>
              <p className="text-slate-400 text-sm">运行中</p>
              <p className="text-white text-2xl font-bold">{runningContainers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
          <div className="flex items-center space-x-2">
            <Clock className="text-red-400" size={20} />
            <div>
              <p className="text-slate-400 text-sm">已停止</p>
              <p className="text-white text-2xl font-bold">{stoppedContainers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 容器列表 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Docker 容器</h2>
          <button
            onClick={fetchContainers}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            刷新
          </button>
        </div>

        {containers.length === 0 ? (
          <div className="text-center py-12">
            <Container className="mx-auto text-slate-500 mb-4" size={48} />
            <p className="text-slate-400">没有找到 Docker 容器</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {containers.map((container) => (
              <ContainerCard
                key={container.id}
                container={container}
                onAction={handleContainerAction}
              />
            ))}
          </div>
        )}
      </div>

      {actionLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <span className="text-white">正在执行操作...</span>
          </div>
        </div>
      )}
    </div>
  )
}
