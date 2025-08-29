const { Sprint, Task } = require('../db/models');
const { Op } = require('sequelize');

class VelocityService {
  // 计算团队速度
  async calculateTeamVelocity(projectId, sprintCount = 5) {
    const completedSprints = await Sprint.findAll({
      where: { 
        projectId, 
        status: 'completed' 
      },
      include: [{
        model: Task,
        as: 'tasks',
        attributes: ['storyPoints', 'status']
      }],
      order: [['endDate', 'DESC']],
      limit: sprintCount
    });

    const velocityData = completedSprints.map(sprint => {
      const completedTasks = sprint.tasks.filter(task => 
        task.status === 'done' || task.status === 'completed'
      );
      
      const completedPoints = completedTasks.reduce((sum, task) => 
        sum + (task.storyPoints || 0), 0
      );

      return {
        sprintId: sprint.id,
        sprintName: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        completedPoints,
        totalTasks: sprint.tasks.length,
        completedTasks: completedTasks.length,
        completionRate: sprint.tasks.length > 0 ? 
          (completedTasks.length / sprint.tasks.length) * 100 : 0
      };
    }).reverse(); // 按时间顺序排列

    return {
      velocities: velocityData,
      averageVelocity: this.calculateAverageVelocity(velocityData),
      trend: this.analyzeVelocityTrend(velocityData),
      predictability: this.calculatePredictability(velocityData)
    };
  }

  // 计算平均速度
  calculateAverageVelocity(velocityData) {
    if (velocityData.length === 0) return 0;
    
    const totalPoints = velocityData.reduce((sum, sprint) => 
      sum + sprint.completedPoints, 0
    );
    
    return Math.round(totalPoints / velocityData.length);
  }

  // 分析速度趋势
  analyzeVelocityTrend(velocityData) {
    if (velocityData.length < 2) return 'insufficient_data';

    const velocities = velocityData.map(s => s.completedPoints);
    const changes = [];
    
    for (let i = 1; i < velocities.length; i++) {
      const change = velocities[i] - velocities[i - 1];
      changes.push(change);
    }

    const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
    
    if (Math.abs(avgChange) < 2) return 'stable';
    if (avgChange > 0) return 'increasing';
    return 'decreasing';
  }

  // 计算可预测性
  calculatePredictability(velocityData) {
    if (velocityData.length < 3) return 'low';

    const velocities = velocityData.map(s => s.completedPoints);
    const avgVelocity = this.calculateAverageVelocity(velocityData);
    
    const deviations = velocities.map(velocity => 
      Math.abs(velocity - avgVelocity)
    );
    
    const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;
    const coefficientOfVariation = (avgDeviation / avgVelocity) * 100;

    if (coefficientOfVariation < 15) return 'high';
    if (coefficientOfVariation < 30) return 'medium';
    return 'low';
  }

  // 预测未来迭代完成时间
  async predictCompletionTime(projectId, remainingPoints, confidenceLevel = 0.85) {
    const velocityData = await this.calculateTeamVelocity(projectId);
    
    if (velocityData.velocities.length === 0) {
      return {
        estimatedSprints: null,
        confidence: 'low',
        message: '没有足够的历史数据来进行预测'
      };
    }

    const { averageVelocity, predictability } = velocityData;
    
    // 根据可预测性调整估计
    let adjustedVelocity = averageVelocity;
    let buffer = 0;

    switch (predictability) {
      case 'low':
        adjustedVelocity = averageVelocity * 0.7; // 保守估计
        buffer = 2;
        break;
      case 'medium':
        adjustedVelocity = averageVelocity * 0.85;
        buffer = 1;
        break;
      case 'high':
        adjustedVelocity = averageVelocity;
        buffer = 0.5;
        break;
    }

    const estimatedSprints = Math.ceil(remainingPoints / adjustedVelocity);
    const estimatedWithBuffer = Math.ceil(estimatedSprints + buffer);

    return {
      estimatedSprints: estimatedWithBuffer,
      confidence: predictability,
      averageVelocity: Math.round(averageVelocity),
      adjustedVelocity: Math.round(adjustedVelocity),
      remainingPoints,
      bufferApplied: buffer,
      predictability
    };
  }

  // 容量预测与平衡
  async predictCapacity(projectId, teamSize, sprintDurationWeeks = 2) {
    const velocityData = await this.calculateTeamVelocity(projectId);
    
    if (velocityData.velocities.length === 0) {
      return {
        estimatedCapacity: teamSize * 5 * sprintDurationWeeks, // 默认估算
        confidence: 'low',
        message: '使用默认估算（每人每天5点*天数）'
      };
    }

    const { averageVelocity, predictability } = velocityData;
    const velocityPerPerson = averageVelocity / teamSize;
    
    // 根据团队成熟度和可预测性调整
    let capacityMultiplier = 1.0;
    
    switch (predictability) {
      case 'high':
        capacityMultiplier = 1.1;
        break;
      case 'medium':
        capacityMultiplier = 1.0;
        break;
      case 'low':
        capacityMultiplier = 0.8;
        break;
    }

    const estimatedCapacity = Math.round(
      teamSize * velocityPerPerson * capacityMultiplier
    );

    return {
      estimatedCapacity,
      confidence: predictability,
      averageVelocity,
      velocityPerPerson: Math.round(velocityPerPerson * 10) / 10,
      teamSize,
      capacityMultiplier,
      recommendation: this.generateCapacityRecommendation(estimatedCapacity, teamSize, predictability)
    };
  }

  generateCapacityRecommendation(capacity, teamSize, predictability) {
    const baseRecommendation = `建议下个迭代规划 ${capacity} 故事点`;
    
    switch (predictability) {
      case 'high':
        return `${baseRecommendation}。团队速度稳定，可以按此容量规划。`;
      case 'medium':
        return `${baseRecommendation}。团队速度有一定波动，建议保留10-15%的缓冲。`;
      case 'low':
        return `${baseRecommendation}。团队速度波动较大，建议保留20-25%的缓冲，并关注过程改进。`;
      default:
        return baseRecommendation;
    }
  }

  // 生成速度报告
  async generateVelocityReport(projectId, period = 'last_6_sprints') {
    let sprintCount;
    
    switch (period) {
      case 'last_3_sprints':
        sprintCount = 3;
        break;
      case 'last_6_sprints':
        sprintCount = 6;
        break;
      case 'last_12_sprints':
        sprintCount = 12;
        break;
      default:
        sprintCount = 6;
    }

    const velocityData = await this.calculateTeamVelocity(projectId, sprintCount);
    
    return {
      period,
      sprintCount: velocityData.velocities.length,
      summary: {
        averageVelocity: velocityData.averageVelocity,
        trend: velocityData.trend,
        predictability: velocityData.predictability,
        totalCompletedPoints: velocityData.velocities.reduce((sum, sprint) => 
          sum + sprint.completedPoints, 0
        ),
        totalCompletedTasks: velocityData.velocities.reduce((sum, sprint) => 
          sum + sprint.completedTasks, 0
        )
      },
      detailedData: velocityData.velocities,
      recommendations: this.generateReportRecommendations(velocityData)
    };
  }

  generateReportRecommendations(velocityData) {
    const recommendations = [];
    const { trend, predictability, averageVelocity } = velocityData;

    if (predictability === 'low') {
      recommendations.push('团队速度波动较大，建议加强故事点估算的一致性和任务拆分的规范性');
    }

    if (trend === 'decreasing') {
      recommendations.push('团队速度呈下降趋势，建议回顾近期迭代，识别并解决影响效率的问题');
    } else if (trend === 'increasing') {
      recommendations.push('团队速度呈上升趋势，继续保持！可以考虑适当增加迭代容量');
    }

    if (averageVelocity < 10 && velocityData.velocities.length >= 3) {
      recommendations.push('团队速度较低，建议评估故事点估算是否合理，或是否存在流程瓶颈');
    }

    return recommendations.length > 0 ? recommendations : ['团队速度表现稳定，继续保持当前工作节奏'];
  }

  // 检测异常速度
  async detectVelocityAnomalies(projectId, threshold = 2.0) {
    const velocityData = await this.calculateTeamVelocity(projectId, 10);
    
    if (velocityData.velocities.length < 3) {
      return { anomalies: [], message: '需要更多数据来进行异常检测' };
    }

    const velocities = velocityData.velocities.map(s => s.completedPoints);
    const average = this.calculateAverageVelocity(velocityData.velocities);
    const stdDev = this.calculateStandardDeviation(velocities, average);

    const anomalies = velocityData.velocities.filter((sprint, index) => {
      const zScore = Math.abs((sprint.completedPoints - average) / stdDev);
      return zScore > threshold;
    });

    return {
      anomalies: anomalies.map(anomaly => ({
        ...anomaly,
        deviation: Math.round(((anomaly.completedPoints - average) / average) * 100)
      })),
      averageVelocity: average,
      standardDeviation: stdDev,
      threshold
    };
  }

  calculateStandardDeviation(values, mean) {
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    return Math.sqrt(variance);
  }
}

module.exports = new VelocityService();