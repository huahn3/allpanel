# AllPanel 开发指南

## 开发环境设置

### 前提条件

- Node.js 18+
- npm 或 yarn
- Docker (用于容器管理功能)

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/[YOUR_GITHUB_USERNAME]/allpanel.git
cd allpanel
```

2. 安装依赖
```bash
npm install
```

3. 设置环境变量
```bash
cp .env.example .env
```

4. 初始化数据库
```bash
npx prisma generate
npx prisma db push
```

5. 启动开发服务器
```bash
npm run dev
```

6. 访问应用
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
allpanel/
├── src/
│   ├── app/
│   │   ├── api/              # API路由
│   │   │   ├── system/       # 系统监控API
│   │   │   ├── docker/       # Docker管理API
│   │   │   └── bookmarks/    # 书签管理API
│   │   ├── layout.tsx        # 根布局
│   │   └── page.tsx          # 主页面
│   └── components/           # React组件
│       ├── SystemMonitor.tsx # 系统监控组件
│       ├── DockerManager.tsx # Docker管理组件
│       └── BookmarkManager.tsx # 书签管理组件
├── lib/                      # 工具库
│   ├── prisma.ts            # 数据库客户端
│   ├── docker.ts            # Docker API封装
│   └── system.ts            # 系统信息获取
├── prisma/                   # 数据库配置
│   └── schema.prisma        # 数据库模式
├── scripts/                  # 脚本文件
│   └── init-db.js           # 数据库初始化脚本
├── Dockerfile               # Docker配置
├── docker-compose.yml       # 容器编排
└── README.md                # 项目文档
```

## 数据库模型

```prisma
model Bookmark {
  id          String   @id @default(cuid())
  title       String
  url         String
  description String?
  icon        String?
  category    String   @default("default")
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("bookmarks")
}
```

## API 文档

### 系统监控
- `GET /api/system` - 获取系统信息

### Docker管理
- `GET /api/docker/containers` - 获取容器列表
- `POST /api/docker/containers/{id}/{action}` - 容器操作（start/stop/restart）

### 书签管理
- `GET /api/bookmarks` - 获取书签列表
- `POST /api/bookmarks` - 创建书签
- `PUT /api/bookmarks/{id}` - 更新书签
- `DELETE /api/bookmarks/{id}` - 删除书签

## 构建生产版本

```bash
npm run build
```

## Docker 构建

```bash
docker build -t allpanel .
```

## 贡献指南

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 代码风格

项目使用 ESLint 和 Prettier 进行代码格式化。在提交代码前，请运行：

```bash
npm run lint
```