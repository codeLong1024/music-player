package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// SetupRoutes 配置路由
func SetupRoutes(router *gin.Engine, handler *Handler) {
	// CORS 中间件必须在路由定义前注册
	router.Use(CORSMiddleware())

	// favicon 处理
	router.GET("/favicon.ico", func(c *gin.Context) {
		c.Status(http.StatusNoContent)
	})

	// API 路由组
	api := router.Group("/api")
	{
		// 健康检查
		api.GET("/test", handler.Test)

		// 搜索歌曲
		api.GET("/search/:keyword", handler.Search)

		// 获取播放信息
		api.POST("/play", handler.Play)

		// 获取歌词
		api.GET("/lrc/:lkid", handler.GetLyrics)

		// 收藏相关
		api.POST("/favorite", handler.ToggleFavorite)
		api.GET("/favorites", handler.GetFavorites)

		// 播放历史
		api.POST("/history", handler.RecordPlayHistory)
		api.GET("/history", handler.GetPlayHistory)
		api.DELETE("/history", handler.ClearPlayHistory)

		// 播放列表（返回播放历史）
		api.GET("/playlist", handler.GetPlaylist)

		// 推荐
		api.GET("/recommendations", handler.GetRecommendations)
	}
}

// CORSMiddleware CORS 中间件
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
