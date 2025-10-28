import express from 'express';
const router = express.Router();

// 项目相关路由
router.get('/', (req, res) => {
  res.json({ projects: [] });
});

export default router;