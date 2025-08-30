const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const shareService = require('../services/share.service');

// 生成分享链接
router.post('/', auth, async (req, res) => {
  try {
    const { reportId, expiryDays, permissions } = req.body;
    const shareLink = await shareService.generateShareLink(
      req.user.id, 
      reportId, 
      { expiryDays, permissions }
    );
    res.status(201).json(shareLink);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取用户的分享链接
router.get('/', auth, async (req, res) => {
  try {
    const shareLinks = await shareService.getUserShareLinks(req.user.id);
    res.json(shareLinks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 撤销分享链接
router.delete('/:token', auth, async (req, res) => {
  try {
    const { token } = req.params;
    const success = await shareService.revokeShareLink(req.user.id, token);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 公开访问分享链接
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const shareData = await shareService.verifyShareLink(token);
    
    if (!shareData) {
      return res.status(404).json({ error: '分享链接无效或已过期' });
    }
    
    res.json({
      report: shareData.report,
      permissions: shareData.permissions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;