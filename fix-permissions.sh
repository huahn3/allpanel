#!/bin/bash

echo "🔧 AllPanel 权限修复脚本"
echo "========================"

# 创建数据目录
echo "📁 创建数据目录..."
mkdir -p ./data

# 设置权限
echo "🔐 设置目录权限..."
chmod 755 ./data

# 如果是Linux/macOS，设置所有者
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🐧 检测到 Linux/macOS 系统，设置所有者权限..."
    sudo chown -R $(id -u):$(id -g) ./data
fi

echo "✅ 权限修复完成！"
echo ""
echo "现在可以运行："
echo "  docker-compose up -d"
echo ""
echo "或者使用本地构建："
echo "  docker-compose -f docker-compose.local.yml up -d"
