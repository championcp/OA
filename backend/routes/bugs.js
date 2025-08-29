const express = require('express');
const router = express.Router({ mergeParams: true });
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const logger = require('../middleware/logger');
const db = require('../config/db');

// @route   POST api/projects/:projectId/bugs
// @desc    创建缺陷
// @access  Private
router.post(
  '/',
  [
    auth,
    logger('bug'),
    [
      check('title', '缺陷标题是必填项').not().isEmpty(),
      check('description', '缺陷描述是必填项').not().isEmpty(),
      check('severity', '严重程度无效').optional().isIn(['low', 'medium', 'high', 'critical']),
      check('status', '状态无效').optional().isIn(['open', 'in_progress', 'testing', 'resolved', 'closed']),
      check('sprintId', 'Sprint ID格式无效').optional().isNumeric(),
      check('assignedTo', '指派用户ID格式无效').optional().isNumeric(),
      check('stepsToReproduce', '复现步骤是必填项').optional()
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
      severity = 'medium',
      status = 'open',
      sprintId,
      assignedTo,
      stepsToReproduce
    } = req.body;

    try {
      // 检查项目是否存在
      const projectResult = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.projectId]);
      
      if (projectResult.rows.length === 0) {
        return res.status(404).json({ msg: '项目不存在' });
      }

      // 检查用户是否有权限访问此项目
      if (!['Scrum Master', 'Product Owner', 'Tester'].includes(req.user.role)) {
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

      // 创建缺陷
      const result = await db.query(
        `INSERT INTO bugs (
          project_id, sprint_id, title, description, severity, status,
          steps_to_reproduce, reported_by, assigned_to
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING id, project_id, sprint_id, title, description, severity, status,
                  steps_to_reproduce, reported_by, assigned_to, created_at, updated_at`,
        [
          req.params.projectId,
          sprintId || null,
          title,
          description,
          severity,
          status,
          stepsToReproduce || null,
          req.user.id,
          assignedTo || null
        ]
      );
      
      // 获取报告者和指派者信息
      const bug = result.rows[0];
      
      const reporterResult = await db.query(
        'SELECT id, name FROM users WHERE id = $1',
        [bug.reported_by]
      );
      
      if (reporterResult.rows.length > 0) {
        bug.reporter = reporterResult.rows[0];
      }
      
      if (bug.assigned_to) {
        const assigneeResult = await db.query(
          'SELECT id, name FROM users WHERE id = $1',
          [bug.assigned_to]
        );
        
        if (assigneeResult.rows.length > 0) {
          bug.assignee = assigneeResult.rows[0];
        }
      }
      
      res.status(201).json(bug);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   GET api/projects/:projectId/bugs
// @desc    获取项目的所有缺陷
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // 检查用户是否有权限访问此项目
    if (!['Scrum Master', 'Product Owner', 'Tester'].includes(req.user.role)) {
      const memberCheck = await db.query(
        'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
        [req.params.projectId, req.user.id]
      );
      
      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ msg: '权限不足，无法访问此项目' });
      }
    }

    // 获取查询参数
    const { sprintId, status, severity, assignedTo } = req.query;
    
    // 构建查询条件
    let query = `
      SELECT b.id, b.title, b.description, b.severity, b.status, 
             b.sprint_id, b.created_at, b.updated_at,
             r.id as reporter_id, r.name as reporter_name,
             a.id as assignee_id, a.name as assignee_name
      FROM bugs b
      LEFT JOIN users r ON b.reported_by = r.id
      LEFT JOIN users a ON b.assigned_to = a.id
      WHERE b.project_id = $1
    `;
    
    const queryParams = [req.params.projectId];
    let paramIndex = 2;
    
    if (sprintId) {
      query += ` AND b.sprint_id = $${paramIndex}`;
      queryParams.push(sprintId);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND b.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }
    
    if (severity) {
      query += ` AND b.severity = $${paramIndex}`;
      queryParams.push(severity);
      paramIndex++;
    }
    
    if (assignedTo) {
      query += ` AND b.assigned_to = $${paramIndex}`;
      queryParams.push(assignedTo);
      paramIndex++;
    }
    
    query += ' ORDER BY CASE b.severity WHEN \'critical\' THEN 1 WHEN \'high\' THEN 2 WHEN \'medium\' THEN 3 WHEN \'low\' THEN 4 END, b.created_at DESC';
    
    // 执行查询
    const result = await db.query(query, queryParams);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/projects/:projectId/bugs/:id
// @desc    获取单个缺陷
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    // 检查用户是否有权限访问此项目
    if (!['Scrum Master', 'Product Owner', 'Tester'].includes(req.user.role)) {
      const memberCheck = await db.query(
        'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
        [req.params.projectId, req.user.id]
      );
      
      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ msg: '权限不足，无法访问此项目' });
      }
    }

    // 获取缺陷信息
    const bugResult = await db.query(
      `SELECT b.*, 
              r.id as reporter_id, r.name as reporter_name,
              a.id as assignee_id, a.name as assignee_name,
              sp.id as sprint_id, sp.name as sprint_name
       FROM bugs b
       LEFT JOIN users r ON b.reported_by = r.id
       LEFT JOIN users a ON b.assigned_to = a.id
       LEFT JOIN sprints sp ON b.sprint_id = sp.id
       WHERE b.id = $1 AND b.project_id = $2`,
      [req.params.id, req.params.projectId]
    );
    
    if (bugResult.rows.length === 0) {
      return res.status(404).json({ msg: '缺陷不存在' });
    }

    const bug = bugResult.rows[0];

    // 获取缺陷的评论
    const commentsResult = await db.query(
      `SELECT c.id, c.content, c.created_at,
              u.id as user_id, u.name as user_name, u.avatar
       FROM bug_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.bug_id = $1
       ORDER BY c.created_at`,
      [req.params.id]
    );

    // 获取缺陷的历史记录
    const historyResult = await db.query(
      `SELECT h.id, h.field, h.old_value, h.new_value, h.created_at,
              u.id as user_id, u.name as user_name
       FROM bug_history h
       JOIN users u ON h.user_id = u.id
       WHERE h.bug_id = $1
       ORDER BY h.created_at DESC`,
      [req.params.id]
    );

    // 构建完整的缺陷对象
    const fullBug = {
      ...bug,
      comments: commentsResult.rows,
      history: historyResult.rows
    };

    res.json(fullBug);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   PUT api/projects/:projectId/bugs/:id
// @desc    更新缺陷
// @access  Private
router.put(
  '/:id',
  [
    auth,
    logger('bug'),
    [
      check('title', '缺陷标题是必填项').optional().not().isEmpty(),
      check('description', '缺陷描述是必填项').optional(),
      check('severity', '严重程度无效').optional().isIn(['low', 'medium', 'high', 'critical']),
      check('status', '状态无效').optional().isIn(['open', 'in_progress', 'testing', 'resolved', 'closed']),
      check('sprintId', 'Sprint ID格式无效').optional().isNumeric(),
      check('assignedTo', '指派用户ID格式无效').optional().isNumeric(),
      check('stepsToReproduce', '复现步骤是必填项').optional()
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
      severity,
      status,
      sprintId,
      assignedTo,
      stepsToReproduce
    } = req.body;

    try {
      // 检查缺陷是否存在
      let result = await db.query(
        'SELECT * FROM bugs WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: '缺陷不存在' });
      }

      const bug = result.rows[0];

      // 检查用户是否有权限访问此项目
      if (!['Scrum Master', 'Product Owner', 'Tester'].includes(req.user.role)) {
        const memberCheck = await db.query(
          'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
          [req.params.projectId, req.user.id]
        );
        
        if (memberCheck.rows.length === 0) {
          return res.status(403).json({ msg: '权限不足，无法访问此项目' });
        }
      }

      // 构建更新字段
      const updateFields = [];
      const values = [];
      let valueIndex = 1;

      // 记录历史变更
      const historyEntries = [];

      if (title && title !== bug.title) {
        updateFields.push(`title = $${valueIndex}`);
        values.push(title);
        valueIndex++;
        historyEntries.push({
          field: 'title',
          oldValue: bug.title,
          newValue: title
        });
      }

      if (description !== undefined && description !== bug.description) {
        updateFields.push(`description = $${valueIndex}`);
        values.push(description);
        valueIndex++;
        historyEntries.push({
          field: 'description',
          oldValue: bug.description,
          newValue: description
        });
      }

      if (severity && severity !== bug.severity) {
        updateFields.push(`severity = $${valueIndex}`);
        values.push(severity);
        valueIndex++;
        historyEntries.push({
          field: 'severity',
          oldValue: bug.severity,
          newValue: severity
        });
      }

      if (status && status !== bug.status) {
        updateFields.push(`status = $${valueIndex}`);
        values.push(status);
        valueIndex++;
        historyEntries.push({
          field: 'status',
          oldValue: bug.status,
          newValue: status
        });
      }

      if (sprintId !== undefined && sprintId !== bug.sprint_id) {
        updateFields.push(`sprint_id = $${valueIndex}`);
        values.push(sprintId === null ? null : sprintId);
        valueIndex++;
        historyEntries.push({
          field: 'sprint_id',
          oldValue: bug.sprint_id,
          newValue: sprintId
        });
      }

      if (assignedTo !== undefined && assignedTo !== bug.assigned_to) {
        updateFields.push(`assigned_to = $${valueIndex}`);
        values.push(assignedTo === null ? null : assignedTo);
        valueIndex++;
        historyEntries.push({
          field: 'assigned_to',
          oldValue: bug.assigned_to,
          newValue: assignedTo
        });
      }

      if (stepsToReproduce !== undefined && stepsToReproduce !== bug.steps_to_reproduce) {
        updateFields.push(`steps_to_reproduce = $${valueIndex}`);
        values.push(stepsToReproduce);
        valueIndex++;
        historyEntries.push({
          field: 'steps_to_reproduce',
          oldValue: bug.steps_to_reproduce,
          newValue: stepsToReproduce
        });
      }

      // 如果没有要更新的字段，则返回原始缺陷
      if (updateFields.length === 0) {
        return res.json(bug);
      }

      // 添加缺陷ID和项目ID到values数组
      values.push(req.params.id);
      values.push(req.params.projectId);

      // 执行更新
      result = await db.query(
        `UPDATE bugs SET ${updateFields.join(', ')}, updated_at = NOW() 
         WHERE id = $${valueIndex} AND project_id = $${valueIndex + 1}
         RETURNING id, project_id, sprint_id, title, description, severity, status,
                   steps_to_reproduce, reported_by, assigned_to, created_at, updated_at`,
        values
      );
      
      // 记录历史变更
      for (const entry of historyEntries) {
        await db.query(
          `INSERT INTO bug_history (
            bug_id, field, old_value, new_value, user_id
          ) VALUES ($1, $2, $3, $4, $5)`,
          [req.params.id, entry.field, entry.oldValue, entry.newValue, req.user.id]
        );
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   POST api/projects/:projectId/bugs/:id/comments
// @desc    添加缺陷评论
// @access  Private
router.post(
  '/:id/comments',
  [
    auth,
    logger('bug_comment'),
    [
      check('content', '评论内容是必填项').not().isEmpty()
    ]
  ],
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;

    try {
      // 检查缺陷是否存在
      const bugCheck = await db.query(
        'SELECT * FROM bugs WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      if (bugCheck.rows.length === 0) {
        return res.status(404).json({ msg: '缺陷不存在' });
      }

      // 检查用户是否有权限访问此项目
      if (!['Scrum Master', 'Product Owner', 'Tester'].includes(req.user.role)) {
        const memberCheck = await db.query(
          'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
          [req.params.projectId, req.user.id]
        );
        
        if (memberCheck.rows.length === 0) {
          return res.status(403).json({ msg: '权限不足，无法访问此项目' });
        }
      }

      // 添加评论
      const result = await db.query(
        `INSERT INTO bug_comments (
          bug_id, user_id, content
        ) VALUES ($1, $2, $3) 
        RETURNING id, bug_id, user_id, content, created_at`,
        [req.params.id, req.user.id, content]
      );
      
      // 获取用户信息
      const comment = result.rows[0];
      const userResult = await db.query(
        'SELECT id, name, avatar FROM users WHERE id = $1',
        [comment.user_id]
      );
      
      if (userResult.rows.length > 0) {
        comment.user = userResult.rows[0];
      }
      
      res.status(201).json(comment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   DELETE api/projects/:projectId/bugs/:id
// @desc    删除缺陷
// @access  Private (Scrum Master, Product Owner, Tester)
router.delete(
  '/:id',
  [auth, logger('bug')],
  async (req, res) => {
    try {
      // 检查缺陷是否存在
      const result = await db.query(
        'SELECT * FROM bugs WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: '缺陷不存在' });
      }

      const bug = result.rows[0];

      // 检查用户是否有权限删除此缺陷
      // 只有Scrum Master、Product Owner和缺陷报告者可以删除缺陷
      if (!['Scrum Master', 'Product Owner'].includes(req.user.role) && 
          bug.reported_by !== req.user.id) {
        return res.status(403).json({ msg: '权限不足，无法删除此缺陷' });
      }

      // 删除缺陷评论
      await db.query(
        'DELETE FROM bug_comments WHERE bug_id = $1',
        [req.params.id]
      );

      // 删除缺陷历史记录
      await db.query(
        'DELETE FROM bug_history WHERE bug_id = $1',
        [req.params.id]
      );

      // 删除缺陷
      await db.query(
        'DELETE FROM bugs WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      res.json({ msg: '缺陷已删除' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

module.exports = router;