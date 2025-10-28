import { Task, TestCase, TestResult, Project } from '../db/models/index.js';
import { Op } from 'sequelize';

class QualityMetricsService {
  // 计算代码覆盖率
  async calculateCodeCoverage(projectId) {
    const tasks = await Task.findAll({
      where: { projectId },
      include: [{
        model: TestCase,
        as: 'testCases'
      }]
    });

    const stats = {
      totalTasks: tasks.length,
      coveredTasks: tasks.filter(t => t.testCases.length > 0).length,
      coverageByType: {
        unit: await this.calculateCoverageByType(projectId, 'unit'),
        integration: await this.calculateCoverageByType(projectId, 'integration'),
        e2e: await this.calculateCoverageByType(projectId, 'e2e')
      }
    };

    stats.overallCoverage = stats.totalTasks > 0 ?
      (stats.coveredTasks / stats.totalTasks) * 100 : 0;

    return stats;
  }

  async calculateCoverageByType(projectId, testType) {
    const tasks = await Task.findAll({
      where: { projectId },
      include: [{
        model: TestCase,
        as: 'testCases',
        where: { type: testType }
      }]
    });

    return {
      totalTasks: tasks.length,
      coveredTasks: tasks.filter(t => t.testCases.length > 0).length
    };
  }

  // 计算缺陷密度
  async calculateDefectDensity(projectId) {
    const project = await Project.findByPk(projectId, {
      include: [{
        model: Task,
        where: { type: 'bug' }
      }]
    });

    const loc = await this.getProjectLOC(projectId);
    if (!loc || loc === 0) return null;

    return {
      defectCount: project.Tasks.length,
      loc,
      density: project.Tasks.length / (loc / 1000),
      measurement: 'defects/kloc'
    };
  }

  // 获取质量趋势
  async getQualityTrend(projectId, period = 'last_4_sprints') {
    const sprints = await this.getSprintsForPeriod(projectId, period);
    const trendData = [];

    for (const sprint of sprints) {
      const metrics = await this.calculateSprintMetrics(sprint);
      trendData.push({
        sprintId: sprint.id,
        sprintName: sprint.name,
        ...metrics
      });
    }

    return {
      period,
      trendData,
      summary: this.analyzeTrend(trendData)
    };
  }

  async calculateSprintMetrics(sprint) {
    const tasks = await Task.findAll({
      where: { sprintId: sprint.id },
      include: [
        { model: TestCase, as: 'testCases' },
        { model: TestResult, as: 'testResults' }
      ]
    });

    const bugs = tasks.filter(t => t.type === 'bug');
    const testCases = tasks.flatMap(t => t.testCases);
    const testResults = tasks.flatMap(t => t.testResults);

    return {
      bugCount: bugs.length,
      testCaseCount: testCases.length,
      testExecutionCount: testResults.length,
      passRate: testResults.length > 0 ?
        (testResults.filter(r => r.status === 'passed').length / testResults.length) * 100 : 0,
      defectResolutionRate: bugs.length > 0 ?
        (bugs.filter(b => b.status === 'done').length / bugs.length) * 100 : 0
    };
  }

  // 其他辅助方法...
}

const qualityMetricsService = new QualityMetricsService();
export default qualityMetricsService;