const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// 加载环境变量
dotenv.config();

// 数据库连接
const db = require('./db/connection');

// 路由导入
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const sprintRoutes = require('./routes/sprint.routes');
const userRoutes = require('./routes/user.routes');
const improvementRoutes = require('./routes/improvement.routes');
const retrospectiveRoutes = require('./routes/retrospective.routes');
const velocityRoutes = require('./routes/velocity.routes');

// 中间件导入
const { authMiddleware } = require('./middleware/auth.middleware');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
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
const PORT = process.env.PORT || 5000;
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

module.exports = { app, server, io };