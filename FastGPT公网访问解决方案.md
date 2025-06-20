# FastGPT访问本地服务解决方案

## 问题分析

您的问题非常准确！如果本地服务没有发布到公网，FastGPT确实无法直接调用。

### 当前情况
- **本地服务**：运行在 `http://localhost:3000`
- **FastGPT**：部署在云端服务器
- **网络隔离**：云端无法访问本地localhost

## 解决方案

### 方案1：内网穿透（推荐）

#### 1.1 使用 LocalTunnel

```bash
# 安装localtunnel
npm install -g localtunnel

# 启动内网穿透
lt --port 3000
```

执行后会得到一个公网URL，如：`https://funny-cat-123.loca.lt`

#### 1.2 使用 ngrok

```bash
# 下载ngrok: https://ngrok.com/
# 启动穿透
ngrok http 3000
```

#### 1.3 使用 花生壳 或 frp

国内用户可以使用花生壳等工具。

### 方案2：云服务器部署

#### 2.1 部署到云服务器

将整个GIF识别服务部署到云服务器上：

```bash
# 1. 上传代码到服务器
scp -r ./GIF识别 user@your-server:/path/to/app

# 2. 安装依赖
npm install

# 3. 启动服务
node server.js

# 4. 配置nginx反向代理（可选）
```

#### 2.2 使用容器化部署

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 3000

CMD ["node", "server.js"]
```

### 方案3：FastGPT私有化部署

如果您有私有化部署的FastGPT，可以直接使用本地IP。

## 推荐配置步骤

### 步骤1：启动内网穿透

```bash
# 方法1：LocalTunnel
lt --port 3000

# 方法2：ngrok  
ngrok http 3000
```

### 步骤2：获取公网URL

内网穿透工具会提供一个公网URL，例如：
- LocalTunnel: `https://funny-cat-123.loca.lt`
- ngrok: `https://abc123.ngrok.io`

### 步骤3：更新FastGPT HTTP插件配置

将原来的：
```
http://localhost:3000/api/analyze-gif
```

改为：
```
https://your-tunnel-url.loca.lt/api/analyze-gif
```

### 步骤4：测试连接

```bash
# 测试公网访问
curl -X POST https://your-tunnel-url.loca.lt/api/analyze-gif \
  -H "Content-Type: application/json" \
  -d '{"gif_url": "https://example.com/test.gif", "user_question": "测试"}'
```

## 安全考虑

### 内网穿透安全提示

1. **临时使用**：内网穿透适合开发测试，不建议长期生产使用
2. **访问控制**：可以在服务中添加API密钥验证
3. **HTTPS**：确保使用HTTPS传输
4. **防火墙**：只暴露必要的端口

### 添加API密钥验证

在 `server.js` 中添加：

```javascript
// 添加API密钥验证中间件
const API_KEY = 'your-secret-api-key';

app.use('/api', (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
});
```

在FastGPT HTTP插件中添加Header：
```
X-API-Key: your-secret-api-key
```

## 最佳实践

### 开发环境
- 使用内网穿透工具（LocalTunnel、ngrok）
- 快速测试和调试

### 生产环境
- 部署到云服务器
- 配置域名和SSL证书
- 设置负载均衡和监控

## 常见问题

### Q: 内网穿透URL不稳定怎么办？
A: 
- 使用付费版ngrok获得固定域名
- 或者部署到云服务器获得固定IP

### Q: 速度慢怎么办？
A:
- 选择国内的内网穿透服务
- 或者使用国内云服务器

### Q: 安全性如何保证？
A:
- 添加API密钥验证
- 使用HTTPS传输
- 限制访问频率

## 总结

您的逻辑完全正确！本地服务确实需要暴露到公网才能被FastGPT调用。推荐的解决方案是：

1. **快速测试**：使用LocalTunnel内网穿透
2. **生产使用**：部署到云服务器
3. **企业使用**：FastGPT私有化部署

选择哪种方案取决于您的具体需求和使用场景。 