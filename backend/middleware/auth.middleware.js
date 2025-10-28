import jwt from 'jsonwebtoken';
import User from '../db/models/user.model.js';
import ProjectMember from '../db/models/projectMember.model.js';
import Project from '../db/models/project.model.js';
import Report from '../db/models/report.model.js';

const authMiddleware = async (req, res, next) => {
  try {
    // 从请求头获取token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }
    
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户及相关项目成员信息
    const user = await User.findByPk(decoded.id, {
      include: [{
        model: ProjectMember,
        as: 'projectMemberships'
      }]
    });
    
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ message: '用户账号已被禁用' });
    }
    
    // 将用户信息添加到请求对象
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '认证令牌已过期' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '无效的认证令牌' });
    }
    
    console.error('认证中间件错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
};

// 权限检查中间件
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;
      
      // 如果用户是管理员，直接通过
      if (req.user.role === 'admin') {
        return next();
      }
      
      // 查找用户在项目中的权限
      // 已经在上方导入ProjectMember
      const membership = await ProjectMember.findOne({
        where: {
          userId,
          projectId
        }
      });
      
      if (!membership) {
        return res.status(403).json({ message: '您没有访问此项目的权限' });
      }
      
      if (!membership.permissions[requiredPermission]) {
        return res.status(403).json({ message: '您没有执行此操作的权限' });
      }
      
      next();
    } catch (error) {
      console.error('权限检查错误:', error);
      return res.status(500).json({ message: '服务器内部错误' });
    }
  };
};

// 报表权限检查
const reportAuth = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findByPk(reportId, {
      include: [{
        model: Project,
        include: [{
          model: ProjectMember,
          where: { userId: req.user.id }
        }]
      }]
    });
    
    if (!report) {
      return res.status(403).json({ message: '报表未找到或无权访问' });
    }
    
    next();
  } catch (error) {
    console.error('报表权限检查错误:', error);
    return res.status(500).json({ message: '服务器内部错误' });
  }
};

const auth = {
  authMiddleware,
  checkPermission,
  reportAuth
};

export default auth;