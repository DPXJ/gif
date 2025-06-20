# GIF帧分解工具

一个现代化的Web应用，用于将GIF动图分解为独立的帧图像。支持文件上传和URL输入两种方式。

## 🚀 功能特性

- **双输入方式**: 支持本地文件上传和URL链接输入
- **实时预览**: 分解后立即显示所有帧的预览图像
- **数据导出**: 以JSON格式输出完整的帧数据
- **批量下载**: 一键下载所有分解后的帧图像
- **响应式设计**: 完美适配桌面和移动设备
- **现代化UI**: 美观的用户界面和流畅的交互体验

## 🛠️ 技术栈

### 后端
- **Node.js**: 服务器运行环境
- **Express**: Web框架
- **Sharp**: 高性能图像处理库
- **Multer**: 文件上传中间件
- **Axios**: HTTP客户端

### 前端
- **HTML5**: 语义化标记
- **CSS3**: 现代化样式和动画
- **JavaScript (ES6+)**: 交互逻辑
- **Font Awesome**: 图标库

## 📦 安装和运行

### 环境要求
- Node.js 14.0 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd gif-frame-extractor
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动服务**
   ```bash
   # 开发模式（自动重启）
   npm run dev
   
   # 生产模式
   npm start
   ```

4. **访问应用**
   打开浏览器访问: `http://localhost:3000`

## 🎯 使用方法

### 方式一：文件上传
1. 点击"上传文件"按钮
2. 选择本地GIF文件或直接拖拽到上传区域
3. 等待处理完成
4. 查看分解结果

### 方式二：URL输入
1. 点击"URL链接"按钮
2. 输入GIF文件的网络地址
3. 点击"分解帧"按钮
4. 等待下载和处理完成

### 结果操作
- **预览帧**: 在网格中查看所有分解的帧
- **下载帧**: 点击"下载所有帧"批量保存
- **复制数据**: 点击"复制帧数据"获取JSON格式数据
- **重新开始**: 点击"重新开始"处理新的GIF

## 📊 API接口

### 健康检查
```
GET /api/health
```

### 文件上传分解
```
POST /api/extract-frames
Content-Type: multipart/form-data
Body: gifFile (GIF文件)
```

### URL分解
```
POST /api/extract-frames-url
Content-Type: application/json
Body: { "gifUrl": "GIF文件URL" }
```

### 获取单帧
```
GET /api/frame/:frameIndex?gifPath=文件路径
```

## 📁 项目结构

```
gif-frame-extractor/
├── server.js              # 服务器主文件
├── package.json           # 项目配置和依赖
├── README.md             # 项目文档
├── public/               # 静态文件
│   ├── index.html        # 主页面
│   ├── styles.css        # 样式文件
│   └── script.js         # 前端脚本
├── uploads/              # 上传文件临时目录
└── output/               # 输出文件目录
```

## 🔧 配置选项

### 环境变量
- `PORT`: 服务器端口（默认: 3000）
- `NODE_ENV`: 运行环境（development/production）

### 自定义配置
在 `server.js` 中可以修改以下配置：
- 上传文件大小限制
- 支持的文件格式
- 输出图像格式和质量
- 临时文件清理策略

## 🚨 注意事项

1. **文件大小**: 建议上传的GIF文件不超过50MB
2. **网络连接**: URL输入需要稳定的网络连接
3. **浏览器兼容**: 建议使用现代浏览器（Chrome、Firefox、Safari、Edge）
4. **内存使用**: 大文件处理时可能占用较多内存

## 🐛 故障排除

### 常见问题

**Q: 上传文件失败**
A: 检查文件格式是否为GIF，文件大小是否超限

**Q: URL处理失败**
A: 确认URL可访问，网络连接正常

**Q: 服务启动失败**
A: 检查端口是否被占用，Node.js版本是否兼容

**Q: 图像显示异常**
A: 刷新页面，检查浏览器控制台错误信息

### 日志查看
服务运行时会输出详细的日志信息，包括：
- 服务启动状态
- 文件处理进度
- 错误信息详情

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

### 开发流程
1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Sharp](https://sharp.pixelplumbing.com/) - 高性能图像处理
- [Express](https://expressjs.com/) - Web框架
- [Font Awesome](https://fontawesome.com/) - 图标库

---

**享受使用GIF帧分解工具！** 🎉 