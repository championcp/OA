import express from 'express';
const router = express.Router({ mergeParams: true });
const { check, validationResult } = require('express-validator');
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import logger from '../middleware/logger.js';
import db from '../config/db.js';

// @route   POST api/projects/:projectId/releases
// @desc    创建版本发布
// @access  Private (Product Owner, Scrum Master)
router.post(
  '/',
  [
    auth,
    roleCheck(['Product Owner', 'Scrum Master']),
    logger('release'),
    [
      check('version', '版本号是必填项').not().isEmpty(),
      check('name', '版本名称是必填项').not().isEmpty(),
      check('description', '版本描述是必填项').not().isEmpty(),
      check('releaseDate', '发布日期格式无效').optional().isISO8601(),
      check('status', '状态无效').optional().isIn(['planned', 'in_progress', 'released'])
    ]
  ],
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      version,
      name,
      description,
      releaseDate,
      status = 'planned'
    } = req.body;

    try {
      // 检查项目是否存在
      const projectResult = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.projectId]);
      
      if (projectResult.rows.length === 0) {
        return res.status(404).json({ msg: '项目不存在' });
      }

      // 检查版本号是否已存在
      const versionCheck = await db.query(
        'SELECT * FROM releases WHERE project_id = $1 AND version = $2',
        [req.params.projectId, version]
      );
      
      if (versionCheck.rows.length > 0) {
        return res.status(400).json({ msg: '版本号已存在' });
      }

      // 创建版本发布
      const result = await db.query(
        `INSERT INTO releases (
          project_id, version, name, description, release_date, status, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING id, project_id, version, name, description, release_date, status, created_by, created_at`,
        [
          req.params.projectId,
          version,
          name,
          description,
          releaseDate || null,
          status,
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

// @route   GET api/projects/:projectId/releases
// @desc    获取项目的所有版本发布
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
      SELECT r.id, r.version, r.name, r.description, r.release_date, r.status, 
             r.created_at, r.updated_at,
             u.id as creator_id, u.name as creator_name,
             COUNT(s.id) as sprint_count
      FROM releases r
      LEFT JOIN users u ON r.created_by = u.id
      LEFT JOIN sprints s ON r.id = s.release_id
      WHERE r.project_id = $1
    `;
    
    const queryParams = [req.params.projectId];
    let paramIndex = 2;
    
    if (status) {
      query += ` AND r.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }
    
    query += ' GROUP BY r.id, u.id, u.name ORDER BY r.release_date DESC';
    
    // 执行查询
    const result = await db.query(query, queryParams);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/projects/:projectId/releases/:id
// @desc    获取单个版本发布
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

    // 获取版本发布信息
    const releaseResult = await db.query(
      `SELECT r.*, 
              u.id as creator_id, u.name as creator_name
       FROM releases r
       LEFT JOIN users u ON r.created_by = u.id
       WHERE r.id = $1 AND r.project_id = $2`,
      [req.params.id, req.params.projectId]
    );
    
    if (releaseResult.rows.length === 0) {
      return res.status(404).json({ msg: '版本发布不存在' });
    }

    const release = releaseResult.rows[0];

    // 获取关联的Sprint
    const sprintsResult = await db.query(
      `SELECT s.id, s.name, s.start_date, s.end_date, s.status,
              COUNT(st.id) as story_count,
              SUM(st.points) as total_points
       FROM sprints s
       LEFT JOIN stories st ON s.id = st.sprint_id
       WHERE s.release_id = $1
       GROUP BY s.id
       ORDER BY s.start_date`,
      [req.params.id]
    );

    // 获取关联的用户故事
    const storiesResult = await db.query(
      `SELECT s.id, s.title, s.status, s.priority, s.points,
              e.id as epic_id, e.title as epic_title,
              sp.id as sprint_id, sp.name as sprint_name
       FROM stories s
       LEFT JOIN epics e ON s.epic_id = e.id
       LEFT JOIN sprints sp ON s.sprint_id = sp.id
       WHERE sp.release_id = $1
       ORDER BY s.priority DESC, s.created_at`,
      [req.params.id]
    );

    // 获取关联的缺陷
    const bugsResult = await db.query(
      `SELECT b.id, b.title, b.severity, b.status,
              u.id as assignee_id, u.name as assignee_name
       FROM bugs b
       LEFT JOIN users u ON b.assigned_to = u.id
       LEFT JOIN sprints s ON b.sprint_id = s.id
       WHERE s.release_id = $1
       ORDER BY CASE b.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END, b.created_at`,
      [req.params.id]
    );

    // 构建完整的版本发布对象
    const fullRelease = {
      ...release,
      sprints: sprintsResult.rows,
      stories: storiesResult.rows,
      bugs: bugsResult.rows
    };

    res.json(fullRelease);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   PUT api/projects/:projectId/releases/:id
// @desc    更新版本发布
// @access  Private (Product Owner, Scrum Master)
router.put(
  '/:id',
  [
    auth,
    roleCheck(['Product Owner', 'Scrum Master']),
    logger('release'),
    [
      check('version', '版本号是必填项').optional().not().isEmpty(),
      check('name', '版本名称是必填项').optional().not().isEmpty(),
      check('description', '版本描述是必填项').optional(),
      check('releaseDate', '发布日期格式无效').optional().isISO8601(),
      check('status', '状态无效').optional().isIn(['planned', 'in_progress', 'released'])
    ]
  ],
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      version,
      name,
      description,
      releaseDate,
      status
    } = req.body;

    try {
      // 检查版本发布是否存在
      let result = await db.query(
        'SELECT * FROM releases WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: '版本发布不存在' });
      }

      const release = result.rows[0];

      // 如果提供了新版本号，检查是否已存在
      if (version && version !== release.version) {
        const versionCheck = await db.query(
          'SELECT * FROM releases WHERE project_id = $1 AND version = $2 AND id != $3',
          [req.params.projectId, version, req.params.id]
        );
        
        if (versionCheck.rows.length > 0) {
          return res.status(400).json({ msg: '版本号已存在' });
        }
      }

      // 构建更新字段
      const updateFields = [];
      const values = [];
      let valueIndex = 1;

      if (version) {
        updateFields.push(`version = $${valueIndex}`);
        values.push(version);
        valueIndex++;
      }

      if (name) {
        updateFields.push(`name = $${valueIndex}`);
        values.push(name);
        valueIndex++;
      }

      if (description !== undefined) {
        updateFields.push(`description = $${valueIndex}`);
        values.push(description);
        valueIndex++;
      }

      if (releaseDate !== undefined) {
        updateFields.push(`release_date = $${valueIndex}`);
        values.push(releaseDate === null ? null : releaseDate);
        valueIndex++;
      }

      if (status) {
        updateFields.push(`status = $${valueIndex}`);
        values.push(status);
        valueIndex++;
      }

      // 如果没有要更新的字段，则返回原始版本发布
      if (updateFields.length === 0) {
        return res.json(release);
      }

      // 添加版本发布ID和项目ID到values数组
      values.push(req.params.id);
      values.push(req.params.projectId);

      // 执行更新
      result = await db.query(
        `UPDATE releases SET ${updateFields.join(', ')}, updated_at = NOW() 
         WHERE id = $${valueIndex} AND project_id = $${valueIndex + 1}
         RETURNING id, project_id, version, name, description, release_date, status, created_by, created_at, updated_at`,
        values
      );
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   POST api/projects/:projectId/releases/:id/sprints
// @desc    将Sprint关联到版本发布
// @access  Private (Product Owner, Scrum Master)
router.post(
  '/:id/sprints',
  [
    auth,
    roleCheck(['Product Owner', 'Scrum Master']),
    logger('release_sprint'),
    [
      check('sprintId', 'Sprint ID是必填项').not().isEmpty().isNumeric()
    ]
  ],
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sprintId } = req.body;

    try {
      // 检查版本发布是否存在
      const releaseCheck = await db.query(
        'SELECT * FROM releases WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      if (releaseCheck.rows.length === 0) {
        return res.status(404).json({ msg: '版本发布不存在' });
      }

      // 检查Sprint是否存在
      const sprintCheck = await db.query(
        'SELECT * FROM sprints WHERE id = $1 AND project_id = $2',
        [sprintId, req.params.projectId]
      );
      
      if (sprintCheck.rows.length === 0) {
        return res.status(404).json({ msg: 'Sprint不存在' });
      }

      // 检查Sprint是否已关联到其他版本发布
      if (sprintCheck.rows[0].release_id && sprintCheck.rows[0].release_id !== req.params.id) {
        return res.status(400).json({ msg: 'Sprint已关联到其他版本发布' });
      }

      // 关联Sprint到版本发布
      const result = await db.query(
        `UPDATE sprints SET release_id = $1 
         WHERE id = $2 AND project_id = $3
         RETURNING id, name, start_date, end_date, status, release_id`,
        [req.params.id, sprintId, req.params.projectId]
      );
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   DELETE api/projects/:projectId/releases/:id/sprints/:sprintId
// @desc    从版本发布中移除Sprint
// @access  Private (Product Owner, Scrum Master)
router.delete(
  '/:id/sprints/:sprintId',
  [auth, roleCheck(['Product Owner', 'Scrum Master']), logger('release_sprint')],
  async (req, res) => {
    try {
      // 检查版本发布是否存在
      const releaseCheck = await db.query(
        'SELECT * FROM releases WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      if (releaseCheck.rows.length === 0) {
        return res.status(404).json({ msg: '版本发布不存在' });
      }

      // 检查Sprint是否存在
      const sprintCheck = await db.query(
        'SELECT * FROM sprints WHERE id = $1 AND project_id = $2',
        [req.params.sprintId, req.params.projectId]
      );
      
      if (sprintCheck.rows.length === 0) {
        return res.status(404).json({ msg: 'Sprint不存在' });
      }

      // 检查Sprint是否已关联到此版本发布
      if (sprintCheck.rows[0].release_id !== req.params.id) {
        return res.status(400).json({ msg: 'Sprint未关联到此版本发布' });
      }

      // 从版本发布中移除Sprint
      const result = await db.query(
        `UPDATE sprints SET release_id = NULL 
         WHERE id = $1 AND project_id = $2
         RETURNING id, name, start_date, end_date, status, release_id`,
        [req.params.sprintId, req.params.projectId]
      );
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route   DELETE api/projects/:projectId/releases/:id
// @desc    删除版本发布
// @access  Private (Product Owner, Scrum Master)
router.delete(
  '/:id',
  [auth, roleCheck(['Product Owner', 'Scrum Master']), logger('release')],
  async (req, res) => {
    try {
      // 检查版本发布是否存在
      const result = await db.query(
        'SELECT * FROM releases WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ msg: '版本发布不存在' });
      }

      // 检查是否有关联的Sprint
      const sprintsCheck = await db.query(
        'SELECT COUNT(*) FROM sprints WHERE release_id = $1',
        [req.params.id]
      );
      
      if (parseInt(sprintsCheck.rows[0].count) > 0) {
        return res.status(400).json({ msg: '无法删除，此版本发布下有关联的Sprint' });
      }

      // 删除版本发布
      await db.query(
        'DELETE FROM releases WHERE id = $1 AND project_id = $2',
        [req.params.id, req.params.projectId]
      );
      
      res.json({ msg: '版本发布已删除' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

export default router;