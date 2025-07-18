# AllPanel - NAS管理面板

一个现代化的Docker管理面板，集成系统监控、Docker容器管理和网址收藏功能。

![AllPanel 截图](https://via.placeholder.com/800x450.png?text=AllPanel+Screenshot)

## ✨ 功能特性

- 🖥️ **系统监控** - 实时CPU、内存、磁盘使用率监控
- 🐳 **Docker管理** - 容器启动/停止/重启操作
- 🔖 **网址收藏** - 书签管理和分类
- 🎨 **现代界面** - 深色主题，响应式设计

## 🚀 一键安装

### 使用 Docker 命令（最简单）

```bash
docker run -d \
  --name allpanel \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --restart unless-stopped \
  ghcr.io/huahn3/allpanel:latest
```

### 使用 Docker Compose

将以下内容保存为 `docker-compose.yml`：

```yaml
version: '3.8'
services:
  allpanel:
    image: ghcr.io/huahn3/allpanel:latest
    container_name: allpanel
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
      - /var/run/docker.sock:/var/run/docker.sock:ro
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/data/dev.db
    restart: unless-stopped
```

然后运行：

```bash
docker-compose up -d
```

安装完成后，访问 http://localhost:3000

## 📱 功能展示

### 系统监控
![系统监控](https://via.placeholder.com/400x200.png?text=System+Monitor)

### Docker 管理
![Docker管理](https://via.placeholder.com/400x200.png?text=Docker+Management)

### 书签管理
![书签管理](https://via.placeholder.com/400x200.png?text=Bookmark+Manager)

## 🛠️ 技术栈

- **前端**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Node.js
- **数据库**: SQLite + Prisma ORM
- **系统监控**: systeminformation
- **Docker API**: dockerode

## 📝 详细文档

更多详细信息，请查看 [INSTALL.md](INSTALL.md) 和 [DEVELOPMENT.md](DEVELOPMENT.md)。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
