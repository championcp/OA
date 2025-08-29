import { ImprovementAction, Sprint } from '../db/models';

class ImprovementService {
  // 创建改进措施
  async createImprovementAction(sprintId, data) {
    return await ImprovementAction.create({
      sprintId,
      ...data,
      status: 'pending'
    });
  }

  // 获取Sprint的改进措施
  async getSprintImprovements(sprintId) {
    return await ImprovementAction.findAll({
      where: { sprintId },
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    });
  }

  // 更新改进措施状态
  async updateImprovementStatus(actionId, status, notes = null) {
    const [affectedRows] = await ImprovementAction.update(
      { status, ...(notes && { resolutionNotes: notes }) },
      { where: { id: actionId } }
    );

    return affectedRows > 0;
  }

  // 跟踪改进措施实施情况
  async trackImprovementProgress(projectId) {
    const sprints = await Sprint.findAll({
      where: { projectId, status: 'completed' },
      include: [{
        model: ImprovementAction,
        as: 'improvementActions'
      }]
    });

    const stats = {
      totalActions: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      completionRate: 0
    };

    sprints.forEach(sprint => {
      sprint.improvementActions.forEach(action => {
        stats.totalActions++;
        if (action.status === 'completed') stats.completed++;
        else if (action.status === 'in_progress') stats.inProgress++;
        else stats.pending++;
      });
    });

    if (stats.totalActions > 0) {
      stats.completionRate = Math.round(
        (stats.completed / stats.totalActions) * 100
      );
    }

    return stats;
  }

  // 生成改进报告
  async generateImprovementReport(projectId, startDate, endDate) {
    const improvements = await ImprovementAction.findAll({
      include: [{
        model: Sprint,
        where: { projectId },
        attributes: []
      }],
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['createdAt', 'DESC']]
    });

    const effectiveness = await this.calculateEffectiveness(projectId, improvements);

    return {
      period: { startDate, endDate },
      totalActions: improvements.length,
      byStatus: this.groupByStatus(improvements),
      byPriority: this.groupByPriority(improvements),
      effectiveness,
      recommendations: this.generateReportRecommendations(improvements, effectiveness)
    };
  }

  // 计算改进措施效果
  async calculateEffectiveness(projectId, improvements) {
    // 这里可以集成团队健康度检查来评估改进效果
    const healthCheckService = await import('./healthCheck.service.js');
    const currentHealth = await healthCheckService.default.performHealthCheck(projectId);

    const completedImprovements = improvements.filter(a => a.status === 'completed');
    
    return {
      currentHealthScore: currentHealth.overallScore,
      completedCount: completedImprovements.length,
      estimatedImpact: this.estimateImpact(completedImprovements)
    };
  }

  groupByStatus(improvements) {
    return improvements.reduce((acc, action) => {
      acc[action.status] = (acc[action.status] || 0) + 1;
      return acc;
    }, {});
  }

  groupByPriority(improvements) {
    return improvements.reduce((acc, action) => {
      acc[action.priority] = (acc[action.priority] || 0) + 1;
      return acc;
    }, {});
  }

  estimateImpact(improvements) {
    // 简单的效果评估逻辑
    const highImpactCount = improvements.filter(a => 
      a.priority === 'high' || a.priority === 'critical'
    ).length;

    return highImpactCount > 0 ? 'high' : 'medium';
  }

  generateReportRecommendations(improvements, effectiveness) {
    const recommendations = [];

    if (effectiveness.completedCount === 0) {
      recommendations.push('暂无完成的改进措施，建议加强执行力度');
    }

    if (effectiveness.estimatedImpact === 'medium') {
      recommendations.push('改进措施影响度中等，建议关注高优先级问题的解决');
    }

    const pendingCount = improvements.filter(a => a.status === 'pending').length;
    if (pendingCount > 3) {
      recommendations.push(`有${pendingCount}项改进措施待处理，建议优先处理高优先级项目`);
    }

    return recommendations.length > 0 ? recommendations : ['改进措施执行良好，继续保持！'];
  }
}

export default new ImprovementService();