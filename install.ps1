# AllPanel 一键安装脚本 (PowerShell)

Write-Host "🚀 AllPanel 一键安装脚本" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# 检查 Docker 是否安装
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker 未安装，请先安装 Docker" -ForegroundColor Red
    exit 1
}

# 创建数据目录
if (-not (Test-Path -Path "./data")) {
    New-Item -ItemType Directory -Path "./data" | Out-Null
}
Write-Host "📁 创建数据目录成功" -ForegroundColor Green

# 拉取最新镜像
Write-Host "📥 拉取 AllPanel 镜像..." -ForegroundColor Yellow
docker pull ghcr.io/huahn3/allpanel:latest

# 停止并删除旧容器（如果存在）
if (docker ps -a | Select-String -Pattern "allpanel") {
    Write-Host "🔄 停止并删除旧容器..." -ForegroundColor Yellow
    docker stop allpanel
    docker rm allpanel
}

# 启动新容器
Write-Host "🚀 启动 AllPanel..." -ForegroundColor Yellow
docker run -d `
  --name allpanel `
  -p 3000:3000 `
  -v ${PWD}/data:/app/data `
  -v //var/run/docker.sock:/var/run/docker.sock:ro `
  --restart unless-stopped `
  ghcr.io/huahn3/allpanel:latest

# 检查容器是否成功启动
if (docker ps | Select-String -Pattern "allpanel") {
    Write-Host "✅ AllPanel 安装成功！" -ForegroundColor Green
    Write-Host "🌐 访问地址: http://localhost:3000" -ForegroundColor Cyan
} else {
    Write-Host "❌ AllPanel 安装失败，请检查日志:" -ForegroundColor Red
    docker logs allpanel
}