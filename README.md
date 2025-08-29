# 敏捷开发团队管理软件（Agile Team Manager）

一款面向小型敏捷团队（6人以内）的轻量级敏捷开发管理软件。虽然轻量，但覆盖敏捷开发的全生命周期管理，实现"麻雀虽小，五脏俱全"。

## 功能特点

- **团队角色管理**：支持Scrum Master、Product Owner、Developer、Designer、Tester、Stakeholder等角色
- **需求管理**：用户故事、史诗、Backlog管理
- **任务管理**：任务分解、分配、进度跟踪
- **Sprint管理**：计划、执行、回顾
- **看板与可视化**：任务流转、燃尽图、进度视图
- **文档协作**：轻量化需求说明、会议纪要
- **测试与缺陷跟踪**：简单但完整的测试/缺陷闭环
- **版本与交付管理**：Release Notes，迭代归档

## 技术栈

- **前端**：React + TailwindCSS
- **后端**：Node.js (Express)
- **数据库**：PostgreSQL

## 本地开发环境搭建

### 前提条件

- Node.js (v14+)
- npm (v6+) 或 yarn
- PostgreSQL (v12+)

### 后端设置

1. 克隆仓库
   ```bash
   git clone https://github.com/yourusername/agile-team-manager.git
   cd agile-team-manager
   ```

2. 安装后端依赖
   ```bash
   cd backend
   npm install
   ```

3. 配置环境变量
   ```bash
   cp .env.example .env
   ```
   编辑 `.env` 文件，设置数据库连接信息和JWT密钥

4. 初始化数据库
   ```bash
   psql -U postgres -f db/init.sql
   ```

5. 启动后端服务器
   ```bash
   npm run dev
   ```
   服务器将在 http://localhost:5000 运行

### 前端设置

1. 安装前端依赖
   ```bash
   cd ../frontend
   npm install
   ```

2. 启动前端开发服务器
   ```bash
   npm start
   ```
   前端将在 http://localhost:3000 运行

## 项目结构

```
agile-team-manager/
├── backend/                # 后端代码
│   ├── config/             # 配置文件
│   ├── db/                 # 数据库脚本
│   ├── middleware/         # 中间件
│   ├── routes/             # API路由
│   └── server.js           # 入口文件
├── frontend/               # 前端代码
│   ├── public/             # 静态资源
│   └── src/                # 源代码
│       ├── app/            # Redux配置
│       ├── components/     # React组件
│       ├── features/       # Redux功能模块
│       ├── pages/          # 页面组件
│       └── utils/          # 工具函数
└── docs/                   # 文档
    └── api/                # API文档
```

## 部署

### 生产环境构建

1. 构建前端
   ```bash
   cd frontend
   npm run build
   ```

2. 配置生产环境变量
   在后端目录中，确保 `.env` 文件包含生产环境的配置

3. 启动生产服务器
   ```bash
   cd ../backend
   npm start
   ```

### Docker部署

1. 构建Docker镜像
   ```bash
   docker-compose build
   ```

2. 启动容器
   ```bash
   docker-compose up -d
   ```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

MIT License