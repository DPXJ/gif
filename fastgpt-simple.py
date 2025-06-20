import requests
import base64
import json

# 主处理函数
def process_gif(gif_url, user_prompt):
    try:
        # 参数检查
        if not gif_url or not user_prompt:
            return {"success": False, "error": "缺少参数"}
        
        # 下载GIF
        response = requests.get(gif_url, timeout=30)
        response.raise_for_status()
        
        # 转换为Base64
        gif_base64 = base64.b64encode(response.content).decode('utf-8')
        gif_data = f"data:image/gif;base64,{gif_base64}"
        
        # 构建提示词
        prompt = f"{user_prompt}\n\n请分析这个GIF动图的内容，描述其中的视觉元素、动作过程和表达的含义。"
        
        # 返回结果
        return {
            "success": True,
            "base64_frames": [gif_data],
            "llm_prompt": prompt,
            "message": "处理成功"
        }
        
    except Exception as e:
        return {
            "success": False,
            "base64_frames": [],
            "llm_prompt": f"{user_prompt}\n\n处理GIF时出错: {str(e)}",
            "error": str(e)
        }

# 执行处理
result = process_gif(gif_url, user_question)

# 输出结果
print("处理结果:")
for key, value in result.items():
    print(f"{key}: {value}") 