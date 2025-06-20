import urllib.request
import base64

# 使用Python标准库下载GIF
response = urllib.request.urlopen(gif_url, timeout=30)
gif_content = response.read()

# 转换为Base64
gif_base64 = base64.b64encode(gif_content).decode('utf-8')
gif_data = "data:image/gif;base64," + gif_base64

# 构建结果
success = True
base64_frames = [gif_data]
llm_prompt = user_question + "\n\n请分析这个GIF动图的内容，描述其中的视觉元素、动作过程和表达的含义。"
message = "GIF处理成功"

print("success:", success)
print("base64_frames:", base64_frames)
print("llm_prompt:", llm_prompt)
print("message:", message) 