# FastGPT Python 插件使用指南 - GIF 内容理解

## 🎯 简单方案：Python 代码运行插件

这是一个超级简单的 Python 版本，只需要复制粘贴即可使用！

## 🚀 快速配置（5分钟搞定）

### 步骤 1：创建工作流
1. 在 FastGPT 中创建新工作流
2. 添加"工作流输入"节点：
   - `gif_url` (文本类型) - GIF文件URL
   - `user_question` (文本类型) - 用户问题

### 步骤 2：添加 Python 代码运行插件
1. 添加"代码运行"节点，选择 **Python** 语言
2. 将 `fastgpt-python-plugin.py` 文件的**全部代码**复制粘贴到代码框
3. 在代码框最后添加调用代码：

```python
# 在代码最后添加这几行（FastGPT 调用入口）
result = main(gif_url, user_question)
print(json.dumps(result, indent=2, ensure_ascii=False))
```

### 步骤 3：配置输入输出变量

**输入变量：**
- `gif_url` ← 连接工作流输入的 `gif_url`
- `user_question` ← 连接工作流输入的 `user_question`

**输出变量：**
- `success` (boolean) - 处理状态
- `base64_frames` (array) - **Base64图片数组** → 连接AI节点
- `llm_prompt` (string) - **提示词** → 连接AI节点
- `file_size_kb` (number) - 文件大小
- `message` (string) - 处理信息
- `error` (string) - 错误信息

### 步骤 4：添加 AI 对话节点
1. 添加"AI 对话"节点
2. 选择支持视觉的模型（GPT-4V、Claude-3等）
3. 连接：
   - `base64_frames` → AI节点的"图片"输入
   - `llm_prompt` → AI节点的"用户问题"输入

### 步骤 5：添加输出
- 连接 AI 节点的回复到"工作流输出"

## 🔧 完整工作流

```
[工作流输入]
├── gif_url: "https://example.com/sample.gif"
├── user_question: "请描述这个GIF"
    ↓
[Python 代码运行]
├── 下载GIF → 转Base64 → 构建提示词
├── 输出: base64_frames, llm_prompt
    ↓
[AI 对话]
├── 图片: base64_frames
├── 问题: llm_prompt
    ↓
[工作流输出]
└── AI的GIF内容分析
```

## ✨ 功能特点

- 🚀 **超简单**：只需复制粘贴代码
- 🔄 **自动下载**：自动从URL下载GIF
- 📏 **大小检查**：自动检查文件大小和类型
- 🖼️ **Base64转换**：自动转换为AI可读格式
- 💬 **智能提示**：自动构建详细的分析提示词
- ❌ **错误处理**：完善的错误提示和解决建议

## 📝 输入输出示例

**输入：**
```
gif_url: "https://media.giphy.com/media/example/giphy.gif"
user_question: "这个GIF表达了什么情绪？"
```

**输出：**
```json
{
  "success": true,
  "base64_frames": ["data:image/gif;base64,R0lGOD..."],
  "llm_prompt": "这个GIF表达了什么情绪？\n\n请分析这个GIF动图的内容...",
  "file_size_kb": 245.6,
  "message": "成功处理GIF文件 (245.6KB)"
}
```

## 🚨 注意事项

1. **URL要求**：GIF必须是公开可访问的URL
2. **文件大小**：限制10MB以内
3. **网络连接**：FastGPT需要能访问外部URL
4. **模型选择**：必须选择支持视觉的AI模型

## 🛠️ 常见问题

**Q: 提示"requests模块不存在"**
A: 检查FastGPT是否支持requests库，或联系管理员安装

**Q: 下载失败**
A: 检查GIF URL是否有效，网络是否正常

**Q: AI看不到图片**
A: 确认选择了支持视觉的模型，检查连接是否正确

## 🎉 优势

相比之前的方案：
- ✅ **更简单**：只需要一个代码运行节点
- ✅ **更稳定**：Python环境支持更好
- ✅ **更直观**：代码逻辑清晰易懂
- ✅ **更实用**：直接可用，无需额外服务

---

现在您可以轻松在 FastGPT 中实现 GIF 内容理解功能了！ 