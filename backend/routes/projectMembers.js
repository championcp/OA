const express = require('express');
const router = express.Router({ mergeParams: true });
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const logger = require('../middleware/logger');
const db = require('../config/db');

// @route   POST api/projects/:projectId/members
// @desc    添加项目成员
// @access  Private (Scrum Master)
router.post(
  '/',
  [
    auth,
    roleCheck(['Scrum Master']),
    logger('project_member'),
    [
      check('userId', '用户ID是必填项').not().isEmpty(),
      check('role', '角色无效').isIn([
        'Scrum Master',
        'Product Owner',
        'Developer',
        'Designer',
        'Tester',
        'Stakeholder'
      ])
    ]
  ],
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, role } = req.body;

    try {
      // 检查项目是否存在
      let result = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.projectId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: '项目不存在' });
      }

      // 检查用户是否存在
      result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: '用户不存在' });
      }

      // 检查用户是否已经是项目成员
      result = await db.query(
        'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
        [req.params.projectId, userId]
      );
      
      if (result.rows.length > 0) {
        return res.status(400).json({ msg: '用户已经是项目成员' });
      }

      // 添加项目成员
      result = await db.query(
        `INSERT INTO project_members (project_id, user_id, role) 
         VALUES ($1, $2, $3) 
         RETURNING id, project_id, user_id, role, joined_at`,
        [req.params.projectId, userId, role]
      );
      
      // 获取用户信息
      const userResult = await db.query(
        'SELECT id, name, email, avatar FROM users WHERE id = $1',
        [userId]
      );

      res.status(201).json({
        ...result.rows[0],
        user: userResult.rows[0]
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   GET api/projects/:projectId/members
// @desc    获取项目成员
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

    // 获取项目成员
    const result = await db.query(
      `SELECT pm.id, pm.role, pm.joined_at, u.id as user_id, u.name, u.email, u.avatar
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1
       ORDER BY pm.joined_at`,
      [req.params.projectId]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   PUT api/projects/:projectId/members/:userId
// @desc    更新项目成员角色
// @access  Private (Scrum Master)
router.put(
  '/:userId',
  [
    auth,
    roleCheck(['Scrum Master']),
    logger('project_member'),
    [
      check('role', '角色无效').isIn([
        'Scrum Master',
        'Product Owner',
        'Developer',
        'Designer',
        'Tester',
        'Stakeholder'
      ])
    ]
  ],
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.body;

    try {
      // 检查项目成员是否存在
      let result = await db.query(
        'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
        [req.params.projectId, req.params.userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: '项目成员不存在' });
      }

      // 更新项目成员角色
      result = await db.query(
        `UPDATE project_members SET role = $1 
         WHERE project_id = $2 AND user_id = $3 
         RETURNING id, project_id, user_id, role, joined_at`,
        [role, req.params.projectId, req.params.userId]
      );
      
      // 获取用户信息
      const userResult = await db.query(
        'SELECT id, name, email, avatar FROM users WHERE id = $1',
        [req.params.userId]
      );

      res.json({
        ...result.rows[0],
        user: userResult.rows[0]
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   DELETE api/projects/:projectId/members/:userId
// @desc    移除项目成员
// @access  Private (Scrum Master)
router.delete(
  '/:userId',
  [auth, roleCheck(['Scrum Master']), logger('project_member')],
  async (req, res) => {
    try {
      // 检查项目成员是否存在
      const result = await db.query(
        'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
        [req.params.projectId, req.params.userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: '项目成员不存在' });
      }

      // 检查是否尝试移除最后一个Scrum Master
      if (result.rows[0].role === 'Scrum Master') {
        const scrumMasterCount = await db.query(
          'SELECT COUNT(*) FROM project_members WHERE project_id = $1 AND role = $2',
          [req.params.projectId, 'Scrum Master']
        );
        
        if (scrumMasterCount.rows[0].count <= 1) {
          return res.status(400).json({ msg: '无法移除项目的最后一个Scrum Master' });
        }
      }

      // 移除项目成员
      await db.query(
        'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2',
        [req.params.projectId, req.params.userId]
      );
      
      res.json({ msg: '项目成员已移除' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

module.exports = router;