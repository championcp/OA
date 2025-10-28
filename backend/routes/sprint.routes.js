import express from 'express';
import auth from '../middleware/auth.middleware.js';
const { authMiddleware } = auth;
import SprintService from '../services/sprint.service.js';
import { check } from 'express-validator';

const router = express.Router();

// 创建Sprint
router.post('/', 
  authMiddleware,
  [
    check('name').notEmpty().withMessage('Sprint名称不能为空'),
    check('startDate').isISO8601().withMessage('无效的开始日期'),
    check('endDate').isISO8601().withMessage('无效的结束日期'),
    check('projectId').notEmpty().withMessage('必须指定项目ID')
  ],
  async (req, res) => {
    try {
      const sprint = await SprintService.createSprint(
        req.body.projectId, 
        req.body
      );
      res.status(201).json(sprint);
    } catch (error) {
      console.error('创建Sprint失败:', error);
      res.status(500).json({ message: '创建Sprint失败' });
    }
  }
);

// 生成Sprint计划预览
router.get('/preview', 
  authMiddleware,
  [
    check('projectId').notEmpty().withMessage('必须指定项目ID'),
    check('durationWeeks').isInt({ min: 1, max: 4 })
  ],
  async (req, res) => {
    try {
      const plan = await SprintService.generateSprintPlan(
        req.query.projectId,
        req.query.durationWeeks
      );
      res.json(plan);
    } catch (error) {
      console.error('生成计划失败:', error);
      res.status(500).json({ message: '生成计划失败' });
    }
  }
);

export default router;