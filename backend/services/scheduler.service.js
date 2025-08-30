const { ScheduledReport } = require('../db/models');
const reportingService = require('./reporting.service');
const emailService = require('./email.service');
const cron = require('node-cron');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
    this.initializeScheduler();
  }

  // 初始化调度器
  async initializeScheduler() {
    const schedules = await ScheduledReport.findAll({
      where: { isActive: true }
    });
    
    schedules.forEach(schedule => {
      this.scheduleReport(schedule);
    });
  }

  // 添加定时任务
  async addScheduledReport(userId, reportData) {
    const scheduledReport = await ScheduledReport.create({
      userId,
      ...reportData
    });
    
    this.scheduleReport(scheduledReport);
    return scheduledReport;
  }

  // 更新定时任务
  async updateScheduledReport(id, updates) {
    const [affectedRows] = await ScheduledReport.update(updates, {
      where: { id }
    });
    
    if (affectedRows > 0) {
      const scheduledReport = await ScheduledReport.findByPk(id);
      this.rescheduleReport(scheduledReport);
      return scheduledReport;
    }
    
    return null;
  }

  // 删除定时任务
  async deleteScheduledReport(id) {
    const scheduledReport = await ScheduledReport.findByPk(id);
    if (scheduledReport) {
      this.cancelSchedule(scheduledReport);
      await scheduledReport.destroy();
      return true;
    }
    return false;
  }

  // 调度报表生成
  scheduleReport(scheduledReport) {
    const job = cron.schedule(scheduledReport.schedule, async () => {
      try {
        const report = await reportingService.generateStandardReport(
          scheduledReport.projectId,
          scheduledReport.reportType,
          scheduledReport.config
        );
        
        // 更新最后运行时间
        await scheduledReport.update({
          lastRunAt: new Date()
        });
        
        // 发送邮件通知
        if (scheduledReport.recipients.length > 0) {
          await emailService.sendReportEmail({
            to: scheduledReport.recipients,
            subject: `定时报表: ${scheduledReport.reportType}`,
            reportData: report
          });
        }
      } catch (error) {
        console.error('定时报表生成失败:', error);
      }
    });
    
    this.jobs.set(scheduledReport.id, job);
  }

  // 重新调度任务
  rescheduleReport(scheduledReport) {
    this.cancelSchedule(scheduledReport);
    if (scheduledReport.isActive) {
      this.scheduleReport(scheduledReport);
    }
  }

  // 取消调度
  cancelSchedule(scheduledReport) {
    const job = this.jobs.get(scheduledReport.id);
    if (job) {
      job.stop();
      this.jobs.delete(scheduledReport.id);
    }
  }

  // 获取用户的定时任务
  async getUserScheduledReports(userId) {
    return await ScheduledReport.findAll({
      where: { userId },
      order: [['nextRunAt', 'ASC']]
    });
  }

  // 获取项目的定时任务
  async getProjectScheduledReports(projectId) {
    return await ScheduledReport.findAll({
      where: { projectId },
      order: [['nextRunAt', 'ASC']]
    });
  }
}

module.exports = new SchedulerService();