const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { authMiddleware, checkPermission } = require('../middleware/auth.middleware');
const { Project, Task, Sprint } = require('../db/models');
const { Op } = require('sequelize');

// 创建项目
router.post('/', 
  authMiddleware,
  [
    check('name').notEmpty().withMessage('项目名称不能为空'),
    check('key').notEmpty().withMessage('项目key不能为空'),
    check('startDate').isISO8601().withMessage('无效的日期格式')
  ],
  async (req, res) => {
    try {
      const project = await Project.create({
        ...req.body,
        ownerId: req.user.id
      });
      
      // 自动将创建者添加为项目成员
      await ProjectMember.create({
        userId: req.user.id,
        projectId: project.id,
        role: 'owner',
        permissions: {
          view: true,
          edit: true,
          delete: true,
          manage: true
        }
      });
      
      res.status(201).json(project);
    } catch (error) {
      console.error('创建项目错误:', error);
      res.status(500).json({ message: '创建项目失败' });
    }
  }
);

// 获取项目列表
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [{
        model: User,
        as: 'members',
        where: { id: req.user.id },
        required: true
      }]
    });
    
    res.json(projects);
  } catch (error) {
    console.error('获取项目列表错误:', error);
    res.status(500).json({ message: '获取项目列表失败' });
  }
});

// 获取项目详情
router.get('/:id', 
  authMiddleware,
  checkPermission('view'),
  async (req, res) => {
    try {
      const project = await Project.findByPk(req.params.id, {
        include: [
          { model: User, as: 'members' },
          { model: Task, as: 'tasks' },
          { model: Sprint, as: 'sprints' }
        ]
      });
      
      if (!project) {
        return res.status(404).json({ message: '项目不存在' });
      }
      
      res.json(project);
    } catch (error) {
      console.error('获取项目详情错误:', error);
      res.status(500).json({ message: '获取项目详情失败' });
    }
  }
);

// 更新项目
router.put('/:id', 
  authMiddleware,
  checkPermission('edit'),
  async (req, res) => {
    try {
      const [updated] = await Project.update(req.body, {
        where: { id: req.params.id }
      });
      
      if (!updated) {
        return res.status(404).json({ message: '项目不存在' });
      }
      
      res.json({ message: '项目更新成功' });
    } catch (error) {
      console.error('更新项目错误:', error);
      res.status(500).json({ message: '更新项目失败' });
    }
  }
);

// 删除项目
router.delete('/:id', 
  authMiddleware,
  checkPermission('delete'),
  async (req, res) => {
    try {
      const deleted = await Project.destroy({
        where: { id: req.params.id }
      });
      
      if (!deleted) {
        return res.status(404).json({ message: '项目不存在' });
      }
      
      res.json({ message: '项目删除成功' });
    } catch (error) {
      console.error('删除项目错误:', error);
      res.status(500).json({ message: '删除项目失败' });
    }
  }
);

// 获取项目看板视图
router.get('/:id/kanban', 
  authMiddleware,
  checkPermission('view'),
  async (req, res) => {
    try {
      const tasks = await Task.findAll({
        where: { projectId: req.params.id },
        order: [['order', 'ASC']]
      });
      
      // 按状态分组
      const kanbanData = {
        backlog: tasks.filter(t => t.status === 'backlog'),
        todo: tasks.filter(t => t.status === 'todo'),
        in_progress: tasks.filter(t => t.status === 'in_progress'),
        review: tasks.filter(t => t.status === 'review'),
        done: tasks.filter(t => t.status === 'done')
      };
      
      res.json(kanbanData);
    } catch (error) {
      console.error('获取看板视图错误:', error);
      res.status(500).json({ message: '获取看板视图失败' });
    }
  }
);

module.exports = router;