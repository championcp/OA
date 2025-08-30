const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const schedulerService = require('../services/scheduler.service');

// 创建定时报表
router.post('/', auth, async (req, res) => {
  try {
    const scheduledReport = await schedulerService.addScheduledReport(
      req.user.id,
      req.body
    );
    res.status(201).json(scheduledReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取用户的定时报表
router.get('/', auth, async (req, res) => {
  try {
    const scheduledReports = await schedulerService.getUserScheduledReports(
      req.user.id
    );
    res.json(scheduledReports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新定时报表
router.put('/:id', auth, async (req, res) => {
  try {
    const scheduledReport = await schedulerService.updateScheduledReport(
      req.params.id,
      req.body
    );
    
    if (scheduledReport) {
      res.json(scheduledReport);
    } else {
      res.status(404).json({ error: '定时任务未找到' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除定时报表
router.delete('/:id', auth, async (req, res) => {
  try {
    const success = await schedulerService.deleteScheduledReport(
      req.params.id
    );
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取项目的定时报表
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const scheduledReports = await schedulerService.getProjectScheduledReports(
      req.params.projectId
    );
    res.json(scheduledReports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;