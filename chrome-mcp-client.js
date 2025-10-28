/**
 * Chrome MCP 客户端实现
 * 封装与Chrome-MCP-Server的交互
 */

class ChromeMcpClient {
  constructor() {
    // 这里不需要初始化连接，因为我们将直接使用全局的chrome-mcp-server工具
    console.log('初始化Chrome MCP客户端');
    this.baseUrl = 'http://localhost:56597'; // 使用当前运行的前端服务端口
  }

  async navigate(url) {
    console.log(`导航到: ${url}`);
    try {
      // 使用chrome-mcp-server的chrome_navigate工具
      return await this._callMcpTool('chrome_navigate', {
        url: url,
        newWindow: false,
        width: 1280,
        height: 720
      });
    } catch (error) {
      console.error(`导航失败: ${error.message}`);
      throw error;
    }
  }

  async fillInput(selector, value) {
    console.log(`填写输入框 ${selector}: ${value}`);
    try {
      // 使用chrome-mcp-server的chrome_fill_or_select工具
      return await this._callMcpTool('chrome_fill_or_select', {
        selector: selector,
        value: value
      });
    } catch (error) {
      console.error(`填写输入框失败: ${error.message}`);
      throw error;
    }
  }

  async click(selector) {
    console.log(`点击元素: ${selector}`);
    try {
      // 使用chrome-mcp-server的chrome_click_element工具
      return await this._callMcpTool('chrome_click_element', {
        selector: selector,
        waitForNavigation: true,
        timeout: 5000
      });
    } catch (error) {
      console.error(`点击元素失败: ${error.message}`);
      throw error;
    }
  }

  async elementExists(selector) {
    console.log(`检查元素是否存在: ${selector}`);
    try {
      // 使用chrome-mcp-server的chrome_get_interactive_elements工具
      const result = await this._callMcpTool('chrome_get_interactive_elements', {
        selector: selector,
        includeCoordinates: false
      });
      return result && result.elements && result.elements.length > 0;
    } catch (error) {
      console.error(`检查元素失败: ${error.message}`);
      return false;
    }
  }

  async waitForPageLoad() {
    console.log('等待页面加载');
    // 简单的延迟等待
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  async takeScreenshot() {
    console.log('截取屏幕截图');
    try {
      // 使用chrome-mcp-server的chrome_screenshot工具
      const result = await this._callMcpTool('chrome_screenshot', {
        storeBase64: true,
        fullPage: true,
        savePng: false
      });
      return result && result.base64Data ? result.base64Data : null;
    } catch (error) {
      console.error(`截图失败: ${error.message}`);
      return null;
    }
  }

  async getWebContent() {
    console.log('获取页面内容');
    try {
      // 使用chrome-mcp-server的chrome_get_web_content工具
      return await this._callMcpTool('chrome_get_web_content', {
        textContent: true
      });
    } catch (error) {
      console.error(`获取页面内容失败: ${error.message}`);
      throw error;
    }
  }

  async _callMcpTool(toolName, args) {
    try {
      // 这里应该是实际调用MCP工具的代码
      // 在实际环境中，这将使用适当的API调用chrome-mcp-server
      console.log(`调用MCP工具: ${toolName}`, args);
      
      // 模拟调用结果
      return { success: true };
    } catch (error) {
      console.error(`MCP工具调用失败: ${error.message}`);
      throw error;
    }
  }
}

module.exports = ChromeMcpClient;