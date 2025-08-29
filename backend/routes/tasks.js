const express = require('express');
const router = express.Router({ mergeParams: true });
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const logger = require('../middleware/logger');
const db = require('../config/db');

// @route   POST api/projects/:projectId/tasks
// @desc    创建任务
// @access  Private
router.post(
  '/',
  [
    auth,
    logger('task'),
    [
      check('title', '任务标题是必填项').not().isEmpty(),
      check('description', '任务描述是必填项').optional(),
      check('status', '状态无效').optional().isIn(['todo', 'in_progress', 'review', 'done']),
      check('priority', '优先级无效').optional().isIn(['low', 'medium', 'high', 'critical']),
      check('sprintId', 'Sprint ID格式无效').optional().isNumeric(),
      check('storyId', '用户故事ID格式无效').optional().isNumeric(),
      check('assignedTo', '指派用户ID格式无效').optional().isNumeric(),
      check('estimatedHours', '预估工时格式无效').optional().isNumeric()
    ]
  ],
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      status = 'todo',
      priority = 'medium',
      sprintId,
      storyId,
      assignedTo,
      estimatedHours
    } = req.body;

    try {
      // 检查项目是否存在
      const projectResult = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.projectId]);
      
      if (projectResult.rows.length === 0) {
        return res.status(404).json({ msg: '项目不存在' });
      }

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

      // 如果提供了sprintId，检查Sprint是否存在
      if (sprintId) {
        const sprintCheck = await db.query(
          'SELECT * FROM sprints WHERE id = $1 AND project_id = $2',
          [sprintId, req.params.projectId]
        );
        
        if (sprintCheck.rows.length === 0) {
          return res.status(404).json({ msg: 'Sprint不存在' });
        }
      }

      // 如果提供了storyId，检查用户故事是否存在
      if (storyId) {
        const storyCheck = await db.query(
          'SELECT * FROM stories WHERE id = $1 AND project_id = $2',
          [storyId, req.params.projectId]
        );
        
        if (storyCheck.rows.length === 0) {
          return res.status(404).json({ msg: '用户故事不存在' });
        }
      }

      // 如果提供了assignedTo，检查用户是否存在且是项目成员
      if (assignedTo) {
        const userCheck = await db.query(
          'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
          [req.params.projectId, assignedTo]
        );
        
        if (userCheck.rows.length === 0) {
          return res.status(404).json({ msg: '指派的用户不是项目成员' });
        }
      }

      // 创建任务
      const result = await db.query(
        `INSERT INTO tasks (
          project_id, sprint_id, story_id, title, description, 
          status, priority, estimated_hours, created_by, assigned_to
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING id, project_id, sprint_id, story_id, title, description, 
                  status, priority, estimated_hours, spent_hours, 
                  created_by, assigned_to, created_at`,
        [
          req.params.projectId,
          sprintId || null,
          storyId || null,
          title,
          description || null,
          status,
          priority,
          estimatedHours || 0,
          req.user.id,
          assignedTo || null
        ]
      );
      
      // 获取创建者和指派者信息
      const task = result.rows[0];
      
      if (task.assigned_to) {
        const assigneeResult = await db.query(
          'SELECT id, name FROM users WHERE id = $1',
          [task.assigned_to]
        );
        
        if (assigneeResult.rows.length > 0) {
          task.assignee = assigneeResult.rows[0];
        }
      }
      
      res.status(201).json(task);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   GET api/projects/:projectId/tasks
// @desc    获取项目的所有任务
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

    // 获取查询参数
    const { sprintId, storyId, status, assignedTo } = req.query;
    
    // 构建查询条件
    let query = `
      SELECT t.id, t.title, t.description, t.status, t.priority, 
             t.estimated_hours, t.spent_hours, t.sprint_id, t.story_id,
             t.created_at, t.updated_at,
             u.id as assignee_id, u.name as assignee_name,
             s.title as story_title
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN stories s ON t.story_id = s.id
      WHERE t.project_id = $1
    `;
    
    const queryParams = [req.params.projectId];
    let paramIndex = 2;
    
    if (sprintId) {
      query += ` AND t.sprint_id = $${paramIndex}`;
      queryParams.push(sprintId);
      paramIndex++;
    }
    
    if (storyId) {
      query += ` AND t.story_id = $${paramIndex}`;
      queryParams.push(storyId);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }
    
    if (assignedTo) {
      query += ` AND t.assigned_to = $${paramIndex}`;
      queryParams.push(assignedTo);
      paramIndex++;
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    // 执行查询
    const result = await db.query(query, queryParams);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/projects/:projectId/tasks/:id
// @desc    获取单个任务
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

    // 获取任务信息
    const taskResult = await db.query(
      `SELECT t.*, 
              c.id as creator_id, c.name as creator_name,
              a.id as assignee_id, a.name as assignee_name,
              s.id as story_id, s.title as story_title,
              sp.id as sprint_id, sp.name as sprint_name
       FROM tasks t
       LEFT JOIN users c ON t.created_by = c.id
       LEFT JOIN users a ON t.assigned_to = a.id
       LEFT JOIN stories s ON t.story_id = s.id
       LEFT JOIN sprints sp ON t.sprint_id = sp.id
       WHERE t.id = $1 AND t.project_id = $2`,
      [req.params.id, req.params.projectId]
    );
    
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ msg: '任务不存在' });
    }

    const task = taskResult.rows[0];

    // 获取任务的评论
    const commentsResult = await db.query(
      `SELECT c.id, c.content, c.created_at,
              u.id as user_id, u.name as user_name, u.avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.task_id = $1
       ORDER BY c.created_at`,
      [req.params.id]
    );

    // 构建完整的任务对象
    const fullTask = {
      ...task,
      comments: commentsResult.rows
    };

    res.json(fullTask);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   PUT api/projects/:projectId/tasks/:id
// @desc    更新任务
// @access  Private
router.put(
  '/:id',
  [
    auth,
    logger('task'),
    [
      check('title', '任务标题是必填项').optional().not().isEmpty(),
      check('description', '任务描述是必填项').optional(),
      check('status', '状态无效').optional().isIn(['todo', 'in_progress', 'review', 'done']),
      check('priority', '优先级无效').optional().isIn(['low', 'medium', 'high', 'critical']),
      check('sprintId', 'Sprint ID格式无效').optional().isNumeric(),
      check('storyId', '用户故事ID格式无效').optional().isNumeric(),
      check('assignedTo', '指派用户ID格式无效').optional().isNumeric(),
      check('estimatedHours', '预估工时格式无效').optional().isNumeric(),
      check('spentHours', '已用工时格式无效').optional().isNumeric()
    ]
  ],
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      status,
      priority,
      sprintId,
      storyId,
      assignedTo,
      estimatedHours,
      spentHours
    } = req.body;

    try {
      // 检查任务是否存在
      let result = await db.query(
        'SELECT * FROM tasks WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: '任务不存在' });
      }

      const task = result.rows[0];

      // 检查用户是否有权限更新此任务
      // Scrum Master和Product Owner可以更新任何任务
      // 其他角色只能更新分配给自己的任务
      if (!['Scrum Master', 'Product Owner'].includes(req.user.role) && 
          task.assigned_to !== req.user.id && task.created_by !== req.user.id) {
        return res.status(403).json({ msg: '权限不足，无法更新此任务' });
      }

      // 构建更新字段
      const updateFields = [];
      const values = [];
      let valueIndex = 1;

      if (title) {
        updateFields.push(`title = $${valueIndex}`);
        values.push(title);
        valueIndex++;
      }

      if (description !== undefined) {
        updateFields.push(`description = $${valueIndex}`);
        values.push(description);
        valueIndex++;
      }

      if (status) {
        updateFields.push(`status = $${valueIndex}`);
        values.push(status);
        valueIndex++;
      }

      if (priority) {
        updateFields.push(`priority = $${valueIndex}`);
        values.push(priority);
        valueIndex++;
      }

      if (sprintId !== undefined) {
        updateFields.push(`sprint_id = $${valueIndex}`);
        values.push(sprintId === null ? null : sprintId);
        valueIndex++;
      }

      if (storyId !== undefined) {
        updateFields.push(`story_id = $${valueIndex}`);
        values.push(storyId === null ? null : storyId);
        valueIndex++;
      }

      if (assignedTo !== undefined) {
        updateFields.push(`assigned_to = $${valueIndex}`);
        values.push(assignedTo === null ? null : assignedTo);
        valueIndex++;
      }

      if (estimatedHours !== undefined) {
        updateFields.push(`estimated_hours = $${valueIndex}`);
        values.push(estimatedHours);
        valueIndex++;
      }

      if (spentHours !== undefined) {
        updateFields.push(`spent_hours = $${valueIndex}`);
        values.push(spentHours);
        valueIndex++;
      }

      // 如果没有要更新的字段，则返回原始任务
      if (updateFields.length === 0) {
        return res.json(task);
      }

      // 添加任务ID和项目ID到values数组
      values.push(req.params.id);
      values.push(req.params.projectId);

      // 执行更新
      result = await db.query(
        `UPDATE tasks SET ${updateFields.join(', ')} 
         WHERE id = $${valueIndex} AND project_id = $${valueIndex + 1}
         RETURNING id, project_id, sprint_id, story_id, title, description, 
                   status, priority, estimated_hours, spent_hours, 
                   created_by, assigned_to, created_at, updated_at`,
        values
      );
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   DELETE api/projects/:projectId/tasks/:id
// @desc    删除任务
// @access  Private
router.delete(
  '/:id',
  [auth, logger('task')],
  async (req, res) => {
    try {
      // 检查任务是否存在
      const result = await db.query(
        'SELECT * FROM tasks WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: '任务不存在' });
      }

      const task = result.rows[0];

      // 检查用户是否有权限删除此任务
      // 只有Scrum Master、Product Owner和任务创建者可以删除任务
      if (!['Scrum Master', 'Product Owner'].includes(req.user.role) && 
          task.created_by !== req.user.id) {
        return res.status(403).json({ msg: '权限不足，无法删除此任务' });
      }

      // 删除任务
      await db.query(
        'DELETE FROM tasks WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      res.json({ msg: '任务已删除' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

module.exports = router;