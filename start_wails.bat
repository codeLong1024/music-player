@echo off
chcp 65001 >nul
echo ========================================
echo   Go 音乐播放器 - Wails 桌面版
echo ========================================
echo.

REM 检查 Wails 构建的文件是否存在
if not exist "build\bin\music-player.exe" (
    echo [错误] 未找到 Wails 构建的应用程序
    echo 请先运行: wails build
    echo.
    echo 或者使用 API 测试模式: go run test_server.go
    pause
    exit /b 1
)

echo [信息] 正在启动 Wails 桌面应用...
echo [信息] 服务器地址: http://127.0.0.1:8888
echo.

REM 启动 Wails 构建的应用程序
build\bin\music-player.exe

pause
