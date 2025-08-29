const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const db = require('../config/db');

// @route   GET api/users
// @desc    获取所有用户
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, avatar FROM users ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/users/:id
// @desc    获取单个用户
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: '用户不存在' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   PUT api/users/:id
// @desc    更新用户
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('name', '姓名是必填项').optional().not().isEmpty(),
      check('email', '请输入有效的电子邮箱').optional().isEmail(),
      check('role', '角色无效').optional().isIn([
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

    // 检查权限（只有自己或Scrum Master可以更新用户）
    if (req.user.id != req.params.id && req.user.role !== 'Scrum Master') {
      return res.status(403).json({ msg: '权限不足，无法更新此用户' });
    }

    const { name, email, role, avatar } = req.body;

    try {
      // 检查用户是否存在
      let result = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: '用户不存在' });
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

      if (email) {
        // 检查邮箱是否已被其他用户使用
        const emailCheck = await db.query(
          'SELECT * FROM users WHERE email = $1 AND id != $2',
          [email, req.params.id]
        );
        
        if (emailCheck.rows.length > 0) {
          return res.status(400).json({ msg: '该邮箱已被其他用户注册' });
        }
        
        updateFields.push(`email = $${valueIndex}`);
        values.push(email);
        valueIndex++;
      }

      if (role) {
        // 只有Scrum Master可以更改角色
        if (req.user.role !== 'Scrum Master') {
          return res.status(403).json({ msg: '权限不足，无法更改用户角色' });
        }
        
        updateFields.push(`role = $${valueIndex}`);
        values.push(role);
        valueIndex++;
      }

      if (avatar) {
        updateFields.push(`avatar = $${valueIndex}`);
        values.push(avatar);
        valueIndex++;
      }

      // 如果没有要更新的字段，则返回原始用户
      if (updateFields.length === 0) {
        return res.json(result.rows[0]);
      }

      // 添加用户ID到values数组
      values.push(req.params.id);

      // 执行更新
      result = await db.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${valueIndex} 
         RETURNING id, name, email, role, avatar, created_at, updated_at`,
        values
      );
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   PUT api/users/:id/password
// @desc    更新用户密码
// @access  Private
router.put(
  '/:id/password',
  [
    auth,
    [
      check('currentPassword', '当前密码是必填项').exists(),
      check('newPassword', '请输入至少6个字符的新密码').isLength({ min: 6 })
    ]
  ],
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 只有用户自己可以更改密码
    if (req.user.id != req.params.id) {
      return res.status(403).json({ msg: '权限不足，无法更改此用户密码' });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      // 获取用户信息
      const result = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: '用户不存在' });
      }

      const user = result.rows[0];

      // 验证当前密码
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        return res.status(400).json({ msg: '当前密码不正确' });
      }

      // 加密新密码
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // 更新密码
      await db.query(
        'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [hashedPassword, req.params.id]
      );
      
      res.json({ msg: '密码已更新' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   DELETE api/users/:id
// @desc    删除用户
// @access  Private (仅限Scrum Master)
router.delete('/:id', [auth, roleCheck(['Scrum Master'])], async (req, res) => {
  try {
    // 检查用户是否存在
    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: '用户不存在' });
    }

    // 删除用户
    await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    
    res.json({ msg: '用户已删除' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

module.exports = router;