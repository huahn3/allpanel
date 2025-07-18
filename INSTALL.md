# AllPanel 安装指南

## 方法一：使用 Docker 命令（最简单）

```bash
docker run -d \
  --name allpanel \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --restart unless-stopped \
  ghcr.io/huahn3/allpanel:latest
```

Windows PowerShell 用户:
```powershell
docker run -d `
  --name allpanel `
  -p 3000:3000 `
  -v ${PWD}/data:/app/data `
  -v //var/run/docker.sock:/var/run/docker.sock:ro `
  --restart unless-stopped `
  ghcr.io/huahn3/allpanel:latest
```

## 方法二：使用 Docker Compose

1. 创建 `docker-compose.yml` 文件:

```yaml
version: '3.8'

services:
  allpanel:
    image: ghcr.io/huahn3/allpanel:latest
    container_name: allpanel
    ports:
      - "3000:3000"
    volumes:
      # 数据持久化
      - ./data:/app/data
      # Docker socket挂载 - 用于Docker管理功能
      - /var/run/docker.sock:/var/run/docker.sock:ro
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/data/dev.db
      - NEXT_TELEMETRY_DISABLED=1
    restart: unless-stopped
```

2. 启动服务:

```bash
docker-compose up -d
```

## 访问应用

安装完成后，打开浏览器访问:
http://localhost:3000

## 数据持久化

所有数据存储在 `./data` 目录中，确保该目录有适当的权限。

## 更新应用

```bash
# 使用 Docker 命令
docker pull ghcr.io/huahn3/allpanel:latest
docker stop allpanel
docker rm allpanel
# 然后重新运行上面的 docker run 命令

# 使用 Docker Compose
docker-compose pull
docker-compose up -d
```