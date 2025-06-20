const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const sharp = require('sharp');
const axios = require('axios');

// FastGPT 插件的主入口函数
// inputs 是一个对象，包含了 package.json 中定义的所有输入字段的值
async function main(inputs) {
  const { gifSource, userPrompt } = inputs;

  let gifPath = '';
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gif-plugin-'));
  let isLocalFile = false;

  try {
    // 1. 获取GIF文件：判断是URL还是本地文件路径
    if (gifSource.startsWith('http')) {
      // 从 URL 下载
      console.log('从URL下载GIF...');
      const response = await axios.get(gifSource, { responseType: 'arraybuffer', timeout: 30000 });
      gifPath = path.join(tempDir, `downloaded-${Date.now()}.gif`);
      await fs.writeFile(gifPath, response.data);
    } else {
      // FastGPT 传递过来的文件路径
      console.log('使用本地文件路径...');
      gifPath = gifSource;
      isLocalFile = true; // 标记为本地文件，执行后不删除
    }

    // 2. 提取GIF元数据并进行智能抽样
    console.log('提取元数据和抽样...');
    const metadata = await sharp(gifPath, { animated: true }).metadata();
    const totalFrames = metadata.pages || 1;

    const sampleFramesIndices = calculateSampleFrames(totalFrames);
    console.log(`总帧数: ${totalFrames}, 抽样帧索引: [${sampleFramesIndices.join(', ')}]`);

    // 3. 提取抽样帧并转换为Base64
    console.log('转换抽样帧为Base64...');
    const base64Frames = [];
    const gifBuffer = await fs.readFile(gifPath);

    for (const frameIndex of sampleFramesIndices) {
      const frameBuffer = await sharp(gifBuffer, { page: frameIndex }).png().toBuffer();
      const base64Data = `data:image/png;base64,${frameBuffer.toString('base64')}`;
      base64Frames.push(base64Data);
    }
    
    if (base64Frames.length === 0) {
        throw new Error("未能成功提取任何帧。");
    }

    // 4. 构建给大模型的最终提示词
    const llmPrompt = `${userPrompt}\n\n请基于以下从GIF中抽取的关键帧序列进行回答。`;
    
    console.log('插件执行成功！');

    // 5. 返回结果，键名必须与 package.json 中定义的 outputs 完全对应
    return {
      base64Frames,
      llmPrompt,
      error: ''
    };

  } catch (err) {
    console.error('插件执行失败:', err);
    // 发生错误时，返回错误信息
    return {
      base64Frames: [],
      llmPrompt: '',
      error: err.message || '发生了未知错误'
    };
  } finally {
    // 清理临时文件
    if (gifPath && !isLocalFile) { // 只删除下载的文件
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
            console.log('临时文件已清理。');
        } catch (cleanupErr) {
            console.error('清理临时文件失败:', cleanupErr);
        }
    }
  }
}

/**
 * 智能抽样逻辑
 * @param {number} totalFrames - GIF的总帧数
 * @returns {number[]} - 需要抽样的帧的索引数组
 */
function calculateSampleFrames(totalFrames) {
  let sampleFrames = [];
  if (totalFrames <= 1) return [0];

  if (totalFrames < 10) {
    // 少于10帧：首尾两帧 (如果只有2帧，则全要)
    sampleFrames = [0, totalFrames - 1];
    return [...new Set(sampleFrames)]; // 用 Set 去重，避免只有1帧时出现[0,0]
  } else if (totalFrames <= 20) {
    // 10-20帧：首、中、尾三帧
    const middleFrame = Math.floor((totalFrames - 1) / 2);
    sampleFrames = [0, middleFrame, totalFrames - 1];
  } else {
    // 大于20帧：均匀抽样5帧
    const maxSampleFrames = 5;
    sampleFrames.push(0); // 总是包含第一帧
    const interval = (totalFrames - 1) / (maxSampleFrames - 1);
    for (let i = 1; i < maxSampleFrames - 1; i++) {
        sampleFrames.push(Math.round(i * interval));
    }
    sampleFrames.push(totalFrames - 1); // 总是包含最后一帧
  }
  return [...new Set(sampleFrames)]; // 通过Set确保索引唯一
}

// 导出主函数
module.exports = main; 