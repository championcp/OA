import express from 'express';
const router = express.Router();

// 用户认证路由
router.post('/login', (req, res) => {
  res.json({ token: 'test-token' });
});

export default router;