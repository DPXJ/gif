// FastGPT 代码运行插件 - GIF 内容理解 (简化版)
// 适用于不支持Sharp库的环境

async function main({ gifUrl, userPrompt }) {
  try {
    // 检查输入参数
    if (!gifUrl || !userPrompt) {
      throw new Error('缺少必要参数：gifUrl 和 userPrompt');
    }

    // 使用fetch下载GIF文件 (大多数环境都支持)
    console.log('正在下载 GIF 文件...');
    const response = await fetch(gifUrl, { 
      method: 'GET',
      timeout: 30000 
    });
    
    if (!response.ok) {
      throw new Error(`下载失败: HTTP ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('image/gif')) {
      throw new Error('URL指向的不是GIF文件');
    }

    // 获取文件信息
    const contentLength = response.headers.get('content-length');
    const fileSize = contentLength ? parseInt(contentLength) : 0;
    
    console.log(`GIF文件大小: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
    
    if (fileSize > 10 * 1024 * 1024) { // 10MB限制
      throw new Error('GIF文件过大，请使用小于10MB的文件');
    }

    // 读取文件为ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // 将ArrayBuffer转换为Base64
    const base64String = btoa(String.fromCharCode.apply(null, uint8Array));
    const gifBase64 = `data:image/gif;base64,${base64String}`;
    
    // 由于无法使用Sharp进行帧分解，我们采用不同的策略：
    // 1. 直接使用完整的GIF作为"动图"输入
    // 2. 同时创建静态版本作为"关键帧"
    
    // 创建多个视角的Base64数据
    const base64Frames = [
      gifBase64, // 完整GIF动图
      gifBase64  // 同样的GIF（某些AI可能需要多个输入）
    ];
    
    // 构建针对GIF的专门提示词
    const llmPrompt = `${userPrompt}

请分析这个GIF动图的内容。由于技术限制，我提供的是完整的GIF文件而不是分解的帧。请基于GIF的动态内容进行分析，包括：
1. 主要的视觉元素和对象
2. 动作或变化的过程
3. 整体的情感表达或含义
4. 如果是表情包，请解释其幽默点或用途

请详细描述您在这个GIF中观察到的内容。`;

    console.log('GIF处理完成');
    
    return {
      success: true,
      base64Frames: base64Frames,
      llmPrompt: llmPrompt,
      frameCount: 1, // 作为整体GIF处理
      sampleCount: base64Frames.length,
      message: `成功处理GIF文件 (${(fileSize / 1024).toFixed(1)}KB)`
    };
    
  } catch (error) {
    console.error('处理失败:', error);
    return {
      success: false,
      base64Frames: [],
      llmPrompt: '',
      frameCount: 0,
      sampleCount: 0,
      error: error.message || '处理 GIF 时发生未知错误'
    };
  }
} 