//go:build ignore
// +build ignore

package main

import (
	"fmt"
	"net/http"
	"time"

	"music-player/internal/api"
	"music-player/internal/config"

	"github.com/gin-gonic/gin"
)

func main() {
	fmt.Println("=== Go 音乐播放器 - API 测试模式 ===")

	cfg := config.DefaultConfig()
	handler := api.NewHandler(cfg)

	// 创建 Gin 路由
	gin.SetMode(gin.DebugMode)
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	
	// 添加 CORS 中间件（全局）
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// 配置路由（内部还会再注册一次CORS，但不影响）
	api.SetupRoutes(router, handler)

	// 添加静态文件服务（递归包含css和js子目录）
	router.Static("/css", "./frontend/css")
	router.Static("/js", "./frontend/js")
	router.GET("/", func(c *gin.Context) {
		c.File("./frontend/index.html")
	})

	addr := fmt.Sprintf("%s:%d", cfg.ServerHost, cfg.ServerPort)
	fmt.Printf("服务器启动在: http://%s\n", addr)
	fmt.Printf("测试接口: http://%s/api/test\n", addr)
	fmt.Printf("按 Ctrl+C 停止服务器\n")

	server := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil {
		fmt.Printf("服务器错误: %v\n", err)
	}
}
