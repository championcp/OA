const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const favoriteService = require('../services/favorite.service');

// 添加收藏
router.post('/', auth, async (req, res) => {
  try {
    const { reportId, tags } = req.body;
    const favorite = await favoriteService.addFavorite(req.user.id, reportId, tags);
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 移除收藏
router.delete('/:reportId', auth, async (req, res) => {
  try {
    const { reportId } = req.params;
    const success = await favoriteService.removeFavorite(req.user.id, reportId);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取用户收藏
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await favoriteService.getUserFavorites(req.user.id, req.query);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新收藏标签
router.put('/:reportId/tags', auth, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { tags } = req.body;
    const success = await favoriteService.updateFavoriteTags(req.user.id, reportId, tags);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 检查收藏状态
router.get('/:reportId/status', auth, async (req, res) => {
  try {
    const { reportId } = req.params;
    const isFavorite = await favoriteService.isFavorite(req.user.id, reportId);
    res.json({ isFavorite });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;