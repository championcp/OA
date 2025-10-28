// 使用chrome-mcp-server进行UI测试的实现示例

/**
 * 使用chrome-mcp-server进行UI测试的示例
 * 此文件展示如何使用chrome-mcp-server的各种工具进行UI自动化测试
 */

// 模拟chrome-mcp-server工具调用函数
async function useMcpTool(serverName, toolName, args) {
  console.log(`调用工具: ${serverName}.${toolName}`);
  console.log(`参数: ${JSON.stringify(args, null, 2)}`);
  // 实际实现中，这里会通过MCP协议调用chrome-mcp-server
  return { status: 'success', data: {} };
}

/**
 * 导航到指定URL
 * @param {string} url - 目标URL
 */
async function navigateToUrl(url) {
  return await useMcpTool('chrome-mcp-server', 'chrome_navigate', {
    url: url,
    width: 1280,
    height: 720
  });
}

/**
 * 获取页面内容
 * @param {string} [url] - 可选，如果提供则先导航到该URL
 * @param {boolean} [htmlContent] - 是否获取HTML内容
 * @param {string} [selector] - 可选，指定元素选择器
 */
async function getPageContent(url = null, htmlContent = false, selector = null) {
  const args = {
    textContent: true,
    htmlContent: htmlContent
  };
  
  if (url) {
    args.url = url;
  }
  
  if (selector) {
    args.selector = selector;
  }
  
  return await useMcpTool('chrome-mcp-server', 'chrome_get_web_content', args);
}

/**
 * 点击页面元素
 * @param {string} selector - 元素选择器
 * @param {boolean} [waitForNavigation] - 是否等待导航完成
 */
async function clickElement(selector, waitForNavigation = false) {
  return await useMcpTool('chrome-mcp-server', 'chrome_click_element', {
    selector: selector,
    waitForNavigation: waitForNavigation
  });
}

/**
 * 填写表单字段
 * @param {string} selector - 表单元素选择器
 * @param {string} value - 要填入的值
 */
async function fillFormField(selector, value) {
  return await useMcpTool('chrome-mcp-server', 'chrome_fill_or_select', {
    selector: selector,
    value: value
  });
}

/**
 * 获取页面上的交互元素
 * @param {string} [textQuery] - 可选，按文本搜索元素
 * @param {string} [selector] - 可选，按选择器过滤元素
 */
async function getInteractiveElements(textQuery = null, selector = null) {
  const args = {
    includeCoordinates: true
  };
  
  if (textQuery) {
    args.textQuery = textQuery;
  }
  
  if (selector) {
    args.selector = selector;
  }
  
  return await useMcpTool('chrome-mcp-server', 'chrome_get_interactive_elements', args);
}

/**
 * 截取页面截图
 * @param {string} [selector] - 可选，指定元素选择器
 * @param {boolean} [fullPage] - 是否截取整个页面
 */
async function takeScreenshot(selector = null, fullPage = true) {
  const args = {
    storeBase64: true,
    fullPage: fullPage,
    savePng: false
  };
  
  if (selector) {
    args.selector = selector;
  }
  
  return await useMcpTool('chrome-mcp-server', 'chrome_screenshot', args);
}

/**
 * 执行键盘操作
 * @param {string} keys - 要模拟的按键
 * @param {string} [selector] - 可选，指定元素选择器
 */
async function simulateKeyboard(keys, selector = null) {
  const args = {
    keys: keys
  };
  
  if (selector) {
    args.selector = selector;
  }
  
  return await useMcpTool('chrome-mcp-server', 'chrome_keyboard', args);
}

/**
 * 示例测试：登录流程
 */
async function testLoginFlow() {
  try {
    console.log('开始测试登录流程...');
    
    // 1. 导航到登录页面
    await navigateToUrl('http://localhost:3000/login');
    
    // 2. 填写登录表单
    await fillFormField('#username', 'admin');
    await fillFormField('#password', 'password123');
    
    // 3. 点击登录按钮
    await clickElement('button[type="submit"]', true);
    
    // 4. 验证登录结果
    const pageContent = await getPageContent();
    console.log('登录后页面内容:', pageContent);
    
    // 5. 截取仪表盘截图
    await takeScreenshot('.dashboard-container');
    
    console.log('登录流程测试完成');
    return true;
  } catch (error) {
    console.error('登录流程测试失败:', error);
    return false;
  }
}

/**
 * 示例测试：创建用户故事
 */
async function testCreateUserStory() {
  try {
    console.log('开始测试创建用户故事...');
    
    // 1. 导航到Backlog页面
    await navigateToUrl('http://localhost:3000/backlog');
    
    // 2. 点击创建按钮
    await clickElement('.create-story-button');
    
    // 3. 填写表单
    await fillFormField('#story-title', '测试用户故事');
    await fillFormField('#story-description', '这是一个测试用户故事');
    await fillFormField('#story-points', '3');
    
    // 4. 提交表单
    await clickElement('button[type="submit"]');
    
    // 5. 验证创建结果
    const pageContent = await getPageContent();
    console.log('创建后页面内容:', pageContent);
    
    console.log('创建用户故事测试完成');
    return true;
  } catch (error) {
    console.error('创建用户故事测试失败:', error);
    return false;
  }
}

// 导出测试函数
module.exports = {
  navigateToUrl,
  getPageContent,
  clickElement,
  fillFormField,
  getInteractiveElements,
  takeScreenshot,
  simulateKeyboard,
  testLoginFlow,
  testCreateUserStory
};

// 如果直接运行此文件，执行示例测试
if (require.main === module) {
  (async () => {
    try {
      await testLoginFlow();
      await testCreateUserStory();
    } catch (error) {
      console.error('测试执行失败:', error);
    }
  })();
}