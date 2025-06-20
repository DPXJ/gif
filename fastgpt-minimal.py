import requests
import base64

try:
    response = requests.get(gif_url, timeout=30)
    gif_base64 = base64.b64encode(response.content).decode('utf-8')
    gif_data = "data:image/gif;base64," + gif_base64
    
    success = True
    base64_frames = [gif_data]
    llm_prompt = user_question + "\n\n请分析这个GIF动图的内容。"
    message = "处理成功"
    error = ""
    
except Exception as e:
    success = False
    base64_frames = []
    llm_prompt = user_question + "\n\n处理GIF时出错: " + str(e)
    message = ""
    error = str(e)

print("success:", success)
print("base64_frames:", base64_frames)
print("llm_prompt:", llm_prompt)
print("message:", message)
print("error:", error) 