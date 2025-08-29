const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const templateService = require('../services/retrospectiveTemplate.service');

// 获取所有回顾模板
router.get('/templates', auth, (req, res) => {
  try {
    const templates = templateService.getAllTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 根据ID获取模板详情
router.get('/templates/:templateId', auth, (req, res) => {
  try {
    const { templateId } = req.params;
    const template = templateService.getTemplateById(templateId);
    
    if (!template) {
      return res.status(404).json({ error: '模板未找到' });
    }
    
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 搜索模板
router.get('/templates/search/:query', auth, (req, res) => {
  try {
    const { query } = req.params;
    const results = templateService.searchTemplates(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建自定义模板
router.post('/templates', auth, (req, res) => {
  try {
    const { name, description, categories } = req.body;
    
    if (!name || !categories) {
      return res.status(400).json({ error: '模板名称和分类是必需的' });
    }
    
    const newTemplate = templateService.createCustomTemplate({
      name,
      description,
      categories
    });
    
    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新模板
router.put('/templates/:templateId', auth, (req, res) => {
  try {
    const { templateId } = req.params;
    const updatedTemplate = templateService.updateTemplate(templateId, req.body);
    
    if (!updatedTemplate) {
      return res.status(404).json({ error: '模板未找到' });
    }
    
    res.json(updatedTemplate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除自定义模板
router.delete('/templates/:templateId', auth, (req, res) => {
  try {
    const { templateId } = req.params;
    const success = templateService.deleteTemplate(templateId);
    
    if (!success) {
      return res.status(404).json({ error: '模板未找到或不是自定义模板' });
    }
    
    res.json({ message: '模板删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取模板建议
router.post('/templates/suggestions', auth, (req, res) => {
  try {
    const suggestions = templateService.getTemplateSuggestions(req.body);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 导出模板
router.get('/templates/:templateId/export', auth, (req, res) => {
  try {
    const { templateId } = req.params;
    const { format = 'json' } = req.query;
    
    const exported = templateService.exportTemplate(templateId, format);
    
    if (!exported) {
      return res.status(404).json({ error: '模板未找到' });
    }
    
    // 设置响应头
    res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${templateId}.${format}"`);
    
    res.send(exported);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取模板统计信息
router.get('/templates/stats', auth, (req, res) => {
  try {
    const templates = templateService.getAllTemplates();
    const stats = {
      totalTemplates: templates.length,
      builtInTemplates: templates.filter(t => !t.isCustom).length,
      customTemplates: templates.filter(t => t.isCustom).length,
      byCategoryCount: templates.reduce((acc, template) => {
        const count = template.categories.length;
        acc[count] = (acc[count] || 0) + 1;
        return acc;
      }, {})
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;