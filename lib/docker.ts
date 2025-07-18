import Docker from 'dockerode'

// 创建Docker客户端实例
function createDockerClient() {
  // 检查是否在容器内运行
  const isInContainer = process.env.DOCKER_CONTAINER === 'true' ||
                       process.env.NODE_ENV === 'production'

  if (process.platform === 'win32' && !isInContainer) {
    // Windows: 使用命名管道连接Docker Desktop
    return new Docker({
      socketPath: '\\\\.\\pipe\\docker_engine'
    })
  } else {
    // Linux/macOS 或容器内: 使用Unix socket
    return new Docker({
      socketPath: '/var/run/docker.sock'
    })
  }
}

// 创建备用Docker客户端（TCP连接）
function createFallbackDockerClient() {
  return new Docker({
    host: '127.0.0.1',
    port: 2375,
    timeout: 5000
  })
}

export const docker = createDockerClient()
export const dockerFallback = createFallbackDockerClient()

// 获取可用的Docker客户端
export async function getDockerClient(): Promise<Docker> {
  try {
    await docker.ping()
    return docker
  } catch (error) {
    console.warn('使用备用Docker连接')
    return dockerFallback
  }
}

// Docker容器状态类型
export interface ContainerInfo {
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
  cpuUsage?: number
  memoryUsage?: number
}

// 测试Docker连接
export async function testDockerConnection(): Promise<{ success: boolean; error?: string; method?: string }> {
  // 首先尝试主要连接方式（命名管道或Unix socket）
  try {
    await docker.ping()
    return {
      success: true,
      method: process.platform === 'win32' ? 'named pipe' : 'unix socket'
    }
  } catch (primaryError) {
    console.warn('Primary Docker connection failed:', primaryError)

    // 在Windows上，如果命名管道失败，尝试TCP连接
    if (process.platform === 'win32') {
      try {
        await dockerFallback.ping()
        return {
          success: true,
          method: 'tcp'
        }
      } catch (fallbackError) {
        console.error('Fallback Docker connection also failed:', fallbackError)
        return {
          success: false,
          error: `Both named pipe and TCP connection failed. Primary: ${primaryError instanceof Error ? primaryError.message : 'Unknown error'}. Fallback: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`
        }
      }
    }

    return {
      success: false,
      error: primaryError instanceof Error ? primaryError.message : 'Unknown error'
    }
  }
}

// 获取正确的Docker客户端
async function getWorkingDockerClient() {
  try {
    await docker.ping()
    return docker
  } catch (error) {
    if (process.platform === 'win32') {
      try {
        await dockerFallback.ping()
        return dockerFallback
      } catch (fallbackError) {
        throw new Error('Both Docker connections failed')
      }
    }
    throw error
  }
}

// 获取所有容器
export async function getAllContainers(): Promise<ContainerInfo[]> {
  try {
    // 获取工作的Docker客户端
    const workingDocker = await getWorkingDockerClient()

    const containers = await workingDocker.listContainers({ all: true })
    return containers.map(container => ({
      id: container.Id.substring(0, 12),
      name: container.Names[0]?.replace('/', '') || 'unknown',
      image: container.Image,
      status: container.Status,
      state: container.State,
      ports: container.Ports.map(port => ({
        privatePort: port.PrivatePort,
        publicPort: port.PublicPort,
        type: port.Type
      })),
      created: container.Created
    }))
  } catch (error) {
    console.error('Error fetching containers:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
    }
    return []
  }
}

// 获取容器统计信息
export async function getContainerStats(containerId: string) {
  try {
    const container = docker.getContainer(containerId)
    const stats = await container.stats({ stream: false })
    
    // 计算CPU使用率
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage
    const cpuUsage = (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100

    // 计算内存使用率
    const memoryUsage = (stats.memory_stats.usage / stats.memory_stats.limit) * 100

    return {
      cpuUsage: Math.round(cpuUsage * 100) / 100,
      memoryUsage: Math.round(memoryUsage * 100) / 100,
      memoryLimit: stats.memory_stats.limit,
      memoryUsed: stats.memory_stats.usage
    }
  } catch (error) {
    console.error('Error fetching container stats:', error)
    return null
  }
}

// 容器操作
export async function startContainer(containerId: string) {
  try {
    const container = docker.getContainer(containerId)
    await container.start()
    return { success: true }
  } catch (error) {
    console.error('Error starting container:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function stopContainer(containerId: string) {
  try {
    const container = docker.getContainer(containerId)
    await container.stop()
    return { success: true }
  } catch (error) {
    console.error('Error stopping container:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function restartContainer(containerId: string) {
  try {
    const container = docker.getContainer(containerId)
    await container.restart()
    return { success: true }
  } catch (error) {
    console.error('Error restarting container:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
