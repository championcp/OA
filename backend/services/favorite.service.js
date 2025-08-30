const { ReportFavorite } = require('../db/models');

class FavoriteService {
  // 添加收藏
  async addFavorite(userId, reportId, tags = []) {
    const [favorite, created] = await ReportFavorite.findOrCreate({
      where: { userId, reportId },
      defaults: { tags }
    });
    
    if (!created) {
      await favorite.update({ tags });
    }
    
    return favorite;
  }

  // 移除收藏
  async removeFavorite(userId, reportId) {
    const deleted = await ReportFavorite.destroy({
      where: { userId, reportId }
    });
    return deleted > 0;
  }

  // 获取用户收藏
  async getUserFavorites(userId, options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    return await ReportFavorite.findAll({
      where: { userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }

  // 更新收藏标签
  async updateFavoriteTags(userId, reportId, tags) {
    const [affectedRows] = await ReportFavorite.update(
      { tags },
      { where: { userId, reportId } }
    );
    
    return affectedRows > 0;
  }

  // 检查是否已收藏
  async isFavorite(userId, reportId) {
    const count = await ReportFavorite.count({
      where: { userId, reportId }
    });
    return count > 0;
  }
}

module.exports = new FavoriteService();