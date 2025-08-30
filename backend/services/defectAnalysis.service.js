const { DefectAnalysis, Task, User, TestResult } = require('../db/models');
const { Op } = require('sequelize');

class DefectAnalysisService {
  // 创建缺陷分析
  async createDefectAnalysis(taskId, analysisData) {
    return await DefectAnalysis.create({
      taskId,
      ...analysisData
    });
  }

  // 获取缺陷分析详情
  async getDefectAnalysis(taskId) {
    return await DefectAnalysis.findOne({
      where: { taskId },
      include: [
        {
          model: User,
          as: 'analyst',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Task,
          attributes: ['id', 'title', 'description', 'priority', 'status']
        }
      ]
    });
  }

  // 更新缺陷分析
  async updateDefectAnalysis(analysisId, updates) {
    const [affectedRows] = await DefectAnalysis.update(updates, {
      where: { id: analysisId }
    });

    if (affectedRows > 0) {
      return await DefectAnalysis.findByPk(analysisId);
    }
    return null;
  }

  // 获取项目缺陷分析统计
  async getProjectDefectAnalysis(projectId, period = 'last_30_days') {
    const dateFilter = this.getDateFilter(period);
    
    const defects = await Task.findAll({
      where: {
        projectId,
        type: 'bug',
        createdAt: dateFilter
      },
      include: [
        {
          model: DefectAnalysis,
          as: 'defectAnalysis'
        },
        {
          model: TestResult,
          as: 'testResults',
          where: {
            status: 'failed',
            executionDate: dateFilter
          },
          required: false
        }
      ]
    });

    return this.analyzeDefectPatterns(defects);
  }

  getDateFilter(period) {
    const now = new Date();
    const filter = {};

    switch (period) {
      case 'last_7_days':
        filter[Op.gte] = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'last_30_days':
        filter[Op.gte] = new Date(now.setDate(now.getDate() - 30));
        break;
      case 'last_90_days':
        filter[Op.gte] = new Date(now.setDate(now.getDate() - 90));
        break;
      default:
        filter[Op.gte] = new Date(now.setDate(now.getDate() - 30));
    }

    return filter;
  }

  analyzeDefectPatterns(defects) {
    const analysis = {
      totalDefects: defects.length,
      analyzedDefects: defects.filter(d => d.defectAnalysis).length,
      analysisRate: 0,
      rootCauseDistribution: {},
      categoryDistribution: {},
      impactLevelDistribution: {},
      recurrenceDistribution: {},
      topPatterns: [],
      recommendations: []
    };

    // 计算分析率
    if (analysis.totalDefects > 0) {
      analysis.analysisRate = (analysis.analyzedDefects / analysis.totalDefects) * 100;
    }

    // 分析根本原因分布
    defects.forEach(defect => {
      if (defect.defectAnalysis) {
        const { rootCause, causeCategory, impactLevel, recurrenceProbability } = defect.defectAnalysis;

        // 根本原因分布
        analysis.rootCauseDistribution[rootCause] = (analysis.rootCauseDistribution[rootCause] || 0) + 1;

        // 原因类别分布
        analysis.categoryDistribution[causeCategory] = (analysis.categoryDistribution[causeCategory] || 0) + 1;

        // 影响级别分布
        analysis.impactLevelDistribution[impactLevel] = (analysis.impactLevelDistribution[impactLevel] || 0) + 1;

        // 复发概率分布
        analysis.recurrenceDistribution[recurrenceProbability] = (analysis.recurrenceDistribution[recurrenceProbability] || 0) + 1;
      }
    });

    // 识别主要模式
    analysis.topPatterns = this.identifyTopPatterns(analysis);
    
    // 生成改进建议
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  identifyTopPatterns(analysis) {
    const patterns = [];

    // 识别最常见的根本原因
    const topRootCauses = Object.entries(analysis.rootCauseDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([cause, count]) => ({
        type: 'rootCause',
        value: cause,
        count,
        percentage: Math.round((count / analysis.analyzedDefects) * 100)
      }));

    patterns.push(...topRootCauses);

    // 识别最常见的原因类别
    const topCategories = Object.entries(analysis.categoryDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([category, count]) => ({
        type: 'category',
        value: category,
        count,
        percentage: Math.round((count / analysis.analyzedDefects) * 100)
      }));

    patterns.push(...topCategories);

    return patterns;
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    // 分析率建议
    if (analysis.analysisRate < 50) {
      recommendations.push({
        priority: 'high',
        category: 'process',
        message: `缺陷分析率较低（${Math.round(analysis.analysisRate)}%），建议建立强制性的缺陷分析流程`
      });
    }

    // 根据根本原因给出建议
    if (analysis.rootCauseDistribution.implementation > analysis.analyzedDefects * 0.3) {
      recommendations.push({
        priority: 'medium',
        category: 'technical',
        message: '实现相关的缺陷占比较高，建议加强代码审查和单元测试覆盖'
      });
    }

    if (analysis.rootCauseDistribution.requirements > analysis.analyzedDefects * 0.2) {
      recommendations.push({
        priority: 'high',
        category: 'process',
        message: '需求相关的缺陷较多，建议改进需求分析和评审流程'
      });
    }

    if (analysis.rootCauseDistribution.communication > analysis.analyzedDefects * 0.15) {
      recommendations.push({
        priority: 'medium',
        category: 'team',
        message: '沟通问题导致的缺陷较多，建议改善团队沟通机制和文档记录'
      });
    }

    // 根据影响级别给出建议
    if (analysis.impactLevelDistribution.critical > 0) {
      recommendations.push({
        priority: 'high',
        category: 'quality',
        message: '存在关键影响的缺陷，建议加强关键路径的测试和质量控制'
      });
    }

    // 根据复发概率给出建议
    if (analysis.recurrenceDistribution.high > analysis.analyzedDefects * 0.1) {
      recommendations.push({
        priority: 'medium',
        category: 'process',
        message: '高复发概率的缺陷较多，建议建立缺陷预防机制和根本原因分析'
      });
    }

    return recommendations;
  }

  // 获取缺陷趋势分析
  async getDefectTrendAnalysis(projectId, period = 'last_90_days') {
    const dateFilter = this.getDateFilter(period);
    
    const defects = await Task.findAll({
      where: {
        projectId,
        type: 'bug',
        createdAt: dateFilter
      },
      include: [{
        model: DefectAnalysis,
        as: 'defectAnalysis'
      }],
      order: [['createdAt', 'ASC']]
    });

    return this.calculateTrendMetrics(defects, period);
  }

  calculateTrendMetrics(defects, period) {
    const timeUnits = this.getTimeUnits(period);
    const trendData = {};

    // 初始化时间单位数据
    timeUnits.forEach(unit => {
      trendData[unit] = {
        totalDefects: 0,
        analyzedDefects: 0,
        criticalDefects: 0,
        resolvedDefects: 0,
        avgResolutionTime: 0
      };
    });

    // 填充统计数据
    defects.forEach(defect => {
      const timeUnit = this.getTimeUnitKey(defect.createdAt, period);
      if (trendData[timeUnit]) {
        trendData[timeUnit].totalDefects++;

        if (defect.defectAnalysis) {
          trendData[timeUnit].analyzedDefects++;
        }

        if (defect.priority === 'critical' || defect.priority === 'high') {
          trendData[timeUnit].criticalDefects++;
        }

        if (defect.status === 'done' || defect.status === 'closed') {
          trendData[timeUnit].resolvedDefects++;
        }
      }
    });

    // 计算趋势指标
    const totals = Object.values(trendData);
    const totalDefects = totals.reduce((sum, unit) => sum + unit.totalDefects, 0);
    const analyzedDefects = totals.reduce((sum, unit) => sum + unit.analyzedDefects, 0);

    return {
      period,
      timeUnits: Object.keys(trendData),
      trendData,
      summary: {
        totalDefects,
        analyzedDefects,
        analysisRate: totalDefects > 0 ? (analyzedDefects / totalDefects) * 100 : 0,
        criticalRate: totalDefects > 0 ? (totals.reduce((sum, unit) => sum + unit.criticalDefects, 0) / totalDefects) * 100 : 0
      },
      trend: this.analyzeDefectTrend(trendData)
    };
  }

  getTimeUnits(period) {
    const units = [];
    const now = new Date();
    
    switch (period) {
      case 'last_7_days':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          units.push(date.toISOString().split('T')[0]);
        }
        break;
      case 'last_30_days':
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          units.push(date.toISOString().split('T')[0]);
        }
        break;
      case 'last_90_days':
        // 按周分组
        for (let i = 12; i >= 0; i--) {
          units.push(`Week ${i + 1}`);
        }
        break;
      default:
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          units.push(date.toISOString().split('T')[0]);
        }
    }

    return units;
  }

  getTimeUnitKey(date, period) {
    if (period === 'last_90_days') {
      const weekNumber = Math.floor((new Date() - date) / (7 * 24 * 60 * 60 * 1000));
      return `Week ${13 - weekNumber}`;
    }
    return date.toISOString().split('T')[0];
  }

  analyzeDefectTrend(trendData) {
    const units = Object.keys(trendData);
    if (units.length < 2) return 'insufficient_data';

    const totalDefects = units.map(unit => trendData[unit].totalDefects);
    const analyzedRates = units.map(unit => 
      trendData[unit].totalDefects > 0 ? 
      (trendData[unit].analyzedDefects / trendData[unit].totalDefects) * 100 : 0
    );

    // 分析缺陷数量趋势
    const defectTrend = this.calculateSimpleTrend(totalDefects);
    
    // 分析分析率趋势
    const analysisTrend = this.calculateSimpleTrend(analyzedRates);

    return {
      defectTrend,
      analysisTrend,
      overall: defectTrend === 'decreasing' && analysisTrend === 'increasing' ? 
        'improving' : 'mixed'
    };
  }

  calculateSimpleTrend(values) {
    let increasing = 0;
    let decreasing = 0;

    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[i - 1]) increasing++;
      else if (values[i] < values[i - 1]) decreasing++;
    }

    if (increasing > decreasing * 1.5) return 'increasing';
    if (decreasing > increasing * 1.5) return 'decreasing';
    return 'stable';
  }

  // 获取缺陷预防建议
  async getPreventionRecommendations(projectId) {
    const analysis = await this.getProjectDefectAnalysis(projectId, 'last_90_days');
    return analysis.recommendations;
  }
}

module.exports = new DefectAnalysisService();