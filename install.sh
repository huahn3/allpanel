#!/bin/bash

echo "🚀 AllPanel 一键安装脚本"
echo "=========================="

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 创建数据目录
mkdir -p ./data
echo "📁 创建数据目录成功"

# 拉取最新镜像
echo "📥 拉取 AllPanel 镜像..."
docker pull ghcr.io/huahn3/allpanel:latest

# 停止并删除旧容器（如果存在）
if docker ps -a | grep -q allpanel; then
    echo "🔄 停止并删除旧容器..."
    docker stop allpanel
    docker rm allpanel
fi

# 启动新容器
echo "🚀 启动 AllPanel..."
docker run -d \
  --name allpanel \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --restart unless-stopped \
  ghcr.io/huahn3/allpanel:latest

# 检查容器是否成功启动
if docker ps | grep -q allpanel; then
    echo "✅ AllPanel 安装成功！"
    echo "🌐 访问地址: http://localhost:3000"
else
    echo "❌ AllPanel 安装失败，请检查日志:"
    docker logs allpanel
fi