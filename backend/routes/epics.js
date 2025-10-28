import express from 'express';
const router = express.Router({ mergeParams: true });
const { check, validationResult } = require('express-validator');
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import logger from '../middleware/logger.js';
import db from '../config/db.js';

// @route   POST api/projects/:projectId/epics
// @desc    创建史诗
// @access  Private (Product Owner, Scrum Master)
router.post(
  '/',
  [
    auth,
    roleCheck(['Product Owner', 'Scrum Master']),
    logger('epic'),
    [
      check('title', '史诗标题是必填项').not().isEmpty(),
      check('description', '史诗描述是必填项').not().isEmpty(),
      check('status', '状态无效').optional().isIn(['planning', 'in_progress', 'done']),
      check('priority', '优先级无效').optional().isIn(['low', 'medium', 'high', 'critical'])
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
      status = 'planning',
      priority = 'medium'
    } = req.body;

    try {
      // 检查项目是否存在
      const projectResult = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.projectId]);
      
      if (projectResult.rows.length === 0) {
        return res.status(404).json({ msg: '项目不存在' });
      }

      // 创建史诗
      const result = await db.query(
        `INSERT INTO epics (
          project_id, title, description, status, priority, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING id, project_id, title, description, status, priority, created_by, created_at`,
        [
          req.params.projectId,
          title,
          description,
          status,
          priority,
          req.user.id
        ]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   GET api/projects/:projectId/epics
// @desc    获取项目的所有史诗
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
    const { status } = req.query;
    
    // 构建查询条件
    let query = `
      SELECT e.id, e.title, e.description, e.status, e.priority, e.created_at, e.updated_at,
             u.id as creator_id, u.name as creator_name,
             COUNT(s.id) as story_count
      FROM epics e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN stories s ON e.id = s.epic_id
      WHERE e.project_id = $1
    `;
    
    const queryParams = [req.params.projectId];
    let paramIndex = 2;
    
    if (status) {
      query += ` AND e.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }
    
    query += ' GROUP BY e.id, u.id, u.name ORDER BY e.priority DESC, e.created_at DESC';
    
    // 执行查询
    const result = await db.query(query, queryParams);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/projects/:projectId/epics/:id
// @desc    获取单个史诗
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

    // 获取史诗信息
    const epicResult = await db.query(
      `SELECT e.*, 
              u.id as creator_id, u.name as creator_name
       FROM epics e
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = $1 AND e.project_id = $2`,
      [req.params.id, req.params.projectId]
    );
    
    if (epicResult.rows.length === 0) {
      return res.status(404).json({ msg: '史诗不存在' });
    }

    const epic = epicResult.rows[0];

    // 获取关联的用户故事
    const storiesResult = await db.query(
      `SELECT s.id, s.title, s.status, s.priority, s.points,
              u.id as assignee_id, u.name as assignee_name
       FROM stories s
       LEFT JOIN users u ON s.assigned_to = u.id
       WHERE s.epic_id = $1
       ORDER BY s.priority DESC, s.created_at`,
      [req.params.id]
    );

    // 构建完整的史诗对象
    const fullEpic = {
      ...epic,
      stories: storiesResult.rows
    };

    res.json(fullEpic);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   PUT api/projects/:projectId/epics/:id
// @desc    更新史诗
// @access  Private (Product Owner, Scrum Master)
router.put(
  '/:id',
  [
    auth,
    roleCheck(['Product Owner', 'Scrum Master']),
    logger('epic'),
    [
      check('title', '史诗标题是必填项').optional().not().isEmpty(),
      check('description', '史诗描述是必填项').optional(),
      check('status', '状态无效').optional().isIn(['planning', 'in_progress', 'done']),
      check('priority', '优先级无效').optional().isIn(['low', 'medium', 'high', 'critical'])
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
      priority
    } = req.body;

    try {
      // 检查史诗是否存在
      let result = await db.query(
        'SELECT * FROM epics WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: '史诗不存在' });
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

      // 如果没有要更新的字段，则返回原始史诗
      if (updateFields.length === 0) {
        return res.json(result.rows[0]);
      }

      // 添加史诗ID和项目ID到values数组
      values.push(req.params.id);
      values.push(req.params.projectId);

      // 执行更新
      result = await db.query(
        `UPDATE epics SET ${updateFields.join(', ')} 
         WHERE id = $${valueIndex} AND project_id = $${valueIndex + 1}
         RETURNING id, project_id, title, description, status, priority, created_by, created_at, updated_at`,
        values
      );
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   DELETE api/projects/:projectId/epics/:id
// @desc    删除史诗
// @access  Private (Product Owner, Scrum Master)
router.delete(
  '/:id',
  [auth, roleCheck(['Product Owner', 'Scrum Master']), logger('epic')],
  async (req, res) => {
    try {
      // 检查史诗是否存在
      const result = await db.query(
        'SELECT * FROM epics WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: '史诗不存在' });
      }

      // 检查是否有关联的用户故事
      const storiesCheck = await db.query(
        'SELECT COUNT(*) FROM stories WHERE epic_id = $1',
        [req.params.id]
      );
      
      if (parseInt(storiesCheck.rows[0].count) > 0) {
        return res.status(400).json({ msg: '无法删除，此史诗下有关联的用户故事' });
      }

      // 删除史诗
      await db.query(
        'DELETE FROM epics WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      res.json({ msg: '史诗已删除' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

export default router;