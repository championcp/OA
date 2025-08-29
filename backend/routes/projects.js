const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const logger = require('../middleware/logger');
const db = require('../config/db');

// @route   POST api/projects
// @desc    创建项目
// @access  Private (Scrum Master, Product Owner)
router.post(
  '/',
  [
    auth,
    roleCheck(['Scrum Master', 'Product Owner']),
    logger('project'),
    [
      check('name', '项目名称是必填项').not().isEmpty(),
      check('description', '项目描述是必填项').not().isEmpty(),
      check('startDate', '开始日期格式无效').optional().isDate(),
      check('endDate', '结束日期格式无效').optional().isDate()
    ]
  ],
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, startDate, endDate, status = 'planning' } = req.body;

    try {
      // 创建项目
      let result = await db.query(
        `INSERT INTO projects (name, description, start_date, end_date, status, created_by) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, name, description, start_date, end_date, status, created_by, created_at`,
        [name, description, startDate, endDate, status, req.user.id]
      );

      const project = result.rows[0];

      // 将创建者添加为项目成员（Scrum Master角色）
      await db.query(
        `INSERT INTO project_members (project_id, user_id, role) 
         VALUES ($1, $2, $3)`,
        [project.id, req.user.id, req.user.role]
      );

      res.status(201).json(project);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   GET api/projects
// @desc    获取所有项目
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let result;
    
    // 根据用户角色获取项目
    if (['Scrum Master', 'Product Owner'].includes(req.user.role)) {
      // Scrum Master和Product Owner可以看到所有项目
      result = await db.query(
        `SELECT p.id, p.name, p.description, p.status, p.start_date, p.end_date, 
                p.created_at, u.name as created_by_name
         FROM projects p
         LEFT JOIN users u ON p.created_by = u.id
         ORDER BY p.created_at DESC`
      );
    } else {
      // 其他角色只能看到自己参与的项目
      result = await db.query(
        `SELECT p.id, p.name, p.description, p.status, p.start_date, p.end_date, 
                p.created_at, u.name as created_by_name
         FROM projects p
         LEFT JOIN users u ON p.created_by = u.id
         JOIN project_members pm ON p.id = pm.project_id
         WHERE pm.user_id = $1
         ORDER BY p.created_at DESC`,
        [req.user.id]
      );
    }
    
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/projects/:id
// @desc    获取单个项目
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    // 检查用户是否有权限访问此项目
    if (!['Scrum Master', 'Product Owner'].includes(req.user.role)) {
      const memberCheck = await db.query(
        'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
        [req.params.id, req.user.id]
      );
      
      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ msg: '权限不足，无法访问此项目' });
      }
    }

    // 获取项目信息
    const projectResult = await db.query(
      `SELECT p.*, u.name as created_by_name
       FROM projects p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ msg: '项目不存在' });
    }

    const project = projectResult.rows[0];

    // 获取项目成员
    const membersResult = await db.query(
      `SELECT u.id, u.name, u.email, u.avatar, pm.role
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1`,
      [req.params.id]
    );

    // 构建完整的项目对象
    const fullProject = {
      ...project,
      team: membersResult.rows
    };

    res.json(fullProject);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   PUT api/projects/:id
// @desc    更新项目
// @access  Private (Scrum Master, Product Owner)
router.put(
  '/:id',
  [
    auth,
    roleCheck(['Scrum Master', 'Product Owner']),
    logger('project'),
    [
      check('name', '项目名称是必填项').optional().not().isEmpty(),
      check('description', '项目描述是必填项').optional().not().isEmpty(),
      check('startDate', '开始日期格式无效').optional().isDate(),
      check('endDate', '结束日期格式无效').optional().isDate(),
      check('status', '状态无效').optional().isIn(['planning', 'active', 'completed', 'on_hold', 'cancelled'])
    ]
  ],
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, startDate, endDate, status } = req.body;

    try {
      // 检查项目是否存在
      let result = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: '项目不存在' });
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

      if (description) {
        updateFields.push(`description = $${valueIndex}`);
        values.push(description);
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

      // 如果没有要更新的字段，则返回原始项目
      if (updateFields.length === 0) {
        return res.json(result.rows[0]);
      }

      // 添加项目ID到values数组
      values.push(req.params.id);

      // 执行更新
      result = await db.query(
        `UPDATE projects SET ${updateFields.join(', ')} WHERE id = $${valueIndex} 
         RETURNING id, name, description, start_date, end_date, status, created_by, created_at, updated_at`,
        values
      );
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   DELETE api/projects/:id
// @desc    删除项目
// @access  Private (Scrum Master)
router.delete(
  '/:id',
  [auth, roleCheck(['Scrum Master']), logger('project')],
  async (req, res) => {
    try {
      // 检查项目是否存在
      const result = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: '项目不存在' });
      }

      // 删除项目（级联删除将自动删除相关记录）
      await db.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
      
      res.json({ msg: '项目已删除' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

module.exports = router;