import express from 'express';
const router = express.Router({ mergeParams: true });
const { check, validationResult } = require('express-validator');
import auth from '../middleware/auth.js';
import logger from '../middleware/logger.js';
import db from '../config/db.js';

// @route   POST api/projects/:projectId/documents
// @desc    创建文档
// @access  Private
router.post(
  '/',
  [
    auth,
    logger('document'),
    [
      check('title', '文档标题是必填项').not().isEmpty(),
      check('content', '文档内容是必填项').not().isEmpty(),
      check('type', '文档类型无效').optional().isIn(['requirement', 'meeting', 'design', 'other'])
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
      content,
      type = 'other'
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

      // 创建文档
      const result = await db.query(
        `INSERT INTO documents (
          project_id, title, content, type, created_by
        ) VALUES ($1, $2, $3, $4, $5) 
        RETURNING id, project_id, title, content, type, created_by, created_at, updated_at`,
        [
          req.params.projectId,
          title,
          content,
          type,
          req.user.id
        ]
      );
      
      // 获取创建者信息
      const document = result.rows[0];
      const creatorResult = await db.query(
        'SELECT id, name FROM users WHERE id = $1',
        [document.created_by]
      );
      
      if (creatorResult.rows.length > 0) {
        document.creator = creatorResult.rows[0];
      }
      
      res.status(201).json(document);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   GET api/projects/:projectId/documents
// @desc    获取项目的所有文档
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
    const { type } = req.query;
    
    // 构建查询条件
    let query = `
      SELECT d.id, d.title, d.type, d.created_at, d.updated_at,
             u.id as creator_id, u.name as creator_name
      FROM documents d
      LEFT JOIN users u ON d.created_by = u.id
      WHERE d.project_id = $1
    `;
    
    const queryParams = [req.params.projectId];
    let paramIndex = 2;
    
    if (type) {
      query += ` AND d.type = $${paramIndex}`;
      queryParams.push(type);
      paramIndex++;
    }
    
    query += ' ORDER BY d.updated_at DESC';
    
    // 执行查询
    const result = await db.query(query, queryParams);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/projects/:projectId/documents/:id
// @desc    获取单个文档
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

    // 获取文档信息
    const documentResult = await db.query(
      `SELECT d.*, 
              u.id as creator_id, u.name as creator_name
       FROM documents d
       LEFT JOIN users u ON d.created_by = u.id
       WHERE d.id = $1 AND d.project_id = $2`,
      [req.params.id, req.params.projectId]
    );
    
    if (documentResult.rows.length === 0) {
      return res.status(404).json({ msg: '文档不存在' });
    }

    // 获取文档的历史版本
    const historyResult = await db.query(
      `SELECT h.id, h.content, h.created_at,
              u.id as editor_id, u.name as editor_name
       FROM document_history h
       JOIN users u ON h.edited_by = u.id
       WHERE h.document_id = $1
       ORDER BY h.created_at DESC`,
      [req.params.id]
    );

    // 构建完整的文档对象
    const fullDocument = {
      ...documentResult.rows[0],
      history: historyResult.rows
    };

    res.json(fullDocument);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   PUT api/projects/:projectId/documents/:id
// @desc    更新文档
// @access  Private
router.put(
  '/:id',
  [
    auth,
    logger('document'),
    [
      check('title', '文档标题是必填项').optional().not().isEmpty(),
      check('content', '文档内容是必填项').optional().not().isEmpty(),
      check('type', '文档类型无效').optional().isIn(['requirement', 'meeting', 'design', 'other'])
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
      content,
      type
    } = req.body;

    try {
      // 检查文档是否存在
      let result = await db.query(
        'SELECT * FROM documents WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: '文档不存在' });
      }

      const document = result.rows[0];

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

      // 如果内容有变化，保存历史版本
      if (content && content !== document.content) {
        await db.query(
          `INSERT INTO document_history (
            document_id, content, edited_by
          ) VALUES ($1, $2, $3)`,
          [req.params.id, document.content, req.user.id]
        );
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

      if (content) {
        updateFields.push(`content = $${valueIndex}`);
        values.push(content);
        valueIndex++;
      }

      if (type) {
        updateFields.push(`type = $${valueIndex}`);
        values.push(type);
        valueIndex++;
      }

      // 如果没有要更新的字段，则返回原始文档
      if (updateFields.length === 0) {
        return res.json(document);
      }

      // 添加文档ID和项目ID到values数组
      values.push(req.params.id);
      values.push(req.params.projectId);

      // 执行更新
      result = await db.query(
        `UPDATE documents SET ${updateFields.join(', ')}, updated_at = NOW() 
         WHERE id = $${valueIndex} AND project_id = $${valueIndex + 1}
         RETURNING id, project_id, title, content, type, created_by, created_at, updated_at`,
        values
      );
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   DELETE api/projects/:projectId/documents/:id
// @desc    删除文档
// @access  Private
router.delete(
  '/:id',
  [auth, logger('document')],
  async (req, res) => {
    try {
      // 检查文档是否存在
      const result = await db.query(
        'SELECT * FROM documents WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: '文档不存在' });
      }

      const document = result.rows[0];

      // 检查用户是否有权限删除此文档
      // 只有Scrum Master、Product Owner和文档创建者可以删除文档
      if (!['Scrum Master', 'Product Owner'].includes(req.user.role) && 
          document.created_by !== req.user.id) {
        return res.status(403).json({ msg: '权限不足，无法删除此文档' });
      }

      // 删除文档历史记录
      await db.query(
        'DELETE FROM document_history WHERE document_id = $1',
        [req.params.id]
      );

      // 删除文档
      await db.query(
        'DELETE FROM documents WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      res.json({ msg: '文档已删除' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

export default router;