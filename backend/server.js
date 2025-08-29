const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 导入数据库连接
const db = require('./config/db');

// 初始化Express应用
const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// 定义路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/projects/:projectId/sprints', require('./routes/sprints'));
app.use('/api/projects/:projectId/tasks', require('./routes/tasks'));
app.use('/api/projects/:projectId/stories', require('./routes/stories'));
app.use('/api/projects/:projectId/epics', require('./routes/epics'));
app.use('/api/projects/:projectId/bugs', require('./routes/bugs'));
app.use('/api/projects/:projectId/documents', require('./routes/documents'));
app.use('/api/projects/:projectId/releases', require('./routes/releases'));

// 在生产环境中提供静态资源
if (process.env.NODE_ENV === 'production') {
  // 设置静态文件夹
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // 所有未匹配的路由返回React应用
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: '服务器错误' });
});

// 设置端口并启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`服务器运行在端口 ${PORT}`));

// 测试数据库连接
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('数据库连接失败:', err);
  } else {
    console.log('数据库连接成功:', res.rows[0]);
  }
});

module.exports = app; // 为测试导出