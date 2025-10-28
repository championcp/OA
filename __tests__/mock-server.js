const express = require('express');

// 创建专用于测试的模拟server
const createTestServer = () => {
  const app = express();
  
  // 添加测试用路由
  app.get('/api/health-check', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  return app;
};

module.exports = createTestServer;