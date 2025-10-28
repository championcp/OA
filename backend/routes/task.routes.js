import express from 'express';
const router = express.Router();
import { check } from 'express-validator';
import auth from '../middleware/auth.middleware.js';
import { Task, TaskDependency, Project, User } from '../db/models/index.js';
import { Op } from 'sequelize';

// 创建任务
router.post('/', 
  auth.authMiddleware,
  [
    check('title').notEmpty().withMessage('任务标题不能为空'),
    check('projectId').notEmpty().withMessage('必须指定项目ID'),
    check('type').isIn(['story', 'task', 'bug', 'epic']).withMessage('无效的任务类型')
  ],
  async (req, res) => {
    try {
      // 检查用户是否有权限在此项目中创建任务
      const hasPermission = await checkProjectPermission(req.user.id, req.body.projectId, 'edit');
      if (!hasPermission) {
        return res.status(403).json({ message: '您没有在此项目中创建任务的权限' });
      }
      
      const task = await Task.create({
        ...req.body,
        reporterId: req.user.id
      });
      
      res.status(201).json(task);
    } catch (error) {
      console.error('创建任务错误:', error);
      res.status(500).json({ message: '创建任务失败' });
    }
  }
);

// 获取任务列表
router.get('/', auth.authMiddleware, async (req, res) => {
  try {
    const { projectId, sprintId, assigneeId, status } = req.query;
    const where = {};
    
    if (projectId) where.projectId = projectId;
    if (sprintId) where.sprintId = sprintId;
    if (assigneeId) where.assigneeId = assigneeId;
    if (status) where.status = status;
    
    // 检查用户是否有权限查看这些任务
    if (projectId) {
      const hasPermission = await checkProjectPermission(req.user.id, projectId, 'view');
      if (!hasPermission) {
        return res.status(403).json({ message: '您没有查看此项目任务的权限' });
      }
    }
    
    const tasks = await Task.findAll({ where });
    res.json(tasks);
  } catch (error) {
    console.error('获取任务列表错误:', error);
    res.status(500).json({ message: '获取任务列表失败' });
    }
});

// 获取任务详情
router.get('/:id', 
  auth.authMiddleware,
  async (req, res) => {
    try {
      const task = await Task.findByPk(req.params.id, {
        include: [
          { model: Project, as: 'project' },
          { model: User, as: 'assignee' },
          { model: User, as: 'reporter' },
          { 
            model: Task, 
            as: 'dependentTasks',
            through: { attributes: ['type', 'lag'] }
          },
          { 
            model: Task, 
            as: 'prerequisiteTasks',
            through: { attributes: ['type', 'lag'] }
          }
        ]
      });
      
      if (!task) {
        return res.status(404).json({ message: '任务不存在' });
      }
      
      // 检查用户是否有权限查看此任务
      const hasPermission = await checkProjectPermission(req.user.id, task.projectId, 'view');
      if (!hasPermission) {
        return res.status(403).json({ message: '您没有查看此任务的权限' });
      }
      
      res.json(task);
    } catch (error) {
      console.error('获取任务详情错误:', error);
      res.status(500).json({ message: '获取任务详情失败' });
    }
  }
);

// 更新任务
router.put('/:id', 
  auth.authMiddleware,
  async (req, res) => {
    try {
      const task = await Task.findByPk(req.params.id);
      if (!task) {
        return res.status(404).json({ message: '任务不存在' });
      }
      
      // 检查用户是否有权限编辑此任务
      const hasPermission = await checkProjectPermission(req.user.id, task.projectId, 'edit');
      if (!hasPermission) {
        return res.status(403).json({ message: '您没有编辑此任务的权限' });
      }
      
      const [updated] = await Task.update(req.body, {
        where: { id: req.params.id }
      });
      
      if (!updated) {
        return res.status(404).json({ message: '任务不存在' });
      }
      
      res.json({ message: '任务更新成功' });
    } catch (error) {
      console.error('更新任务错误:', error);
      res.status(500).json({ message: '更新任务失败' });
    }
  }
);

// 删除任务
router.delete('/:id', 
  auth.authMiddleware,
  async (req, res) => {
    try {
      const task = await Task.findByPk(req.params.id);
      if (!task) {
        return res.status(404).json({ message: '任务不存在' });
      }
      
      // 检查用户是否有权限删除此任务
      const hasPermission = await checkProjectPermission(req.user.id, task.projectId, 'delete');
      if (!hasPermission) {
        return res.status(403).json({ message: '您没有删除此任务的权限' });
      }
      
      const deleted = await Task.destroy({
        where: { id: req.params.id }
      });
      
      if (!deleted) {
        return res.status(404).json({ message: '任务不存在' });
      }
      
      res.json({ message: '任务删除成功' });
    } catch (error) {
      console.error('删除任务错误:', error);
      res.status(500).json({ message: '删除任务失败' });
    }
  }
);

// 添加任务依赖
router.post('/:id/dependencies', 
  auth.authMiddleware,
  [
    check('targetTaskId').notEmpty().withMessage('必须指定依赖的任务ID'),
    check('type').isIn(['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'])
      .withMessage('无效的依赖类型')
  ],
  async (req, res) => {
    try {
      const sourceTask = await Task.findByPk(req.params.id);
      const targetTask = await Task.findByPk(req.body.targetTaskId);
      
      if (!sourceTask || !targetTask) {
        return res.status(404).json({ message: '任务不存在' });
      }
      
      // 检查两个任务是否属于同一个项目
      if (sourceTask.projectId !== targetTask.projectId) {
        return res.status(400).json({ message: '不能跨项目创建任务依赖' });
      }
      
      // 检查用户是否有权限编辑此任务
      const hasPermission = await checkProjectPermission(req.user.id, sourceTask.projectId, 'edit');
      if (!hasPermission) {
        return res.status(403).json({ message: '您没有编辑此任务的权限' });
      }
      
      // 检查是否已存在相同的依赖
      const existingDependency = await TaskDependency.findOne({
        where: {
          sourceTaskId: req.params.id,
          targetTaskId: req.body.targetTaskId
        }
      });
      
      if (existingDependency) {
        return res.status(400).json({ message: '此依赖关系已存在' });
      }
      
      // 检查是否会产生循环依赖
      if (await checkCircularDependency(req.params.id, req.body.targetTaskId)) {
        return res.status(400).json({ message: '不能创建循环依赖' });
      }
      
      const dependency = await TaskDependency.create({
        sourceTaskId: req.params.id,
        targetTaskId: req.body.targetTaskId,
        type: req.body.type,
        lag: req.body.lag || 0
      });
      
      res.status(201).json(dependency);
    } catch (error) {
      console.error('添加任务依赖错误:', error);
      res.status(500).json({ message: '添加任务依赖失败' });
    }
  }
);

// 删除任务依赖
router.delete('/:id/dependencies/:dependencyId', 
  auth.authMiddleware,
  async (req, res) => {
    try {
      const dependency = await TaskDependency.findByPk(req.params.dependencyId);
      if (!dependency) {
        return res.status(404).json({ message: '依赖关系不存在' });
      }
      
      // 检查用户是否有权限编辑此任务
      const sourceTask = await Task.findByPk(dependency.sourceTaskId);
      const hasPermission = await checkProjectPermission(req.user.id, sourceTask.projectId, 'edit');
      if (!hasPermission) {
        return res.status(403).json({ message: '您没有编辑此任务的权限' });
      }
      
      await dependency.destroy();
      res.json({ message: '依赖关系删除成功' });
    } catch (error) {
      console.error('删除任务依赖错误:', error);
      res.status(500).json({ message: '删除任务依赖失败' });
    }
  }
);

// 检查项目权限的辅助函数
async function checkProjectPermission(userId, projectId, permission) {
  const { ProjectMember } = await import('../db/models/index.js');
  
  // 管理员拥有所有权限
  const user = await User.findByPk(userId);
  if (user.role === 'admin') return true;
  
  const membership = await ProjectMember.findOne({
    where: {
      userId,
      projectId
    }
  });
  
  if (!membership) return false;
  
  return membership.permissions[permission];
}

// 检查循环依赖的辅助函数
async function checkCircularDependency(sourceTaskId, targetTaskId, visited = new Set()) {
  if (sourceTaskId === targetTaskId) return true;
  if (visited.has(sourceTaskId)) return false;
  
  visited.add(sourceTaskId);
  
  const dependencies = await TaskDependency.findAll({
    where: { sourceTaskId }
  });
  
  for (const dep of dependencies) {
    if (await checkCircularDependency(dep.targetTaskId, targetTaskId, visited)) {
      return true;
    }
  }
  
  return false;
}

export default router;