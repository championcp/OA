/**
 * 敏捷团队管理系统UI测试用例
 * 使用Chrome-MCP-Server进行UI自动化测试
 */

const testCases = [
  {
    id: 'AUTH-001',
    name: '用户登录测试',
    description: '验证用户能够使用有效凭据登录系统',
    steps: [
      { action: '访问登录页面', expected: '显示登录表单' },
      { action: '输入有效用户名和密码', expected: '输入字段正确显示' },
      { action: '点击登录按钮', expected: '成功登录并重定向到仪表板' }
    ],
    data: {
      username: 'testuser@example.com',
      password: 'Password123!'
    }
  },
  {
    id: 'AUTH-002',
    name: '用户登录失败测试',
    description: '验证系统对无效凭据的处理',
    steps: [
      { action: '访问登录页面', expected: '显示登录表单' },
      { action: '输入无效用户名和密码', expected: '输入字段正确显示' },
      { action: '点击登录按钮', expected: '显示错误消息' }
    ],
    data: {
      username: 'invalid@example.com',
      password: 'WrongPassword!'
    }
  },
  {
    id: 'PROJ-001',
    name: '创建新项目测试',
    description: '验证用户能够创建新项目',
    steps: [
      { action: '登录系统', expected: '成功登录' },
      { action: '导航到项目页面', expected: '显示项目列表' },
      { action: '点击"新建项目"按钮', expected: '显示项目创建表单' },
      { action: '填写项目详情', expected: '输入字段正确显示' },
      { action: '点击"保存"按钮', expected: '项目创建成功并显示在列表中' }
    ],
    data: {
      projectName: '测试项目',
      description: '这是一个测试项目',
      startDate: '2025-09-01',
      endDate: '2025-12-31'
    }
  },
  {
    id: 'SPRINT-001',
    name: '创建冲刺测试',
    description: '验证用户能够在项目中创建冲刺',
    steps: [
      { action: '登录系统', expected: '成功登录' },
      { action: '导航到项目详情页面', expected: '显示项目详情' },
      { action: '点击"冲刺"选项卡', expected: '显示冲刺列表' },
      { action: '点击"新建冲刺"按钮', expected: '显示冲刺创建表单' },
      { action: '填写冲刺详情', expected: '输入字段正确显示' },
      { action: '点击"保存"按钮', expected: '冲刺创建成功并显示在列表中' }
    ],
    data: {
      sprintName: '冲刺1',
      goal: '完成核心功能',
      startDate: '2025-09-01',
      endDate: '2025-09-14'
    }
  },
  {
    id: 'TASK-001',
    name: '创建任务测试',
    description: '验证用户能够在冲刺中创建任务',
    steps: [
      { action: '登录系统', expected: '成功登录' },
      { action: '导航到冲刺详情页面', expected: '显示冲刺详情' },
      { action: '点击"新建任务"按钮', expected: '显示任务创建表单' },
      { action: '填写任务详情', expected: '输入字段正确显示' },
      { action: '点击"保存"按钮', expected: '任务创建成功并显示在看板中' }
    ],
    data: {
      taskName: '实现用户认证',
      description: '创建用户登录和注册功能',
      assignee: '开发者A',
      storyPoints: 5,
      priority: '高'
    }
  },
  {
    id: 'TASK-002',
    name: '更新任务状态测试',
    description: '验证用户能够更新任务状态',
    steps: [
      { action: '登录系统', expected: '成功登录' },
      { action: '导航到看板页面', expected: '显示任务看板' },
      { action: '将任务从"待办"拖动到"进行中"', expected: '任务状态更新为"进行中"' },
      { action: '将任务从"进行中"拖动到"已完成"', expected: '任务状态更新为"已完成"' }
    ],
    data: {
      taskId: 'TASK-1'
    }
  },
  {
    id: 'REPORT-001',
    name: '生成燃尽图报表测试',
    description: '验证用户能够生成燃尽图报表',
    steps: [
      { action: '登录系统', expected: '成功登录' },
      { action: '导航到报表页面', expected: '显示报表模板列表' },
      { action: '选择"燃尽图"报表', expected: '显示报表配置选项' },
      { action: '选择项目和冲刺', expected: '输入字段正确显示' },
      { action: '点击"生成报表"按钮', expected: '成功生成燃尽图报表' }
    ],
    data: {
      projectId: 'PROJ-1',
      sprintId: 'SPRINT-1'
    }
  },
  {
    id: 'REPORT-002',
    name: '生成速度图报表测试',
    description: '验证用户能够生成速度图报表',
    steps: [
      { action: '登录系统', expected: '成功登录' },
      { action: '导航到报表页面', expected: '显示报表模板列表' },
      { action: '选择"速度图"报表', expected: '显示报表配置选项' },
      { action: '选择项目', expected: '输入字段正确显示' },
      { action: '点击"生成报表"按钮', expected: '成功生成速度图报表' }
    ],
    data: {
      projectId: 'PROJ-1',
      timeRange: '最近3个冲刺'
    }
  },
  {
    id: 'REPORT-003',
    name: '导出报表测试',
    description: '验证用户能够导出报表为PDF',
    steps: [
      { action: '登录系统', expected: '成功登录' },
      { action: '导航到已生成的报表页面', expected: '显示报表详情' },
      { action: '点击"导出PDF"按钮', expected: '报表成功导出为PDF文件' }
    ],
    data: {
      reportId: 'REPORT-1'
    }
  },
  {
    id: 'DASH-001',
    name: '仪表板显示测试',
    description: '验证仪表板正确显示项目概览',
    steps: [
      { action: '登录系统', expected: '成功登录' },
      { action: '导航到仪表板页面', expected: '显示仪表板' },
      { action: '检查项目进度卡片', expected: '显示正确的项目进度' },
      { action: '检查任务统计卡片', expected: '显示正确的任务统计' },
      { action: '检查即将到期卡片', expected: '显示即将到期的任务和冲刺' }
    ],
    data: {}
  }
];

module.exports = testCases;