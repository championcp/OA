const User = require('./user.model');
const Project = require('./project.model');
const Task = require('./task.model');
const Sprint = require('./sprint.model');
const TaskDependency = require('./taskDependency.model');

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

module.exports = {
  User,
  Project,
  Task,
  Sprint,
  TaskDependency,
  ProjectMember
};