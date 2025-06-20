# FastGPT 超简版本 - 纯文本分析

# 获取输入参数
gif_url_input = gif_url if 'gif_url' in locals() else "未提供URL"
user_question_input = user_question if 'user_question' in locals() else "请分析这个GIF"

# 简单的文本分析
analysis_text = "GIF分析请求：\n"
analysis_text += "用户问题：" + str(user_question_input) + "\n"
analysis_text += "GIF链接：" + str(gif_url_input) + "\n\n"

# 根据URL特征提供建议
if "gif" in str(gif_url_input).lower():
    analysis_text += "检测到GIF文件链接。\n"
else:
    analysis_text += "请确认提供的是有效的GIF链接。\n"

analysis_text += "\n由于技术限制，无法直接处理GIF文件。\n"
analysis_text += "建议：请描述GIF的具体内容，或提供关键帧截图进行分析。"

# 输出结果
print(analysis_text) 