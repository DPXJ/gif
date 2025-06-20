# FastGPT GIF 内容理解插件使用指南

## 🎯 快速开始

### 方法一：使用代码运行插件（推荐）

这是最简单直接的方式，无需上传文件，直接在 FastGPT 中配置。

#### 步骤 1：创建工作流
1. 在 FastGPT 中创建新的工作流
2. 添加"工作流输入"节点，配置两个输入：
   - `gif_url` (文本类型) - GIF文件的URL地址
   - `user_question` (文本类型) - 用户想问的问题

#### 步骤 2：添加代码运行插件
1. 在工作流中添加"代码运行"节点
2. **选择合适的代码版本**：
   - **推荐版本**: 使用 `fastgpt-simple-plugin.js` (兼容性更好，不依赖Sharp库)
   - **完整版本**: 使用 `fastgpt-code-plugin.js` (功能更强，需要环境支持Sharp库)
3. 将选择的代码文件内容完整复制粘贴到代码框中
4. 配置输入变量：
   - `gifUrl` ← 连接工作流输入的 `gif_url`
   - `userPrompt` ← 连接工作流输入的 `user_question`
5. 配置输出变量：
   - `success` (boolean) - 处理是否成功
   - `base64Frames` (array) - Base64图片数组 **[重要：用于连接AI节点]**
   - `llmPrompt` (string) - 格式化提示词 **[重要：用于连接AI节点]**
   - `frameCount` (number) - GIF总帧数
   - `sampleCount` (number) - 抽样帧数量
   - `message` (string) - 成功信息
   - `error` (string) - 错误信息

#### 步骤 3：添加 AI 对话节点
1. 添加"AI 对话"节点
2. 配置连接：
   - 将代码运行插件的 `base64Frames` 输出 → 连接到 AI 节点的"图片"输入
   - 将代码运行插件的 `llmPrompt` 输出 → 连接到 AI 节点的"用户问题"输入
3. 在 AI 节点中选择支持视觉的模型（如 GPT-4V、Claude-3 等）

#### 步骤 4：配置输出
1. 添加"工作流输出"节点
2. 将 AI 对话节点的回复连接到输出

## 🔧 工作流配置示例

```
[工作流输入] 
├── gif_url: "https://example.com/sample.gif"
├── user_question: "请描述这个GIF的内容"
    ↓
[代码运行插件]
├── 输入: gifUrl, userPrompt  
├── 输出: base64Frames[], llmPrompt
    ↓
[AI 对话节点]
├── 图片输入: base64Frames
├── 用户问题: llmPrompt
├── 模型: GPT-4V
    ↓
[工作流输出]
└── AI 的回复内容
```

## 📝 详细变量配置说明

### 代码运行插件 - 输入变量配置
在 FastGPT 代码运行插件的"输入"选项卡中添加：

| 变量名 | 类型 | 必填 | 说明 | 连接源 |
|--------|------|------|------|--------|
| `gifUrl` | string | ✅ | GIF文件的公开URL地址 | 工作流输入的 `gif_url` |
| `userPrompt` | string | ✅ | 用户想要询问的问题 | 工作流输入的 `user_question` |

### 代码运行插件 - 输出变量配置
在 FastGPT 代码运行插件的"输出"选项卡中添加：

| 变量名 | 类型 | 说明 | 连接目标 |
|--------|------|------|----------|
| `success` | boolean | 处理是否成功 | 可选：用于条件判断 |
| `base64Frames` | array | **Base64图片数组** | **→ AI节点的"图片"输入** |
| `llmPrompt` | string | **格式化提示词** | **→ AI节点的"用户问题"输入** |
| `frameCount` | number | GIF总帧数 | 可选：用于显示信息 |
| `sampleCount` | number | 抽样帧数量 | 可选：用于显示信息 |
| `message` | string | 成功信息 | 可选：用于调试 |
| `error` | string | 错误信息 | 可选：用于错误处理 |

> **⚠️ 重要提醒：** `base64Frames` 和 `llmPrompt` 是核心输出变量，必须正确连接到AI节点才能实现功能！

## 🎨 抽样策略

| GIF帧数 | 抽样策略 | 示例 |
|---------|----------|------|
| 1帧 | 显示唯一帧 | [0] |
| 2帧 | 显示全部 | [0, 1] |
| 3-9帧 | 首尾两帧 | [0, 8] |
| 10-20帧 | 首中尾三帧 | [0, 10, 19] |
| >20帧 | 均匀抽样5帧 | [0, 12, 25, 37, 49] |

## 💡 使用示例

### 示例 1：分析动作GIF
**输入：**
- gif_url: "https://example.com/dance.gif"  
- user_question: "这个人在做什么动作？"

**预期输出：**
AI 会基于提取的关键帧分析并描述舞蹈动作的变化过程。

### 示例 2：理解表情包
**输入：**
- gif_url: "https://example.com/meme.gif"
- user_question: "这个表情包想表达什么情绪？"

**预期输出：**
AI 会分析表情变化，理解情绪表达和幽默点。

## 🚨 注意事项

1. **URL要求**: GIF文件必须是公开可访问的URL
2. **文件大小**: 建议GIF文件不超过10MB
3. **模型选择**: 必须使用支持视觉的多模态模型
4. **网络依赖**: 需要能够访问外部URL下载GIF

## 🛠️ 故障排除

### 常见问题

**Q: 提示"下载失败"**
A: 检查GIF URL是否有效，是否可以公开访问

**Q: 提示"处理失败"**  
A: 可能是GIF格式不支持，或文件损坏

**Q: AI无法看到图片**
A: 检查是否选择了支持视觉的模型，确认图片输出正确连接

**Q: 处理速度慢**
A: 大文件或高帧数GIF需要更长处理时间，这是正常现象

**Q: 提示"require is not defined"**
A: FastGPT环境不支持require语法，请使用 `fastgpt-simple-plugin.js` 简化版本

**Q: 提示"sharp is not defined"**
A: FastGPT环境不支持Sharp库，请使用 `fastgpt-simple-plugin.js` 简化版本

**Q: 简化版本效果如何？**
A: 简化版本直接传递完整GIF给AI，现代多模态AI（如GPT-4V）可以直接理解GIF动图内容

## 🔄 方法二：HTTP服务方式（高级）

如果您需要更高的性能或想要独立部署，可以：

1. 将我们之前的 `server.js` 部署为独立服务
2. 在 FastGPT 中使用"HTTP插件"调用
3. 配置对应的API端点和参数

这种方式需要您有服务器部署经验。

## ✅ 快速配置清单

### 工作流输入节点
- [ ] 添加 `gif_url` (文本类型)
- [ ] 添加 `user_question` (文本类型)

### 代码运行插件节点
- [ ] 粘贴 `fastgpt-code-plugin.js` 代码
- [ ] 配置输入: `gifUrl`, `userPrompt`
- [ ] 配置输出: `success`, `base64Frames`, `llmPrompt`, `frameCount`, `sampleCount`, `message`, `error`

### AI 对话节点
- [ ] 选择支持视觉的模型 (GPT-4V/Claude-3等)
- [ ] 连接 `base64Frames` → 图片输入
- [ ] 连接 `llmPrompt` → 用户问题输入

### 工作流输出节点
- [ ] 连接 AI 节点的回复输出

### 连接关系检查
```
工作流输入 → 代码运行插件 → AI对话 → 工作流输出
├─ gif_url → gifUrl
├─ user_question → userPrompt
                 ├─ base64Frames → 图片
                 ├─ llmPrompt → 用户问题
                              └─ 回复 → 输出
```

---

现在您可以直接在 FastGPT 中使用代码运行插件来实现 GIF 内容理解功能了！ 