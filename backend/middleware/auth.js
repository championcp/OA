import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// 认证中间件
export default function(req, res, next) {
  // 从请求头获取token
  const token = req.header('x-auth-token');
  
  // 检查是否有token
  if (!token) {
    return res.status(401).json({ msg: '无访问权限，未提供认证令牌' });
  }
  
  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 将用户信息添加到请求对象
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: '令牌无效' });
  }
};