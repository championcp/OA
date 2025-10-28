import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

// 加载环境变量
dotenv.config();

// 数据库连接
import db from './db/connection.js';

// 路由导入
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import taskRoutes from './routes/task.routes.js';
import sprintRoutes from './routes/sprint.routes.js';
import userRoutes from './routes/users.js';
import improvementRoutes from './routes/improvement.routes.js';
import retrospectiveRoutes from './routes/retrospective.routes.js';
import velocityRoutes from './routes/velocity.routes.js';
import qualityRoutes from './routes/quality.routes.js';
import favoriteRoutes from './routes/favorite.routes.js';
import shareRoutes from './routes/share.routes.js';

// 中间件导入
import auth from './middleware/auth.middleware.js';
const { authMiddleware, checkPermission, reportAuth } = auth;

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://your-production-domain.com' 
      : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// 中间件配置
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 基础路由
app.get('/', (req, res) => {
  res.json({ message: '敏捷开发团队管理系统 API' });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/sprints', authMiddleware, sprintRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/improvements', authMiddleware, improvementRoutes);
app.use('/api/retrospectives', authMiddleware, retrospectiveRoutes);
app.use('/api/analytics', authMiddleware, velocityRoutes);
app.use('/api/quality', authMiddleware, checkPermission('view_reports'), qualityRoutes);
app.use('/api/favorites', authMiddleware, favoriteRoutes);
app.use('/api/shares', authMiddleware, shareRoutes);
app.use('/api/reports/:reportId', authMiddleware, reportAuth);
app.use('/shared', shareRoutes); // 公开访问路由

// WebSocket连接处理
io.on('connection', (socket) => {
  console.log('用户已连接:', socket.id);
  
  // 加入项目房间
  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`用户 ${socket.id} 加入项目 ${projectId}`);
  });
  
  // 任务更新
  socket.on('task-update', (data) => {
    socket.to(`project-${data.projectId}`).emit('task-updated', data);
  });
  
  // 断开连接
  socket.on('disconnect', () => {
    console.log('用户已断开连接:', socket.id);
  });
});

// 启动服务器
const PORT = process.env.PORT || 5003;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('未处理的Promise拒绝:', error);
});

export { app, server, io };