# FastGPT 纯文本版本 - 只生成分析提示

# 检查输入变量是否存在
try:
    url = gif_url
except:
    url = "未提供"

try:
    question = user_question  
except:
    question = "请分析这个GIF"

# 生成分析提示词
prompt = question + "\n\n"
prompt += "GIF链接：" + str(url) + "\n\n"
prompt += "请帮助用户分析这个GIF动图。如果您可以访问链接，请直接分析内容。"
prompt += "如果无法访问，请指导用户提供GIF的描述或截图。"

# 输出提示词
print(prompt) 