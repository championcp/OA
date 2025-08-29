const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const velocityService = require('../services/velocity.service');

// 获取团队速度数据
router.get('/projects/:projectId/velocity', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { sprintCount = 5 } = req.query;
    
    const velocityData = await velocityService.calculateTeamVelocity(
      projectId, 
      parseInt(sprintCount)
    );
    
    res.json(velocityData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 预测迭代完成时间
router.get('/projects/:projectId/predict-completion', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { remainingPoints, confidenceLevel } = req.query;
    
    if (!remainingPoints) {
      return res.status(400).json({ error: '需要提供剩余故事点数' });
    }
    
    const prediction = await velocityService.predictCompletionTime(
      projectId,
      parseInt(remainingPoints),
      parseFloat(confidenceLevel) || 0.85
    );
    
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 容量预测
router.get('/projects/:projectId/predict-capacity', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { teamSize, sprintDuration } = req.query;
    
    if (!teamSize) {
      return res.status(400).json({ error: '需要提供团队规模' });
    }
    
    const capacityPrediction = await velocityService.predictCapacity(
      projectId,
      parseInt(teamSize),
      parseInt(sprintDuration) || 2
    );
    
    res.json(capacityPrediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 生成速度报告
router.get('/projects/:projectId/velocity-report', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { period } = req.query;
    
    const report = await velocityService.generateVelocityReport(projectId, period);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 检测速度异常
router.get('/projects/:projectId/velocity-anomalies', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { threshold } = req.query;
    
    const anomalies = await velocityService.detectVelocityAnomalies(
      projectId,
      parseFloat(threshold) || 2.0
    );
    
    res.json(anomalies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取速度趋势图表数据
router.get('/projects/:projectId/velocity-chart', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { sprintCount = 6 } = req.query;
    
    const velocityData = await velocityService.calculateTeamVelocity(
      projectId, 
      parseInt(sprintCount)
    );
    
    // 格式化图表数据
    const chartData = {
      labels: velocityData.velocities.map(sprint => sprint.sprintName),
      datasets: [
        {
          label: '完成故事点',
          data: velocityData.velocities.map(sprint => sprint.completedPoints),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2
        },
        {
          label: '平均速度',
          data: velocityData.velocities.map(() => velocityData.averageVelocity),
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          borderDash: [5, 5],
          pointStyle: false
        }
      ]
    };
    
    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取速度统计摘要
router.get('/projects/:projectId/velocity-summary', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const velocityData = await velocityService.calculateTeamVelocity(projectId, 8);
    
    const summary = {
      currentVelocity: velocityData.velocities.length > 0 ? 
        velocityData.velocities[velocityData.velocities.length - 1].completedPoints : 0,
      averageVelocity: velocityData.averageVelocity,
      trend: velocityData.trend,
      predictability: velocityData.predictability,
      totalSprintsAnalyzed: velocityData.velocities.length,
      totalPointsCompleted: velocityData.velocities.reduce((sum, sprint) => 
        sum + sprint.completedPoints, 0
      )
    };
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;