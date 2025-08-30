const User = require('./user.model');
const Project = require('./project.model');
const Task = require('./task.model');
const Sprint = require('./sprint.model');
const TaskDependency = require('./taskDependency.model');
const ImprovementAction = require('./improvementAction.model');
const TestCase = require('./testCase.model');
const TestResult = require('./testResult.model');
const DefectAnalysis = require('./defectAnalysis.model');
const ReportFavorite = require('./reportFavorite.model');
const ShareLink = require('./shareLink.model');
const ScheduledReport = require('./scheduledReport.model');

// 用户与项目的多对多关系（通过ProjectMember表）
const ProjectMember = require('./projectMember.model');
User.belongsToMany(Project, { through: ProjectMember, as: 'projects' });
Project.belongsToMany(User, { through: ProjectMember, as: 'members' });

// 项目与任务的一对多关系
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

// 用户与任务的关系（作为负责人）
User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

// 用户与任务的关系（作为报告人）
User.hasMany(Task, { foreignKey: 'reporterId', as: 'reportedTasks' });
Task.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });

// 项目与Sprint的一对多关系
Project.hasMany(Sprint, { foreignKey: 'projectId', as: 'sprints' });
Sprint.belongsTo(Project, { foreignKey: 'projectId' });

// Sprint与任务的一对多关系
Sprint.hasMany(Task, { foreignKey: 'sprintId', as: 'tasks' });
Task.belongsTo(Sprint, { foreignKey: 'sprintId', as: 'sprint' });

// 任务依赖关系
Task.belongsToMany(Task, { 
  through: TaskDependency, 
  as: 'dependentTasks', 
  foreignKey: 'sourceTaskId',
  otherKey: 'targetTaskId'
});

Task.belongsToMany(Task, { 
  through: TaskDependency, 
  as: 'prerequisiteTasks', 
  foreignKey: 'targetTaskId',
  otherKey: 'sourceTaskId'
});

// Sprint与改进措施的一对多关系
Sprint.hasMany(ImprovementAction, { 
  foreignKey: 'sprintId', 
  as: 'improvementActions' 
});
ImprovementAction.belongsTo(Sprint, { foreignKey: 'sprintId' });

// 用户与改进措施的关系（作为负责人）
User.hasMany(ImprovementAction, { 
  foreignKey: 'assignedTo', 
  as: 'assignedImprovements' 
});
ImprovementAction.belongsTo(User, { 
  foreignKey: 'assignedTo', 
  as: 'assignee' 
});

// 任务与测试用例的一对多关系
Task.hasMany(TestCase, { 
  foreignKey: 'taskId', 
  as: 'testCases' 
});
TestCase.belongsTo(Task, { foreignKey: 'taskId' });

// 测试用例与测试结果的一对多关系
TestCase.hasMany(TestResult, { 
  foreignKey: 'testCaseId', 
  as: 'testResults' 
});
TestResult.belongsTo(TestCase, { foreignKey: 'testCaseId' });

// 用户与测试结果的关系（执行者）
User.hasMany(TestResult, { 
  foreignKey: 'executedBy', 
  as: 'executedTests' 
});
TestResult.belongsTo(User, { 
  foreignKey: 'executedBy', 
  as: 'executor' 
});

// 任务与缺陷分析的一对一关系
Task.hasOne(DefectAnalysis, { 
  foreignKey: 'taskId', 
  as: 'defectAnalysis' 
});
DefectAnalysis.belongsTo(Task, { foreignKey: 'taskId' });

// 用户与缺陷分析的关系（分析者）
User.hasMany(DefectAnalysis, { 
  foreignKey: 'analyzedBy', 
  as: 'conductedAnalyses' 
});
DefectAnalysis.belongsTo(User, { 
  foreignKey: 'analyzedBy', 
  as: 'analyst' 
});

// 用户与收藏报表的关系
User.hasMany(ReportFavorite, {
  foreignKey: 'userId',
  as: 'favoriteReports'
});
ReportFavorite.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// 用户与分享链接的关系
User.hasMany(ShareLink, {
  foreignKey: 'userId',
  as: 'shareLinks'
});
ShareLink.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// 报表与分享链接的关系
Report.hasMany(ShareLink, {
  foreignKey: 'reportId',
  as: 'shareLinks'
});
ShareLink.belongsTo(Report, {
  foreignKey: 'reportId',
  as: 'report'
});

// 用户与定时报表的关系
User.hasMany(ScheduledReport, {
  foreignKey: 'userId',
  as: 'scheduledReports'
});
ScheduledReport.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// 项目与定时报表的关系
Project.hasMany(ScheduledReport, {
  foreignKey: 'projectId',
  as: 'scheduledReports'
});
ScheduledReport.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project'
});

// 测试结果与缺陷的关联（通过defectId）
TestResult.belongsTo(Task, { 
  foreignKey: 'defectId', 
  as: 'relatedDefect' 
});

module.exports = {
  User,
  Project,
  Task,
  Sprint,
  TaskDependency,
  ProjectMember,
  ImprovementAction,
  TestCase,
  TestResult,
  DefectAnalysis
};