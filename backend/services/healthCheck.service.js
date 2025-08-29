import { Sprint, Task, ProjectMember } from '../db/models';
import { Op } from 'sequelize';

class HealthCheckService {
  // 执行团队健康度检查
  async performHealthCheck(projectId, sprintId = null) {
    const [velocityHealth, workloadHealth, moraleHealth] = await Promise.all([
      this.checkVelocityHealth(projectId),
      this.checkWorkloadHealth(projectId, sprintId),
      this.checkTeamMorale(projectId)
    ]);

    const overallScore = Math.round((
      velocityHealth.score + workloadHealth.score + moraleHealth.score
    ) / 3);

    return {
      overallScore,
      metrics: { velocityHealth, workloadHealth, moraleHealth },
      recommendations: this.generateRecommendations(overallScore, {
        velocityHealth, workloadHealth, moraleHealth
      })
    };
  }

  // 检查速度健康度
  async checkVelocityHealth(projectId) {
    const velocityService = await import('./velocity.service.js');
    const history = await velocityService.default.calculateHistoricalVelocity(projectId);
    
    let score = 70; // 基础分
    
    if (history.confidence === 'high') score += 20;
    else if (history.confidence === 'medium') score += 10;
    
    if (history.trend === 'improving') score += 10;
    else if (history.trend === 'declining') score -= 15;

    return {
      score: Math.max(0, Math.min(100, score)),
      trend: history.trend,
      confidence: history.confidence,
      averageVelocity: history.averageVelocity
    };
  }

  // 检查工作负载健康度
  async checkWorkloadHealth(projectId, sprintId) {
    const activeSprint = sprintId ? await Sprint.findByPk(sprintId) : 
      await Sprint.findOne({
        where: { projectId, status: 'active' }
      });

    if (!activeSprint) {
      return { score: 50, message: '无活跃Sprint' };
    }

    const tasks = await Task.findAll({
      where: { sprintId: activeSprint.id }
    });

    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    let score = completionRate;
    if (completionRate > 80) score = 85;
    else if (completionRate > 60) score = 70;
    else score = 50;

    return {
      score: Math.round(score),
      totalTasks: tasks.length,
      completedTasks,
      completionRate: Math.round(completionRate)
    };
  }

  // 检查团队士气（基于任务分配和完成情况）
  async checkTeamMorale(projectId) {
    const members = await ProjectMember.findAll({
      where: { projectId },
      include: ['user']
    });

    const memberStats = await Promise.all(
      members.map(async member => {
        const tasks = await Task.findAll({
          where: { assigneeId: member.userId }
        });

        const completed = tasks.filter(t => t.status === 'done').length;
        const completionRate = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;

        return {
          memberId: member.userId,
          totalTasks: tasks.length,
          completedTasks: completed,
          completionRate: Math.round(completionRate)
        };
      })
    );

    const avgCompletion = memberStats.reduce((sum, stat) => sum + stat.completionRate, 0) / memberStats.length;
    const score = Math.min(100, Math.max(0, avgCompletion));

    return {
      score: Math.round(score),
      memberStats,
      averageCompletion: Math.round(avgCompletion)
    };
  }

  // 生成改进建议
  generateRecommendations(overallScore, metrics) {
    const recommendations = [];

    if (overallScore < 60) {
      recommendations.push('团队健康度较低，建议召开回顾会议分析问题');
    }

    if (metrics.velocityHealth.score < 60) {
      recommendations.push('速度稳定性较差，建议优化任务估算和分配');
    }

    if (metrics.workloadHealth.score < 60) {
      recommendations.push('工作负载不平衡，建议重新分配任务');
    }

    if (metrics.moraleHealth.score < 60) {
      recommendations.push('团队士气较低，建议关注成员工作负荷和满意度');
    }

    return recommendations.length > 0 ? recommendations : ['团队运行良好，继续保持！'];
  }
}

export default new HealthCheckService();