const { ShareLink } = require('../db/models');
const crypto = require('crypto');

class ShareService {
  // 生成分享链接
  async generateShareLink(userId, reportId, options = {}) {
    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (options.expiryDays || 7));
    
    const shareLink = await ShareLink.create({
      token,
      userId,
      reportId,
      expiresAt,
      permissions: options.permissions || ['view']
    });
    
    return {
      url: `/shared/${token}`,
      expiresAt,
      permissions: shareLink.permissions
    };
  }

  // 验证分享链接
  async verifyShareLink(token) {
    const shareLink = await ShareLink.findOne({
      where: { token },
      include: ['report']
    });
    
    if (!shareLink || new Date() > shareLink.expiresAt) {
      return null;
    }
    
    return {
      report: shareLink.report,
      permissions: shareLink.permissions
    };
  }

  // 获取用户的分享链接
  async getUserShareLinks(userId) {
    return await ShareLink.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
  }

  // 撤销分享链接
  async revokeShareLink(userId, token) {
    const deleted = await ShareLink.destroy({
      where: { userId, token }
    });
    return deleted > 0;
  }
}

module.exports = new ShareService();