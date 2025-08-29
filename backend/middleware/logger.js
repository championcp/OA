const db = require('../config/db');

// 活动日志中间件
module.exports = function(entityType) {
  return async function(req, res, next) {
    // 保存原始的res.json方法
    const originalJson = res.json;
    
    // 重写res.json方法以便在响应发送后记录活动
    res.json = function(data) {
      // 调用原始的json方法
      originalJson.call(this, data);
      
      // 如果请求成功且用户已认证，则记录活动
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        try {
          // 确定操作类型
          let action;
          switch (req.method) {
            case 'POST':
              action = 'create';
              break;
            case 'PUT':
            case 'PATCH':
              action = 'update';
              break;
            case 'DELETE':
              action = 'delete';
              break;
            default:
              action = 'view';
          }
          
          // 确定实体ID
          let entityId;
          if (action === 'create') {
            entityId = data.id;
          } else {
            entityId = req.params.id || req.body.id;
          }
          
          // 确定项目ID
          const projectId = req.params.projectId || req.body.projectId || data.projectId;
          
          // 如果有实体ID，则记录活动
          if (entityId) {
            await db.query(
              `INSERT INTO activity_logs (user_id, project_id, entity_type, entity_id, action, details)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                req.user.id,
                projectId,
                entityType,
                entityId,
                action,
                JSON.stringify({
                  url: req.originalUrl,
                  method: req.method,
                  body: req.body
                })
              ]
            );
          }
        } catch (err) {
          console.error('记录活动日志失败:', err);
        }
      }
    };
    
    next();
  };
};