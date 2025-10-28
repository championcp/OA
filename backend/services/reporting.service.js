import { Project, Sprint, Task, TestCase, TestResult } from '../db/models/index.js';
import { Op } from 'sequelize';
import qualityMetrics from './qualityMetrics.service.js';

class ReportingService {
  // 预置报表模板
  templates = {
    velocity: {
      name: '团队速率报表',
      description: '展示团队在不同迭代中的完成速度',
      metrics: ['velocity', 'commitment', 'actual'],
      defaultPeriod: 'last_6_sprints'
    },
    burnDown: {
      name: '迭代燃尽图',
      description: '展示迭代中剩余工作的燃尽情况',
      metrics: ['remaining', 'ideal', 'actual'],
      defaultPeriod: 'current_sprint'
    },
    cumulativeFlow: {
      name: '累积流图',
      description: '展示工作项在不同状态间的流动',
      metrics: ['backlog', 'in_progress', 'done'],
      defaultPeriod: 'last_4_sprints'
    },
    qualityTrend: {
      name: '质量趋势报表',
      description: '展示项目质量指标的变化趋势',
      metrics: ['defects', 'coverage', 'pass_rate'],
      defaultPeriod: 'last_4_sprints'
    }
  };

  // 获取报表模板
  getReportTemplates() {
    return this.templates;
  }

  // 生成预置报表
  async generateStandardReport(projectId, reportType) {
    switch (reportType) {
      case 'velocity':
        return this.generateVelocityReport(projectId);
      case 'burn-down':
        return this.generateBurnDownReport(projectId);
      case 'cumulative-flow':
        return this.generateCumulativeFlowReport(projectId);
      case 'quality-trend':
        return qualityMetrics.getQualityTrend(projectId);
      default:
        throw new Error('Unsupported report type');
    }
  }

  // 生成自定义报表
  async generateCustomReport(projectId, config) {
    const { metrics, period, filters } = config;
    const data = {};
    
    // 收集请求的指标数据
    for (const metric of metrics) {
      switch (metric) {
        case 'velocity':
          data.velocity = await this.getVelocityData(projectId, period);
          break;
        case 'defects':
          data.defects = await this.getDefectData(projectId, period, filters);
          break;
        // 其他指标...
      }
    }

    return {
      config,
      data,
      generatedAt: new Date()
    };
  }

  // 生成速率报表
  async generateVelocityReport(projectId, period = 'last_6_sprints') {
    const sprints = await Sprint.findAll({
      where: { 
        projectId,
        status: 'completed'
      },
      order: [['endDate', 'DESC']],
      limit: 6
    });

    const velocityData = [];
    
    for (const sprint of sprints) {
      const tasks = await Task.findAll({
        where: { sprintId: sprint.id, status: 'done' }
      });

      velocityData.push({
        sprintId: sprint.id,
        sprintName: sprint.name,
        committed: sprint.originalGoal,
        completed: tasks.length,
        velocity: tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0)
      });
    }

    return {
      reportType: 'velocity',
      period,
      data: velocityData.reverse(), // 按时间顺序排列
      averageVelocity: this.calculateAverage(velocityData, 'velocity'),
      predictability: this.calculatePredictability(velocityData)
    };
  }

  // 其他报表生成方法...
}

const reportingService = new ReportingService();
export default reportingService;