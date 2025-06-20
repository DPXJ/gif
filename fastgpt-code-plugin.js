// FastGPT 代码运行插件 - GIF 内容理解
// 直接复制此代码到 FastGPT 的"代码运行"插件中

async function main({ gifUrl, userPrompt }) {
  // 尝试不同的导入方式，兼容FastGPT环境
  let axios, sharp;
  
  try {
    // 方式1: 尝试全局对象
    if (typeof global !== 'undefined' && global.axios) {
      axios = global.axios;
      sharp = global.sharp;
    }
    // 方式2: 尝试动态导入
    else if (typeof import !== 'undefined') {
      axios = await import('axios');
      sharp = await import('sharp');
      axios = axios.default || axios;
      sharp = sharp.default || sharp;
    }
    // 方式3: 尝试require
    else {
      axios = require('axios');
      sharp = require('sharp');
    }
  } catch (importError) {
    return {
      success: false,
      base64Frames: [],
      llmPrompt: '',
      frameCount: 0,
      sampleCount: 0,
      error: `导入依赖失败: ${importError.message}. FastGPT可能不支持sharp库，建议使用HTTP服务方式。`
    };
  }
  
  try {
    // 1. 下载 GIF 文件
    console.log('正在下载 GIF 文件...');
    const response = await axios.get(gifUrl, { 
      responseType: 'arraybuffer', 
      timeout: 30000 
    });
    
    // 2. 使用 Sharp 处理 GIF
    const gifBuffer = Buffer.from(response.data);
    const metadata = await sharp(gifBuffer, { animated: true }).metadata();
    const totalFrames = metadata.pages || 1;
    
    console.log(`GIF 总帧数: ${totalFrames}`);
    
    // 3. 智能抽样逻辑
    const sampleFrames = calculateSampleFrames(totalFrames);
    console.log(`抽样帧索引: [${sampleFrames.join(', ')}]`);
    
    // 4. 提取抽样帧并转换为 Base64
    const base64Frames = [];
    for (const frameIndex of sampleFrames) {
      const frameBuffer = await sharp(gifBuffer, { page: frameIndex })
        .png()
        .toBuffer();
      const base64Data = `data:image/png;base64,${frameBuffer.toString('base64')}`;
      base64Frames.push(base64Data);
    }
    
    // 5. 构建提示词
    const llmPrompt = `${userPrompt}\n\n请基于以下从GIF中抽取的${base64Frames.length}个关键帧序列进行分析回答。这些帧按时间顺序排列，展示了GIF的主要内容变化。`;
    
    // 6. 返回结果
    return {
      success: true,
      base64Frames: base64Frames,
      llmPrompt: llmPrompt,
      frameCount: totalFrames,
      sampleCount: base64Frames.length,
      message: `成功提取 ${base64Frames.length} 个关键帧`
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

// 智能抽样函数
function calculateSampleFrames(totalFrames) {
  if (totalFrames <= 1) return [0];
  
  if (totalFrames < 10) {
    // 少于10帧：首尾两帧
    return totalFrames === 2 ? [0, 1] : [0, totalFrames - 1];
  } else if (totalFrames <= 20) {
    // 10-20帧：首、中、尾三帧
    const middleFrame = Math.floor((totalFrames - 1) / 2);
    return [0, middleFrame, totalFrames - 1];
  } else {
    // 大于20帧：均匀抽样5帧
    const frames = [0]; // 第一帧
    const interval = (totalFrames - 1) / 4;
    for (let i = 1; i < 4; i++) {
      frames.push(Math.round(i * interval));
    }
    frames.push(totalFrames - 1); // 最后一帧
    return [...new Set(frames)]; // 去重
  }
} 