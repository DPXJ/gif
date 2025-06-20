# FastGPT Python 插件 - GIF 内容理解 (修复版)
import requests
import base64
import json

def main(gif_url, user_prompt):
    try:
        if not gif_url or not user_prompt:
            raise ValueError("缺少必要参数")
        
        if not gif_url.startswith(('http://', 'https://')):
            raise ValueError("请提供有效的URL")
        
        print(f"开始处理 GIF: {gif_url}")
        
        response = requests.get(gif_url, timeout=30)
        response.raise_for_status()
        
        content_type = response.headers.get('content-type', '')
        if 'image/gif' not in content_type:
            print(f"警告：文件类型可能不是GIF ({content_type})")
        
        file_size = len(response.content)
        print(f"GIF文件大小: {file_size / 1024 / 1024:.2f}MB")
        
        if file_size > 10 * 1024 * 1024:
            raise ValueError("GIF文件过大，请使用小于10MB的文件")
        
        print("转换为Base64格式...")
        gif_base64 = base64.b64encode(response.content).decode('utf-8')
        gif_data_url = f"data:image/gif;base64,{gif_base64}"
        
        base64_frames = [gif_data_url, gif_data_url]
        
        llm_prompt = f"""{user_prompt}

请分析这个GIF动图的内容。我提供的是完整的GIF文件，请基于动态内容进行分析，包括：

1. 主要视觉元素：描述GIF中的主要对象、人物或场景
2. 动作过程：描述GIF中发生的动作或变化过程
3. 情感表达：如果是表情包，请解释表达的情绪或含义
4. 用途分析：分析这个GIF可能的使用场景或目的

文件信息：
- 文件大小：{file_size / 1024:.1f}KB
- 内容类型：{content_type}

请详细描述您观察到的内容。"""

        print("处理完成！")
        
        result = {
            "success": True,
            "base64_frames": base64_frames,
            "llm_prompt": llm_prompt,
            "frame_count": 1,
            "sample_count": len(base64_frames),
            "file_size_kb": round(file_size / 1024, 1),
            "content_type": content_type,
            "message": f"成功处理GIF文件 ({file_size / 1024:.1f}KB)"
        }
        
        return result
        
    except requests.exceptions.RequestException as e:
        error_msg = f"下载GIF失败: {str(e)}"
        print(f"错误: {error_msg}")
        return create_error_result(error_msg, gif_url, user_prompt)
        
    except ValueError as e:
        error_msg = str(e)
        print(f"参数错误: {error_msg}")
        return create_error_result(error_msg, gif_url, user_prompt)
        
    except Exception as e:
        error_msg = f"处理GIF时发生未知错误: {str(e)}"
        print(f"未知错误: {error_msg}")
        return create_error_result(error_msg, gif_url, user_prompt)

def create_error_result(error_msg, gif_url="", user_prompt=""):
    fallback_prompt = f"""{user_prompt or '请分析这个GIF'}

很抱歉，由于技术限制无法直接处理这个GIF文件。

GIF URL: {gif_url or '未提供'}
错误信息: {error_msg}

建议解决方案：
1. 检查GIF URL是否可以公开访问
2. 确认文件大小不超过10MB
3. 尝试使用其他GIF文件
4. 或者描述GIF内容让我帮助分析

请提供更多信息以便我协助您。"""

    return {
        "success": False,
        "base64_frames": [],
        "llm_prompt": fallback_prompt,
        "frame_count": 0,
        "sample_count": 0,
        "file_size_kb": 0,
        "content_type": "",
        "error": error_msg
    }

# FastGPT 调用入口
result = main(gif_url, user_question)
print(json.dumps(result, indent=2, ensure_ascii=False)) 