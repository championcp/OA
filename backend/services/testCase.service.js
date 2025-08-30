const { TestCase, TestResult, Task, User } = require('../db/models');
const { Op } = require('sequelize');

class TestCaseService {
  // 创建测试用例
  async createTestCase(taskId, testCaseData) {
    return await TestCase.create({
      taskId,
      ...testCaseData
    });
  }

  // 获取任务的测试用例
  async getTaskTestCases(taskId, includeResults = false) {
    const include = [];
    
    if (includeResults) {
      include.push({
        model: TestResult,
        as: 'testResults',
        include: [{
          model: User,
          as: 'executor',
          attributes: ['id', 'name', 'email']
        }],
        order: [['executionDate', 'DESC']],
        limit: 5
      });
    }

    return await TestCase.findAll({
      where: { taskId },
      include,
      order: [['priority', 'DESC'], ['createdAt', 'ASC']]
    });
  }

  // 获取测试用例详情
  async getTestCaseDetail(testCaseId) {
    return await TestCase.findByPk(testCaseId, {
      include: [
        {
          model: Task,
          attributes: ['id', 'title', 'projectId']
        },
        {
          model: TestResult,
          as: 'testResults',
          include: [{
            model: User,
            as: 'executor',
            attributes: ['id', 'name', 'email']
          }],
          order: [['executionDate', 'DESC']]
        }
      ]
    });
  }

  // 更新测试用例
  async updateTestCase(testCaseId, updates) {
    const [affectedRows] = await TestCase.update(updates, {
      where: { id: testCaseId }
    });

    if (affectedRows > 0) {
      return await TestCase.findByPk(testCaseId);
    }
    return null;
  }

  // 删除测试用例
  async deleteTestCase(testCaseId) {
    return await TestCase.destroy({
      where: { id: testCaseId }
    });
  }

  // 记录测试结果
  async recordTestResult(testCaseId, resultData) {
    return await TestResult.create({
      testCaseId,
      ...resultData
    });
  }

  // 获取测试用例执行历史
  async getTestCaseHistory(testCaseId, limit = 10) {
    return await TestResult.findAll({
      where: { testCaseId },
      include: [{
        model: User,
        as: 'executor',
        attributes: ['id', 'name', 'email']
      }],
      order: [['executionDate', 'DESC']],
      limit
    });
  }

  // 获取项目测试覆盖率统计
  async getProjectTestCoverage(projectId) {
    const tasks = await Task.findAll({
      where: { projectId },
      include: [{
        model: TestCase,
        as: 'testCases',
        attributes: ['id']
      }],
      attributes: ['id', 'title', 'status']
    });

    const totalTasks = tasks.length;
    const tasksWithTests = tasks.filter(task => task.testCases.length > 0);
    const coveragePercentage = totalTasks > 0 ? 
      (tasksWithTests.length / totalTasks) * 100 : 0;

    return {
      totalTasks,
      tasksWithTests: tasksWithTests.length,
      coveragePercentage: Math.round(coveragePercentage * 100) / 100,
      detailedStats: this.calculateDetailedStats(tasks)
    };
  }

  calculateDetailedStats(tasks) {
    const stats = {
      byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
      byStatus: { draft: 0, ready: 0, obsolete: 0 },
      byType: {
        functional: 0, integration: 0, performance: 0, 
        security: 0, usability: 0
      },
      automation: { not_automated: 0, automated: 0, in_progress: 0 }
    };

    tasks.forEach(task => {
      task.testCases.forEach(testCase => {
        stats.byPriority[testCase.priority]++;
        stats.byStatus[testCase.status]++;
        stats.byType[testCase.type]++;
        stats.automation[testCase.automationStatus]++;
      });
    });

    return stats;
  }

  // 搜索测试用例
  async searchTestCases(projectId, searchCriteria) {
    const { query, priority, status, type, tags } = searchCriteria;
    
    const where = {
      '$task.projectId$': projectId
    };

    if (query) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } }
      ];
    }

    if (priority) where.priority = priority;
    if (status) where.status = status;
    if (type) where.type = type;
    if (tags && tags.length > 0) {
      where.tags = { [Op.overlap]: tags };
    }

    return await TestCase.findAll({
      where,
      include: [{
        model: Task,
        attributes: ['id', 'title'],
        where: { projectId }
      }],
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    });
  }

  // 批量更新测试用例状态
  async bulkUpdateTestCases(testCaseIds, updates) {
    const [affectedRows] = await TestCase.update(updates, {
      where: { id: { [Op.in]: testCaseIds } }
    });

    return affectedRows;
  }

  // 获取测试执行趋势
  async getTestExecutionTrend(projectId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const testResults = await TestResult.findAll({
      include: [{
        model: TestCase,
        include: [{
          model: Task,
          where: { projectId }
        }]
      }],
      where: {
        executionDate: {
          [Op.gte]: startDate
        }
      },
      order: [['executionDate', 'ASC']]
    });

    return this.analyzeExecutionTrend(testResults, days);
  }

  analyzeExecutionTrend(testResults, days) {
    const dailyStats = {};
    const now = new Date();
    
    // 初始化每日统计
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyStats[dateKey] = {
        total: 0,
        passed: 0,
        failed: 0,
        blocked: 0,
        skipped: 0
      };
    }

    // 填充统计数据
    testResults.forEach(result => {
      if (result.executionDate) {
        const dateKey = result.executionDate.toISOString().split('T')[0];
        if (dailyStats[dateKey]) {
          dailyStats[dateKey].total++;
          dailyStats[dateKey][result.status]++;
        }
      }
    });

    // 计算趋势指标
    const totalExecutions = testResults.length;
    const passedExecutions = testResults.filter(r => r.status === 'passed').length;
    const passRate = totalExecutions > 0 ? (passedExecutions / totalExecutions) * 100 : 0;

    return {
      dailyStats,
      summary: {
        totalExecutions,
        passedExecutions,
        passRate: Math.round(passRate * 100) / 100,
        daysAnalyzed: days
      },
      trend: this.calculateTrendMetrics(dailyStats)
    };
  }

  calculateTrendMetrics(dailyStats) {
    const dates = Object.keys(dailyStats).sort();
    if (dates.length < 2) return 'insufficient_data';

    const passRates = dates.map(date => {
      const day = dailyStats[date];
      return day.total > 0 ? (day.passed / day.total) * 100 : 0;
    });

    // 计算简单线性趋势
    let improvementCount = 0;
    for (let i = 1; i < passRates.length; i++) {
      if (passRates[i] > passRates[i - 1]) {
        improvementCount++;
      }
    }

    const improvementRatio = improvementCount / (passRates.length - 1);
    return improvementRatio > 0.6 ? 'improving' : improvementRatio < 0.4 ? 'declining' : 'stable';
  }
}

module.exports = new TestCaseService();