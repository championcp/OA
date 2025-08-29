const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../config/db');

// @route   POST api/auth/register
// @desc    注册用户
// @access  Public
router.post(
  '/register',
  [
    check('name', '姓名是必填项').not().isEmpty(),
    check('email', '请输入有效的电子邮箱').isEmail(),
    check('password', '请输入至少6个字符的密码').isLength({ min: 6 }),
    check('role', '角色无效').optional().isIn([
      'Scrum Master',
      'Product Owner',
      'Developer',
      'Designer',
      'Tester',
      'Stakeholder'
    ])
  ],
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role = 'Developer' } = req.body;

    try {
      // 检查用户是否已存在
      let result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      
      if (result.rows.length > 0) {
        return res.status(400).json({ msg: '该邮箱已被注册' });
      }

      // 加密密码
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 创建用户
      result = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        [name, email, hashedPassword, role]
      );

      const user = result.rows[0];

      // 创建JWT
      const payload = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   POST api/auth/login
// @desc    用户登录
// @access  Public
router.post(
  '/login',
  [
    check('email', '请输入有效的电子邮箱').isEmail(),
    check('password', '密码是必填项').exists()
  ],
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // 检查用户是否存在
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      
      if (result.rows.length === 0) {
        return res.status(400).json({ msg: '无效的凭据' });
      }

      const user = result.rows[0];

      // 验证密码
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(400).json({ msg: '无效的凭据' });
      }

      // 创建JWT
      const payload = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   GET api/auth/me
// @desc    获取当前用户
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // 获取用户信息（不包括密码）
    const result = await db.query(
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = $1',
      [req.user.id]
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

module.exports = router;