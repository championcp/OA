class RetrospectiveTemplateService {
  constructor() {
    this.templates = {
      'standard': {
        id: 'standard',
        name: '标准回顾模板',
        description: '适用于大多数团队的通用回顾模板',
        categories: [
          {
            name: '做得好的',
            description: '列出本次迭代中团队做得好的方面',
            questions: [
              '哪些实践或流程效果很好？',
              '团队在哪些方面表现出色？',
              '哪些工具或技术帮助我们提高了效率？'
            ]
          },
          {
            name: '需要改进的',
            description: '识别需要改进的领域',
            questions: [
              '遇到了哪些挑战或障碍？',
              '哪些流程或实践需要调整？',
              '团队在哪些方面可以做得更好？'
            ]
          },
          {
            name: '行动计划',
            description: '制定具体的改进措施',
            questions: [
              '我们应该开始做什么？',
              '我们应该停止做什么？',
              '我们应该继续做什么？'
            ]
          }
        ]
      },
      'start-stop-continue': {
        id: 'start-stop-continue',
        name: '开始/停止/继续',
        description: '经典的回顾框架，专注于行动',
        categories: [
          {
            name: '开始做',
            description: '我们应该开始尝试的新实践',
            questions: [
              '哪些新工具或技术值得尝试？',
              '哪些流程可以引入来改进工作？',
              '我们应该开始培养哪些新习惯？'
            ]
          },
          {
            name: '停止做',
            description: '我们应该停止的低效实践',
            questions: [
              '哪些活动在浪费时间？',
              '哪些流程或会议没有价值？',
              '哪些习惯应该被淘汰？'
            ]
          },
          {
            name: '继续做',
            description: '我们应该继续保持的优秀实践',
            questions: [
              '哪些实践效果很好？',
              '哪些工具或技术帮助我们成功？',
              '哪些团队行为值得保持？'
            ]
          }
        ]
      },
      'four-l': {
        id: 'four-l',
        name: '4L回顾法',
        description: '从四个维度分析迭代表现',
        categories: [
          {
            name: '喜欢的 (Liked)',
            description: '团队喜欢的事情',
            questions: [
              '这次迭代中你喜欢什么？',
              '哪些方面让你感到满意？',
              '哪些成就值得庆祝？'
            ]
          },
          {
            name: '学到的 (Learned)',
            description: '团队学到的新知识',
            questions: [
              '这次迭代中学到了什么？',
              '获得了哪些新的见解？',
              '有哪些新的发现？'
            ]
          },
          {
            name: '缺乏的 (Lacked)',
            description: '团队缺少的资源或支持',
            questions: [
              '缺少哪些资源或支持？',
              '哪些信息或工具是我们需要的？',
              '哪些方面准备不足？'
            ]
          },
          {
            name: '渴望的 (Longed for)',
            description: '团队希望拥有的东西',
            questions: [
              '你希望未来有什么不同？',
              '你渴望什么样的改进？',
              '你期待什么样的变化？'
            ]
          }
        ]
      },
      'sailboat': {
        id: 'sailboat',
        name: '帆船回顾法',
        description: '用帆船比喻来分析团队动力',
        categories: [
          {
            name: '风（推动力）',
            description: '推动团队前进的因素',
            questions: [
              '什么在推动我们前进？',
              '哪些因素帮助我们取得成功？',
              '我们有哪些优势？'
            ]
          },
          {
            name: '锚（阻碍力）',
            description: '拖慢团队进度的因素',
            questions: [
              '什么在拖慢我们的进度？',
              '遇到了哪些障碍？',
              '哪些问题需要解决？'
            ]
          },
          {
            name: '岛屿（目标）',
            description: '团队的目标和愿景',
            questions: [
              '我们的目标是什么？',
              '我们想要达到什么状态？',
              '理想的未来是怎样的？'
            ]
          },
          {
            name: '礁石（风险）',
            description: '可能的风险和挑战',
            questions: [
              '前方有什么风险？',
              '我们需要警惕什么？',
              '可能遇到哪些挑战？'
            ]
          }
        ]
      },
      'mad-sad-glad': {
        id: 'mad-sad-glad',
        name: '情绪回顾法',
        description: '从情绪角度分析团队体验',
        categories: [
          {
            name: '生气的',
            description: '让团队感到沮丧或愤怒的事情',
            questions: [
              '什么让你感到生气或沮丧？',
              '哪些问题让你感到不满？',
              '什么情况让你感到压力？'
            ]
          },
          {
            name: '难过的',
            description: '让团队感到失望或遗憾的事情',
            questions: [
              '什么让你感到失望？',
              '哪些机会被错过了？',
              '什么让你感到遗憾？'
            ]
          },
          {
            name: '高兴的',
            description: '让团队感到开心或满意的事情',
            questions: [
              '什么让你感到高兴？',
              '哪些成就让你感到自豪？',
              '什么让你感到满意？'
            ]
          }
        ]
      }
    };
  }

  // 获取所有模板
  getAllTemplates() {
    return Object.values(this.templates);
  }

  // 根据ID获取模板
  getTemplateById(templateId) {
    return this.templates[templateId] || null;
  }

  // 搜索模板
  searchTemplates(query) {
    const searchTerm = query.toLowerCase();
    return this.getAllTemplates().filter(template =>
      template.name.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm)
    );
  }

  // 创建自定义模板
  createCustomTemplate(templateData) {
    const templateId = `custom-${Date.now()}`;
    const newTemplate = {
      id: templateId,
      ...templateData,
      isCustom: true
    };
    
    this.templates[templateId] = newTemplate;
    return newTemplate;
  }

  // 更新模板
  updateTemplate(templateId, updates) {
    if (!this.templates[templateId]) {
      return null;
    }

    this.templates[templateId] = {
      ...this.templates[templateId],
      ...updates
    };

    return this.templates[templateId];
  }

  // 删除自定义模板
  deleteTemplate(templateId) {
    if (this.templates[templateId] && this.templates[templateId].isCustom) {
      delete this.templates[templateId];
      return true;
    }
    return false;
  }

  // 获取模板建议（基于团队特征）
  getTemplateSuggestions(teamCharacteristics) {
    const { teamSize, experienceLevel, projectComplexity, teamMaturity } = teamCharacteristics;
    
    const suggestions = [];

    // 新手团队建议
    if (experienceLevel === 'beginner' || teamMaturity === 'new') {
      suggestions.push({
        template: this.templates['standard'],
        reason: '简单易用，适合新手团队开始回顾实践'
      });
    }

    // 成熟团队建议
    if (teamMaturity === 'mature' || experienceLevel === 'advanced') {
      suggestions.push({
        template: this.templates['four-l'],
        reason: '全面的分析框架，适合经验丰富的团队深入讨论'
      });
    }

    // 大型团队建议
    if (teamSize === 'large') {
      suggestions.push({
        template: this.templates['sailboat'],
        reason: '视觉化方法适合大型团队分组讨论'
      });
    }

    // 复杂项目建议
    if (projectComplexity === 'high') {
      suggestions.push({
        template: this.templates['mad-sad-glad'],
        reason: '关注情绪健康，适合高压环境下的团队'
      });
    }

    // 确保至少有一个建议
    if (suggestions.length === 0) {
      suggestions.push({
        template: this.templates['start-stop-continue'],
        reason: '行动导向，适用于大多数团队和项目'
      });
    }

    return suggestions;
  }

  // 导出模板为可分享格式
  exportTemplate(templateId, format = 'json') {
    const template = this.getTemplateById(templateId);
    if (!template) {
      return null;
    }

    switch (format) {
      case 'json':
        return JSON.stringify(template, null, 2);
      case 'markdown':
        return this.convertToMarkdown(template);
      default:
        return JSON.stringify(template);
    }
  }

  // 转换为Markdown格式
  convertToMarkdown(template) {
    let markdown = `# ${template.name}\n\n`;
    markdown += `${template.description}\n\n`;

    template.categories.forEach(category => {
      markdown += `## ${category.name}\n`;
      markdown += `${category.description}\n\n`;
      
      category.questions.forEach((question, index) => {
        markdown += `${index + 1}. ${question}\n`;
      });
      
      markdown += '\n';
    });

    return markdown;
  }
}

module.exports = new RetrospectiveTemplateService();