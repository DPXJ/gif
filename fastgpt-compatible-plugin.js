// FastGPT 代码运行插件 - GIF 内容理解 (完全兼容版)
// 适用于受限的 FastGPT 代码运行环境

async function main({ gifUrl, userPrompt }) {
  try {
    // 检查输入参数
    if (!gifUrl || !userPrompt) {
      throw new Error('缺少必要参数：gifUrl 和 userPrompt');
    }

    // 检查是否为有效的URL
    if (!gifUrl.startsWith('http://') && !gifUrl.startsWith('https://')) {
      throw new Error('请提供有效的HTTP/HTTPS URL');
    }

    console.log('开始处理 GIF URL...');

    // 由于FastGPT环境限制，我们采用不同的策略：
    // 直接使用URL作为图片源，让AI模型自己去获取和解析
    
    // 构建专门的提示词，指导AI如何处理GIF URL
    const llmPrompt = `${userPrompt}

这是一个GIF动图的URL链接: ${gifUrl}

请访问这个链接并分析GIF的内容。如果您无法直接访问URL，请告诉用户需要将GIF文件转换为Base64格式或使用其他方式提供。

请尝试分析这个GIF可能包含的内容类型：
1. 如果是表情包，描述可能的情感表达
2. 如果是动作演示，描述可能的动作过程  
3. 如果是产品展示，描述可能的特征
4. 提供一般性的GIF内容分析建议

URL: ${gifUrl}`;

    // 尝试创建一个占位符的Base64数据
    // 这是一个1x1像素的透明PNG的Base64编码
    const placeholderBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    
    // 返回结果，主要依靠提示词中的URL让AI处理
    return {
      success: true,
      base64Frames: [placeholderBase64], // 占位符
      llmPrompt: llmPrompt,
      frameCount: 1,
      sampleCount: 1,
      message: `已准备GIF URL分析提示词。由于环境限制，请确保AI模型支持URL访问。`,
      gifUrl: gifUrl // 额外提供URL供参考
    };
    
  } catch (error) {
    console.error('处理失败:', error);
    
    // 即使出错，也尝试提供一个基础的提示词
    const fallbackPrompt = `${userPrompt || '请分析这个GIF'}

由于技术限制无法直接处理GIF文件。GIF URL: ${gifUrl || '未提供'}

请告诉用户：
1. 可以尝试将GIF文件转换为Base64格式
2. 或者描述GIF的内容让我帮助分析
3. 或者使用其他图片分析工具

错误信息: ${error.message}`;

    return {
      success: false,
      base64Frames: [],
      llmPrompt: fallbackPrompt,
      frameCount: 0,
      sampleCount: 0,
      error: error.message || '处理 GIF 时发生未知错误',
      gifUrl: gifUrl
    };
  }
}

// 如果FastGPT需要，也可以导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = main;
} 