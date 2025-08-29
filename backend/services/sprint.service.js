import { Sprint, Task, ProjectMember } from '../db/models';
import { Op } from 'sequelize';

class SprintService {
  // 生成Sprint计划
  async generateSprintPlan(projectId, durationWeeks) {
    const members = await ProjectMember.findAll({
      where: { projectId },
      include: ['user']
    });

    const backlogTasks = await Task.findAll({
      where: { 
        projectId,
        sprintId: null,
        status: { [Op.not]: 'done' }
      }
    });

    // 计算团队容量（人天）
    const capacity = members.reduce((total, member) => {
      return total + (member.user.availability * durationWeeks * 5);
    }, 0);

    // 智能分配任务（按优先级和预估工时）
    const sortedTasks = backlogTasks.sort((a, b) => {
      const priorityOrder = { highest: 5, high: 4, medium: 3, low: 2, lowest: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority] || 
             (a.estimatedHours || 0) - (b.estimatedHours || 0);
    });

    // 分配任务直到容量耗尽
    const committedTasks = [];
    let remainingCapacity = capacity;
    
    for (const task of sortedTasks) {
      const taskEffort = task.estimatedHours || 8;
      if (remainingCapacity >= taskEffort) {
        committedTasks.push(task);
        remainingCapacity -= taskEffort;
      }
    }

    return {
      capacity,
      committedTasks,
      remainingTasks: backlogTasks.filter(t => !committedTasks.includes(t))
    };
  }

  // 创建新Sprint
  async createSprint(projectId, { name, startDate, endDate }) {
    const { committedTasks } = await this.generateSprintPlan(
      projectId, 
      this.getWeeksBetween(startDate, endDate)
    );

    const sprint = await Sprint.create({
      projectId,
      name,
      startDate,
      endDate,
      status: 'planning'
    });

    // 批量更新任务关联
    await Task.update(
      { sprintId: sprint.id },
      { where: { id: committedTasks.map(t => t.id) } }
    );

    return sprint;
  }

  getWeeksBetween(startDate, endDate) {
    return Math.ceil((endDate - startDate) / (7 * 24 * 60 * 60 * 1000));
  }
}

export default new SprintService();