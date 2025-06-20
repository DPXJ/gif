# FastGPT HTTP插件配置指南 - GIF识别服务

## 推荐方案：使用HTTP插件

由于FastGPT代码运行环境的安全限制，推荐使用HTTP插件方案调用本地GIF服务。

## 1. 启动本地GIF服务

确保您的GIF识别服务正在运行：

```bash
# 在项目目录下执行
node server.js
```

服务将在 `http://localhost:3000` 启动。

## 2. FastGPT HTTP插件配置

### 插件基本信息
- **插件名称**: GIF内容分析
- **插件描述**: 分析GIF动图内容，提取关键帧并生成描述
- **请求方式**: POST
- **请求地址**: `http://localhost:3000/api/analyze-gif`

### 输入参数配置

#### 参数1：gif_url
- **参数名**: gif_url
- **参数类型**: string
- **是否必填**: 是
- **参数描述**: GIF文件的URL地址
- **示例值**: `https://example.com/sample.gif`

#### 参数2：user_question
- **参数名**: user_question
- **参数类型**: string
- **是否必填**: 否
- **参数描述**: 用户对GIF的具体问题
- **默认值**: `请分析这个GIF的内容`
- **示例值**: `这个GIF表达了什么情感？`

### 请求体配置

**Content-Type**: `application/json`

**请求体结构**:
```json
{
  "gif_url": "{{gif_url}}",
  "user_question": "{{user_question}}"
}
```

### 输出参数配置

**输出字段1**：
- **变量名**: `success`
- **数据类型**: Boolean
- **描述**: 处理是否成功

**输出字段2**：
- **变量名**: `sampleFrames`
- **数据类型**: Array
- **描述**: Base64编码的关键帧数组

**输出字段3**：
- **变量名**: `llm_prompt`
- **数据类型**: String
- **描述**: 生成的AI分析提示词

**输出字段4**：
- **变量名**: `message`
- **数据类型**: String
- **描述**: 处理结果消息

**输出字段5**：
- **变量名**: `totalFrames`
- **数据类型**: Number
- **描述**: GIF总帧数

**输出字段6**：
- **变量名**: `samplingStrategy`
- **数据类型**: String
- **描述**: 使用的抽样策略说明

## 3. 智能抽样策略

系统会根据GIF的总帧数自动选择最优的抽样策略：

- **少于10帧**: 显示首尾两帧
- **10-20帧**: 显示首中尾三帧
- **超过20帧**: 均匀抽样5个关键帧

## 4. 使用示例

### 输入示例
```json
{
  "gif_url": "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif",
  "user_question": "这个GIF表达了什么情感？"
}
```

### 输出示例
```json
{
  "success": true,
  "sampleFrames": [
    {
      "frameIndex": 0,
      "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    },
    {
      "frameIndex": 12,
      "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ],
  "llm_prompt": "请基于以下从GIF中抽取的5个关键帧序列进行分析回答：\n\nGIF信息：\n- 总帧数: 49\n- 抽样帧数: 5\n- 图片尺寸: 480x13132\n- 抽样策略: 超过20帧，均匀抽样5帧\n\n这些帧按时间顺序排列，展示了GIF的主要内容变化。请详细分析并回答用户的问题。",
  "message": "GIF处理成功，提取了5个关键帧",
  "totalFrames": 49,
  "samplingStrategy": "超过20帧，均匀抽样5帧"
}
```

## 5. 工作流中的使用

在FastGPT工作流中，您可以：

1. **连接HTTP插件** - 使用上述配置调用GIF分析服务
2. **获取抽样帧** - 通过`sampleFrames`字段获取Base64编码的关键帧
3. **使用AI分析** - 将`llm_prompt`和关键帧数据传递给大模型进行内容分析
4. **获取元数据** - 使用`totalFrames`、`samplingStrategy`等字段了解GIF信息

## 6. 优势特点

- ✅ **完整功能保留**：所有智能抽样和帧分解功能都保持不变
- ✅ **无安全限制**：绕过FastGPT代码环境的安全限制
- ✅ **高性能**：本地处理，响应速度快
- ✅ **稳定可靠**：独立服务，不受FastGPT环境限制
- ✅ **智能抽样**：根据GIF长度自动选择最优抽样策略
- ✅ **多格式支持**：支持各种GIF格式和尺寸

## 7. 注意事项

1. **确保服务运行**：使用前请确保本地GIF服务正在运行
2. **网络访问**：确保FastGPT能够访问本地服务地址
3. **URL有效性**：提供的GIF URL必须是可公开访问的
4. **内存考虑**：大型GIF文件可能需要更多处理时间

通过这种方式，您可以在FastGPT工作流中完美集成GIF内容分析功能！ 