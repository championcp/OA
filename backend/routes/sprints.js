import express from 'express';
const router = express.Router({ mergeParams: true });
const { check, validationResult } = require('express-validator');
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import logger from '../middleware/logger.js';
import db from '../config/db.js';

// @route   POST api/projects/:projectId/sprints
// @desc    创建Sprint
// @access  Private (Scrum Master)
router.post(
  '/',
  [
    auth,
    roleCheck(['Scrum Master']),
    logger('sprint'),
    [
      check('name', 'Sprint名称是必填项').not().isEmpty(),
      check('goal', 'Sprint目标是必填项').not().isEmpty(),
      check('startDate', '开始日期格式无效').isDate(),
      check('endDate', '结束日期格式无效').isDate()
    ]
  ],
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, goal, startDate, endDate, status = 'planning' } = req.body;

    try {
      // 检查项目是否存在
      const projectResult = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.projectId]);
      
      if (projectResult.rows.length === 0) {
        return res.status(404).json({ msg: '项目不存在' });
      }

      // 创建Sprint
      const result = await db.query(
        `INSERT INTO sprints (project_id, name, goal, start_date, end_date, status) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, project_id, name, goal, start_date, end_date, status, created_at`,
        [req.params.projectId, name, goal, startDate, endDate, status]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   GET api/projects/:projectId/sprints
// @desc    获取项目的所有Sprint
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // 检查用户是否有权限访问此项目
    if (!['Scrum Master', 'Product Owner'].includes(req.user.role)) {
      const memberCheck = await db.query(
        'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
        [req.params.projectId, req.user.id]
      );
      
      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ msg: '权限不足，无法访问此项目' });
      }
    }

    // 获取项目的所有Sprint
    const result = await db.query(
      `SELECT id, name, goal, start_date, end_date, status, created_at, updated_at
       FROM sprints
       WHERE project_id = $1
       ORDER BY start_date DESC`,
      [req.params.projectId]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/projects/:projectId/sprints/:id
// @desc    获取单个Sprint
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    // 检查用户是否有权限访问此项目
    if (!['Scrum Master', 'Product Owner'].includes(req.user.role)) {
      const memberCheck = await db.query(
        'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
        [req.params.projectId, req.user.id]
      );
      
      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ msg: '权限不足，无法访问此项目' });
      }
    }

    // 获取Sprint信息
    const sprintResult = await db.query(
      `SELECT id, project_id, name, goal, start_date, end_date, status, created_at, updated_at
       FROM sprints
       WHERE id = $1 AND project_id = $2`,
      [req.params.id, req.params.projectId]
    );
    
    if (sprintResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Sprint不存在' });
    }

    const sprint = sprintResult.rows[0];

    // 获取Sprint的任务
    const tasksResult = await db.query(
      `SELECT t.id, t.title, t.status, t.priority, t.estimated_hours, t.spent_hours,
              u.id as assignee_id, u.name as assignee_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.sprint_id = $1
       ORDER BY t.created_at`,
      [req.params.id]
    );

    // 获取Sprint的用户故事
    const storiesResult = await db.query(
      `SELECT s.id, s.title, s.status, s.priority, s.points,
              u.id as assignee_id, u.name as assignee_name
       FROM stories s
       LEFT JOIN users u ON s.assigned_to = u.id
       WHERE s.sprint_id = $1
       ORDER BY s.created_at`,
      [req.params.id]
    );

    // 构建完整的Sprint对象
    const fullSprint = {
      ...sprint,
      tasks: tasksResult.rows,
      stories: storiesResult.rows
    };

    res.json(fullSprint);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   PUT api/projects/:projectId/sprints/:id
// @desc    更新Sprint
// @access  Private (Scrum Master)
router.put(
  '/:id',
  [
    auth,
    roleCheck(['Scrum Master']),
    logger('sprint'),
    [
      check('name', 'Sprint名称是必填项').optional().not().isEmpty(),
      check('goal', 'Sprint目标是必填项').optional().not().isEmpty(),
      check('startDate', '开始日期格式无效').optional().isDate(),
      check('endDate', '结束日期格式无效').optional().isDate(),
      check('status', '状态无效').optional().isIn(['planning', 'active', 'completed', 'cancelled'])
    ]
  ],
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, goal, startDate, endDate, status } = req.body;

    try {
      // 检查Sprint是否存在
      let result = await db.query(
        'SELECT * FROM sprints WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: 'Sprint不存在' });
      }

      // 构建更新字段
      const updateFields = [];
      const values = [];
      let valueIndex = 1;

      if (name) {
        updateFields.push(`name = $${valueIndex}`);
        values.push(name);
        valueIndex++;
      }

      if (goal) {
        updateFields.push(`goal = $${valueIndex}`);
        values.push(goal);
        valueIndex++;
      }

      if (startDate) {
        updateFields.push(`start_date = $${valueIndex}`);
        values.push(startDate);
        valueIndex++;
      }

      if (endDate) {
        updateFields.push(`end_date = $${valueIndex}`);
        values.push(endDate);
        valueIndex++;
      }

      if (status) {
        updateFields.push(`status = $${valueIndex}`);
        values.push(status);
        valueIndex++;
      }

      // 如果没有要更新的字段，则返回原始Sprint
      if (updateFields.length === 0) {
        return res.json(result.rows[0]);
      }

      // 添加Sprint ID和项目ID到values数组
      values.push(req.params.id);
      values.push(req.params.projectId);

      // 执行更新
      result = await db.query(
        `UPDATE sprints SET ${updateFields.join(', ')} 
         WHERE id = $${valueIndex} AND project_id = $${valueIndex + 1}
         RETURNING id, project_id, name, goal, start_date, end_date, status, created_at, updated_at`,
        values
      );
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   DELETE api/projects/:projectId/sprints/:id
// @desc    删除Sprint
// @access  Private (Scrum Master)
router.delete(
  '/:id',
  [auth, roleCheck(['Scrum Master']), logger('sprint')],
  async (req, res) => {
    try {
      // 检查Sprint是否存在
      const result = await db.query(
        'SELECT * FROM sprints WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: 'Sprint不存在' });
      }

      // 删除Sprint
      await db.query(
        'DELETE FROM sprints WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      res.json({ msg: 'Sprint已删除' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

export default router;