const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const qualityMetrics = require('../services/qualityMetrics.service');
const reporting = require('../services/reporting.service');

// 获取代码覆盖率
router.get('/projects/:projectId/coverage', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const coverage = await qualityMetrics.calculateCodeCoverage(projectId);
    res.json(coverage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取缺陷密度
router.get('/projects/:projectId/defect-density', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const density = await qualityMetrics.calculateDefectDensity(projectId);
    res.json(density || { message: 'LOC数据不可用，无法计算缺陷密度' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取质量趋势
router.get('/projects/:projectId/quality-trend', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { period } = req.query;
    const trend = await qualityMetrics.getQualityTrend(projectId, period);
    res.json(trend);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 生成标准报表
router.get('/projects/:projectId/reports/standard', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { type } = req.query;
    
    if (!type) {
      return res.status(400).json({ error: '需要提供报表类型' });
    }

    const report = await reporting.generateStandardReport(projectId, type);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 生成自定义报表
router.post('/projects/:projectId/reports/custom', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const report = await reporting.generateCustomReport(projectId, req.body);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取报表模板
router.get('/projects/:projectId/report-templates', auth, async (req, res) => {
  try {
    const templates = reporting.getReportTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;