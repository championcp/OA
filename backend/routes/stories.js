import express from 'express';
const router = express.Router({ mergeParams: true });
const { check, validationResult } = require('express-validator');
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import logger from '../middleware/logger.js';
import db from '../config/db.js';

// @route   POST api/projects/:projectId/stories
// @desc    创建用户故事
// @access  Private (Product Owner, Scrum Master)
router.post(
  '/',
  [
    auth,
    roleCheck(['Product Owner', 'Scrum Master']),
    logger('story'),
    [
      check('title', '用户故事标题是必填项').not().isEmpty(),
      check('description', '用户故事描述是必填项').not().isEmpty(),
      check('acceptanceCriteria', '验收标准是必填项').optional(),
      check('status', '状态无效').optional().isIn(['backlog', 'sprint_backlog', 'in_progress', 'done']),
      check('priority', '优先级无效').optional().isIn(['low', 'medium', 'high', 'critical']),
      check('points', '故事点数格式无效').optional().isNumeric(),
      check('sprintId', 'Sprint ID格式无效').optional().isNumeric(),
      check('epicId', 'Epic ID格式无效').optional().isNumeric(),
      check('assignedTo', '指派用户ID格式无效').optional().isNumeric()
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
      acceptanceCriteria,
      status = 'backlog',
      priority = 'medium',
      points = 0,
      sprintId,
      epicId,
      assignedTo
    } = req.body;

    try {
      // 检查项目是否存在
      const projectResult = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.projectId]);
      
      if (projectResult.rows.length === 0) {
        return res.status(404).json({ msg: '项目不存在' });
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

      // 如果提供了epicId，检查Epic是否存在
      if (epicId) {
        const epicCheck = await db.query(
          'SELECT * FROM epics WHERE id = $1 AND project_id = $2',
          [epicId, req.params.projectId]
        );
        
        if (epicCheck.rows.length === 0) {
          return res.status(404).json({ msg: 'Epic不存在' });
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

      // 创建用户故事
      const result = await db.query(
        `INSERT INTO stories (
          project_id, sprint_id, epic_id, title, description, 
          acceptance_criteria, status, priority, points, created_by, assigned_to
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING id, project_id, sprint_id, epic_id, title, description, 
                  acceptance_criteria, status, priority, points, 
                  created_by, assigned_to, created_at`,
        [
          req.params.projectId,
          sprintId || null,
          epicId || null,
          title,
          description,
          acceptanceCriteria || null,
          status,
          priority,
          points,
          req.user.id,
          assignedTo || null
        ]
      );
      
      // 获取创建者和指派者信息
      const story = result.rows[0];
      
      if (story.assigned_to) {
        const assigneeResult = await db.query(
          'SELECT id, name FROM users WHERE id = $1',
          [story.assigned_to]
        );
        
        if (assigneeResult.rows.length > 0) {
          story.assignee = assigneeResult.rows[0];
        }
      }
      
      res.status(201).json(story);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   GET api/projects/:projectId/stories
// @desc    获取项目的所有用户故事
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
    const { sprintId, epicId, status, assignedTo } = req.query;
    
    // 构建查询条件
    let query = `
      SELECT s.id, s.title, s.description, s.acceptance_criteria, s.status, s.priority, 
             s.points, s.sprint_id, s.epic_id, s.created_at, s.updated_at,
             u.id as assignee_id, u.name as assignee_name,
             e.title as epic_title
      FROM stories s
      LEFT JOIN users u ON s.assigned_to = u.id
      LEFT JOIN epics e ON s.epic_id = e.id
      WHERE s.project_id = $1
    `;
    
    const queryParams = [req.params.projectId];
    let paramIndex = 2;
    
    if (sprintId) {
      query += ` AND s.sprint_id = $${paramIndex}`;
      queryParams.push(sprintId);
      paramIndex++;
    }
    
    if (epicId) {
      query += ` AND s.epic_id = $${paramIndex}`;
      queryParams.push(epicId);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND s.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }
    
    if (assignedTo) {
      query += ` AND s.assigned_to = $${paramIndex}`;
      queryParams.push(assignedTo);
      paramIndex++;
    }
    
    query += ' ORDER BY s.priority DESC, s.created_at DESC';
    
    // 执行查询
    const result = await db.query(query, queryParams);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/projects/:projectId/stories/:id
// @desc    获取单个用户故事
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

    // 获取用户故事信息
    const storyResult = await db.query(
      `SELECT s.*, 
              c.id as creator_id, c.name as creator_name,
              a.id as assignee_id, a.name as assignee_name,
              e.id as epic_id, e.title as epic_title,
              sp.id as sprint_id, sp.name as sprint_name
       FROM stories s
       LEFT JOIN users c ON s.created_by = c.id
       LEFT JOIN users a ON s.assigned_to = a.id
       LEFT JOIN epics e ON s.epic_id = e.id
       LEFT JOIN sprints sp ON s.sprint_id = sp.id
       WHERE s.id = $1 AND s.project_id = $2`,
      [req.params.id, req.params.projectId]
    );
    
    if (storyResult.rows.length === 0) {
      return res.status(404).json({ msg: '用户故事不存在' });
    }

    const story = storyResult.rows[0];

    // 获取关联的任务
    const tasksResult = await db.query(
      `SELECT t.id, t.title, t.status, t.priority, t.estimated_hours, t.spent_hours,
              u.id as assignee_id, u.name as assignee_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.story_id = $1
       ORDER BY t.created_at`,
      [req.params.id]
    );

    // 构建完整的用户故事对象
    const fullStory = {
      ...story,
      tasks: tasksResult.rows
    };

    res.json(fullStory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   PUT api/projects/:projectId/stories/:id
// @desc    更新用户故事
// @access  Private (Product Owner, Scrum Master)
router.put(
  '/:id',
  [
    auth,
    roleCheck(['Product Owner', 'Scrum Master']),
    logger('story'),
    [
      check('title', '用户故事标题是必填项').optional().not().isEmpty(),
      check('description', '用户故事描述是必填项').optional(),
      check('acceptanceCriteria', '验收标准是必填项').optional(),
      check('status', '状态无效').optional().isIn(['backlog', 'sprint_backlog', 'in_progress', 'done']),
      check('priority', '优先级无效').optional().isIn(['low', 'medium', 'high', 'critical']),
      check('points', '故事点数格式无效').optional().isNumeric(),
      check('sprintId', 'Sprint ID格式无效').optional().isNumeric(),
      check('epicId', 'Epic ID格式无效').optional().isNumeric(),
      check('assignedTo', '指派用户ID格式无效').optional().isNumeric()
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
      acceptanceCriteria,
      status,
      priority,
      points,
      sprintId,
      epicId,
      assignedTo
    } = req.body;

    try {
      // 检查用户故事是否存在
      let result = await db.query(
        'SELECT * FROM stories WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: '用户故事不存在' });
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

      if (acceptanceCriteria !== undefined) {
        updateFields.push(`acceptance_criteria = $${valueIndex}`);
        values.push(acceptanceCriteria);
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

      if (points !== undefined) {
        updateFields.push(`points = $${valueIndex}`);
        values.push(points);
        valueIndex++;
      }

      if (sprintId !== undefined) {
        updateFields.push(`sprint_id = $${valueIndex}`);
        values.push(sprintId === null ? null : sprintId);
        valueIndex++;
      }

      if (epicId !== undefined) {
        updateFields.push(`epic_id = $${valueIndex}`);
        values.push(epicId === null ? null : epicId);
        valueIndex++;
      }

      if (assignedTo !== undefined) {
        updateFields.push(`assigned_to = $${valueIndex}`);
        values.push(assignedTo === null ? null : assignedTo);
        valueIndex++;
      }

      // 如果没有要更新的字段，则返回原始用户故事
      if (updateFields.length === 0) {
        return res.json(result.rows[0]);
      }

      // 添加用户故事ID和项目ID到values数组
      values.push(req.params.id);
      values.push(req.params.projectId);

      // 执行更新
      result = await db.query(
        `UPDATE stories SET ${updateFields.join(', ')} 
         WHERE id = $${valueIndex} AND project_id = $${valueIndex + 1}
         RETURNING id, project_id, sprint_id, epic_id, title, description, 
                   acceptance_criteria, status, priority, points, 
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

// @route   DELETE api/projects/:projectId/stories/:id
// @desc    删除用户故事
// @access  Private (Product Owner, Scrum Master)
router.delete(
  '/:id',
  [auth, roleCheck(['Product Owner', 'Scrum Master']), logger('story')],
  async (req, res) => {
    try {
      // 检查用户故事是否存在
      const result = await db.query(
        'SELECT * FROM stories WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: '用户故事不存在' });
      }

      // 删除用户故事
      await db.query(
        'DELETE FROM stories WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      res.json({ msg: '用户故事已删除' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

export default router;