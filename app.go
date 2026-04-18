package main

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"music-player/internal/api"
	"music-player/internal/config"

	"github.com/gin-gonic/gin"
)

// App 应用结构
type App struct {
	ctx     context.Context
	cfg     *config.Config
	handler *api.Handler
	router  *gin.Engine
}

// NewApp 创建新应用
func NewApp() *App {
	cfg := config.DefaultConfig()
	handler := api.NewHandler(cfg)

	// 创建 Gin 路由
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// 配置路由
	api.SetupRoutes(router, handler)

	return &App{
		cfg:     cfg,
		handler: handler,
		router:  router,
	}
}

// startup 应用启动时调用
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	
	fmt.Printf("=== %s v%s ===\n", a.cfg.AppName, a.cfg.Version)
	fmt.Printf("配置加载完成\n")
	
	// 启动 Gin HTTP 服务器
	addr := fmt.Sprintf("%s:%d", a.cfg.ServerHost, a.cfg.ServerPort)
	fmt.Printf("API 服务器启动在: http://%s\n", addr)
	
	go func() {
		if err := a.router.Run(addr); err != nil && err != http.ErrServerClosed {
			fmt.Printf("API 服务器错误: %v\n", err)
		}
	}()
	
	// 等待一小段时间确保服务器启动
	time.Sleep(100 * time.Millisecond)
}

// shutdown 应用关闭时调用
func (a *App) shutdown(ctx context.Context) {
	fmt.Println("\n应用正在关闭...")
	fmt.Println("感谢使用！")
}

// domReady DOM 加载完成后调用
func (a *App) domReady(ctx context.Context) {
	fmt.Println("界面已就绪")
}
