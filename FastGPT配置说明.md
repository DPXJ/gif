# FastGPT GIF识别插件配置说明

## 🚀 快速配置步骤

### 1. 获取公网访问地址

在LocalTunnel窗口中查看输出的公网地址，格式类似：
```
your tunnel URL is: https://xxxx-xx-xx-xxx-xxx.loca.lt
```

### 2. FastGPT HTTP插件配置

在FastGPT中创建HTTP插件，使用以下配置：

#### 基本信息
- **插件名称**: GIF内容识别
- **插件描述**: 分析GIF动图内容并提取关键帧

#### HTTP配置
- **请求方式**: POST
- **请求地址**: `https://你的隧道地址.loca.lt/api/analyze-gif`
- **请求头**: 
  ```json
  {
    "Content-Type": "application/json"
  }
  ```

#### 输入参数配置
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `gif_url` | string | ✅ | GIF文件的公开URL地址 |
| `question` | string | ✅ | 想要询问的问题 |

#### 请求体示例
```json
{
  "gif_url": "{{gif_url}}",
  "question": "{{question}}"
}
```

#### 输出字段配置
| 字段名 | 类型 | 描述 |
|--------|------|------|
| `success` | boolean | 处理是否成功 |
| `analysis` | string | AI分析结果 |
| `frame_count` | number | GIF总帧数 |
| `sample_count` | number | 抽样帧数量 |
| `message` | string | 处理信息 |
| `error` | string | 错误信息（如果有） |

### 3. 使用示例

#### 输入参数：
- gif_url: `https://example.com/sample.gif`
- question: `这个GIF显示了什么内容？`

#### 预期输出：
```json
{
  "success": true,
  "analysis": "这个GIF显示了一个人在跳舞，动作流畅优美...",
  "frame_count": 24,
  "sample_count": 5,
  "message": "处理成功"
}
```

## 🔧 故障排除

### 常见问题

**Q: 无法访问公网地址**
- 检查LocalTunnel是否正常运行
- 尝试刷新获取新的隧道地址
- 检查防火墙设置

**Q: 提示"下载失败"**
- 确认GIF URL是否可以公开访问
- 检查网络连接
- 确认GIF文件格式正确

**Q: 处理速度慢**
- 大文件需要更长处理时间
- 建议使用小于10MB的GIF文件
- 高帧数GIF会影响处理速度

### 调试方法

1. **测试本地服务**:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **测试公网访问**:
   ```bash
   curl https://你的隧道地址.loca.lt/api/health
   ```

3. **查看服务日志**:
   在服务器窗口中查看实时日志输出

## 📝 注意事项

1. **稳定性**: LocalTunnel连接可能不稳定，如需长期使用建议考虑付费方案
2. **安全性**: 当前配置仅适合测试使用，生产环境需要更多安全配置
3. **性能**: 大文件和高帧数GIF会消耗更多资源和时间
4. **网络**: 需要稳定的网络连接来维持隧道

## 🔄 重启服务

如果需要重启服务，可以：
1. 关闭所有相关窗口
2. 运行 `start-tunnel.bat` 重新启动
3. 或者手动分别启动服务器和隧道

---

配置完成后就可以在FastGPT中使用GIF识别功能了！ 