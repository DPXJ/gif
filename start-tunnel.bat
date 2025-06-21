@echo off
echo 正在启动GIF识别服务...
echo.

echo 启动本地服务器 (端口3000)...
start "GIF Server" cmd /c "node server.js"

timeout /t 3 /nobreak >nul

echo 启动内网穿透...
start "LocalTunnel" cmd /c "lt --port 3000"

echo.
echo 服务启动完成！
echo.
echo 请在新打开的窗口中查看：
echo - 服务器窗口：显示本地服务状态
echo - LocalTunnel窗口：显示公网访问地址
echo.
echo 按任意键关闭此窗口...
pause >nul 