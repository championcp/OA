// 角色检查中间件
export default function(roles) {
  return function(req, res, next) {
    // 确保用户已通过认证
    if (!req.user) {
      return res.status(401).json({ msg: '无访问权限，未提供认证令牌' });
    }
    
    // 检查用户角色是否在允许的角色列表中
    if (roles && roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ msg: '权限不足，无法访问此资源' });
    }
    
    next();
  };
};