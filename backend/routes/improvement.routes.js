const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { ImprovementAction, Sprint, User } = require('../db/models');
const improvementService = require('../services/improvement.service');

// 获取Sprint的改进措施列表
router.get('/sprint/:sprintId/improvements', auth, async (req, res) => {
  try {
    const { sprintId } = req.params;
    const improvements = await improvementService.getSprintImprovements(sprintId);
    res.json(improvements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建改进措施
router.post('/sprint/:sprintId/improvements', auth, async (req, res) => {
  try {
    const { sprintId } = req.params;
    const improvement = await improvementService.createImprovementAction(sprintId, req.body);
    res.status(201).json(improvement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新改进措施状态
router.patch('/improvements/:actionId/status', auth, async (req, res) => {
  try {
    const { actionId } = req.params;
    const { status, notes } = req.body;
    
    const success = await improvementService.updateImprovementStatus(actionId, status, notes);
    
    if (success) {
      res.json({ message: '状态更新成功' });
    } else {
      res.status(404).json({ error: '改进措施未找到' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取项目改进措施统计
router.get('/project/:projectId/improvements/stats', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const stats = await improvementService.trackImprovementProgress(projectId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 生成改进报告
router.get('/project/:projectId/improvements/report', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: '需要提供开始日期和结束日期' });
    }

    const report = await improvementService.generateImprovementReport(
      projectId, 
      new Date(startDate), 
      new Date(endDate)
    );
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个改进措施详情
router.get('/improvements/:actionId', auth, async (req, res) => {
  try {
    const { actionId } = req.params;
    const improvement = await ImprovementAction.findByPk(actionId, {
      include: [
        { model: Sprint, attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!improvement) {
      return res.status(404).json({ error: '改进措施未找到' });
    }

    res.json(improvement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新改进措施
router.put('/improvements/:actionId', auth, async (req, res) => {
  try {
    const { actionId } = req.params;
    const [affectedRows] = await ImprovementAction.update(req.body, {
      where: { id: actionId }
    });

    if (affectedRows > 0) {
      const updatedImprovement = await ImprovementAction.findByPk(actionId);
      res.json(updatedImprovement);
    } else {
      res.status(404).json({ error: '改进措施未找到' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除改进措施
router.delete('/improvements/:actionId', auth, async (req, res) => {
  try {
    const { actionId } = req.params;
    const affectedRows = await ImprovementAction.destroy({
      where: { id: actionId }
    });

    if (affectedRows > 0) {
      res.json({ message: '改进措施删除成功' });
    } else {
      res.status(404).json({ error: '改进措施未找到' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;