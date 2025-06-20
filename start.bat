@echo off
echo ========================================
echo    GIF帧分解工具 - 启动脚本
echo ========================================
echo.

echo 正在检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo Node.js环境检查通过
echo.

echo 正在安装依赖包...
npm install
if errorlevel 1 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo 依赖安装完成
echo.

echo 正在启动GIF帧分解服务...
echo 服务将在 http://localhost:3000 启动
echo 按 Ctrl+C 停止服务
echo.

npm start

pause 