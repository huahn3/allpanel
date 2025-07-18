# AllPanel 权限修复脚本 (Windows)

Write-Host "🔧 AllPanel 权限修复脚本" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Yellow

# 创建数据目录
Write-Host "📁 创建数据目录..." -ForegroundColor Green
if (!(Test-Path "./data")) {
    New-Item -ItemType Directory -Path "./data" -Force | Out-Null
}

# Windows 下设置权限
Write-Host "🔐 设置目录权限..." -ForegroundColor Green
icacls "./data" /grant Everyone:F /T | Out-Null

Write-Host "✅ 权限修复完成！" -ForegroundColor Green
Write-Host ""
Write-Host "现在可以运行：" -ForegroundColor Cyan
Write-Host "  docker-compose up -d" -ForegroundColor White
Write-Host ""
Write-Host "或者使用本地构建：" -ForegroundColor Cyan
Write-Host "  docker-compose -f docker-compose.local.yml up -d" -ForegroundColor White
