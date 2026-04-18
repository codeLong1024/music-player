@echo off
chcp 65001 >nul
echo ========================================
echo   Go 音乐播放器 - API 测试模式
echo ========================================
echo.

REM 检查测试服务器文件是否存在
if not exist "test_server.go" (
    echo [错误] 未找到 test_server.go
    echo 请使用 start_wails.bat 启动桌面应用
    pause
    exit /b 1
)

echo [信息] 正在启动 API 测试服务器...
echo [信息] 服务器地址: http://127.0.0.1:8888
echo [信息] 按 Ctrl+C 停止服务器
echo.

REM 启动测试服务器
go run test_server.go

pause
