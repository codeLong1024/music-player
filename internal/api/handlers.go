package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"time"

	"music-player/internal/config"
	"music-player/internal/proxy"
	"music-player/internal/types"

	"github.com/gin-gonic/gin"
)

// Handler API 处理器
type Handler struct {
	cfg    *config.Config
	client *proxy.HTTPClient
	cache  *proxy.Cache
}

// NewHandler 创建新的 API 处理器
func NewHandler(cfg *config.Config) *Handler {
	return &Handler{
		cfg:    cfg,
		client: proxy.NewHTTPClient(),
		cache:  proxy.NewCache(),
	}
}

// Search 搜索歌曲
func (h *Handler) Search(c *gin.Context) {
	keyword := c.Param("keyword")
	if keyword == "" {
		c.JSON(http.StatusBadRequest, types.SearchResult{
			Success: false,
			Error:   "缺少搜索关键词",
		})
		return
	}

	fmt.Printf("[搜索] 关键词: %s\n", keyword)

	// 构建搜索URL
	searchURL := fmt.Sprintf("%s/so/%s.html", h.cfg.MusicSource, keyword)

	// 检查缓存
	if cached, ok := h.cache.Get(searchURL); ok {
		fmt.Println("[搜索] 使用缓存结果")
		if songs, ok := cached.([]types.Song); ok {
			c.JSON(http.StatusOK, types.SearchResult{
				Success: true,
				Keyword: keyword,
				Count:   len(songs),
				Songs:   songs,
			})
			return
		}
	}

	// 发送请求
	resp, err := h.client.Get(searchURL)
	if err != nil {
		fmt.Printf("[搜索错误] %v\n", err)
		c.JSON(http.StatusInternalServerError, types.SearchResult{
			Success: false,
			Error:   fmt.Sprintf("请求失败: %v", err),
		})
		return
	}

	if resp.StatusCode() != http.StatusOK {
		c.JSON(http.StatusBadGateway, types.SearchResult{
			Success: false,
			Error:   fmt.Sprintf("服务器返回错误: %d", resp.StatusCode()),
		})
		return
	}

	// 解析结果
	songs := proxy.ParseSearchResults(resp.String())

	if len(songs) == 0 {
		fmt.Println("[搜索] 未找到歌曲")
		c.JSON(http.StatusOK, types.SearchResult{
			Success: false,
			Error:   "未找到相关歌曲",
			Keyword: keyword,
		})
		return
	}

	// 保存到缓存
	h.cache.Set(searchURL, songs)

	fmt.Printf("[搜索] 找到 %d 首歌曲\n", len(songs))
	c.JSON(http.StatusOK, types.SearchResult{
		Success: true,
		Keyword: keyword,
		Count:   len(songs),
		Songs:   songs,
	})
}

// Play 获取播放信息
func (h *Handler) Play(c *gin.Context) {
	var req struct {
		ID   string `form:"id" binding:"required"`
		Type string `form:"type"`
	}

	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, types.PlayInfo{
			Success: false,
			Error:   "缺少歌曲ID",
		})
		return
	}

	fmt.Printf("[播放] 歌曲ID: %s\n", req.ID)

	// 构建播放信息URL
	playURL := fmt.Sprintf("%s/js/play.php", h.cfg.MusicSource)

	// 设置额外请求头
	h.client.GetClient().SetHeader("Origin", h.cfg.MusicSource)
	h.client.GetClient().SetHeader("Referer", h.cfg.MusicSource+"/")

	// 发送请求
	resp, err := h.client.Post(playURL, map[string]string{
		"id":   req.ID,
		"type": "music",
	})
	if err != nil {
		fmt.Printf("[播放错误] %v\n", err)
		c.JSON(http.StatusInternalServerError, types.PlayInfo{
			Success: false,
			Error:   fmt.Sprintf("请求失败: %v", err),
		})
		return
	}

	if resp.StatusCode() != http.StatusOK {
		c.JSON(http.StatusBadGateway, types.PlayInfo{
			Success: false,
			Error:   fmt.Sprintf("服务器返回错误: %d", resp.StatusCode()),
		})
		return
	}

	// 解析 JSON 响应
	var result map[string]interface{}
	if err := json.Unmarshal(resp.Body(), &result); err != nil {
		c.JSON(http.StatusInternalServerError, types.PlayInfo{
			Success: false,
			Error:   "解析响应失败",
		})
		return
	}

	// 检查是否成功
	msg := result["msg"]
	// JSON 解析后数字会变成 float64
	isSuccess := false
	switch v := msg.(type) {
	case float64:
		isSuccess = v == 1
	case string:
		isSuccess = v == "1"
	case int:
		isSuccess = v == 1
	}

	if !isSuccess {
		fmt.Printf("[播放] 失败: %v\n", result)
		c.JSON(http.StatusOK, types.PlayInfo{
			Success: false,
			Error:   "获取播放信息失败",
		})
		return
	}

	fmt.Printf("[播放] 成功: %v\n", result["title"])

	// 清理标题
	title := ""
	if t, ok := result["title"].(string); ok {
		title = t
	}

	playInfo := types.PlayInfo{
		Success: true,
		Title:   title,
	}

	if url, ok := result["url"].(string); ok {
		playInfo.URL = url
	}
	if pic, ok := result["pic"].(string); ok {
		playInfo.Pic = pic
	}
	// lkid可能是string或number类型
	if lkid, ok := result["lkid"].(string); ok {
		playInfo.Lkid = lkid
		fmt.Printf("[播放] 提取到lkid (string): %s\n", lkid)
	} else if lkid, ok := result["lkid"].(float64); ok {
		playInfo.Lkid = fmt.Sprintf("%.0f", lkid)
		fmt.Printf("[播放] 提取到lkid (number): %s\n", playInfo.Lkid)
	} else {
		fmt.Printf("[播放] 未找到lkid字段，原始数据: %v\n", result)
	}

	c.JSON(http.StatusOK, playInfo)
}

// GetLyrics 获取歌词
func (h *Handler) GetLyrics(c *gin.Context) {
	lkid := c.Param("lkid")
	if lkid == "" {
		c.JSON(http.StatusBadRequest, types.LyricsResponse{
			Success: false,
			Error:   "缺少歌词ID",
		})
		return
	}

	fmt.Printf("[歌词] 歌词ID: %s\n", lkid)

	// 构建歌词URL
	lrcURL := fmt.Sprintf("%s/lrc.php?cid=%s", h.cfg.LyricsSource, lkid)

	// 发送请求
	resp, err := h.client.Get(lrcURL)
	if err != nil {
		fmt.Printf("[歌词错误] %v\n", err)
		c.JSON(http.StatusInternalServerError, types.LyricsResponse{
			Success: false,
			Error:   fmt.Sprintf("请求失败: %v", err),
		})
		return
	}

	if resp.StatusCode() != http.StatusOK {
		c.JSON(http.StatusBadGateway, types.LyricsResponse{
			Success: false,
			Error:   fmt.Sprintf("服务器返回错误: %d", resp.StatusCode()),
		})
		return
	}

	// 尝试解析 JSON
	var result map[string]interface{}
	if err := json.Unmarshal(resp.Body(), &result); err == nil {
		if lrc, ok := result["lrc"].(string); ok {
			fmt.Printf("[歌词] 成功获取歌词，长度: %d\n", len(lrc))
			c.JSON(http.StatusOK, types.LyricsResponse{
				Success: true,
				Lrc:     lrc,
			})
			return
		}
	}

	// 尝试直接返回文本
	text := resp.String()
	if strings.Contains(text, "[00:") {
		// 简单的歌词格式检查
		fmt.Printf("[歌词] 从文本提取歌词，长度: %d\n", len(text))
		c.JSON(http.StatusOK, types.LyricsResponse{
			Success: true,
			Lrc:     text,
		})
		return
	}

	c.JSON(http.StatusOK, types.LyricsResponse{
		Success: false,
		Error:   "无效的歌词格式",
	})
}

// Test 健康检查
func (h *Handler) Test(c *gin.Context) {
	c.JSON(http.StatusOK, types.TestResponse{
		Success:   true,
		Message:   "服务器运行正常",
		Version:   h.cfg.Version,
		Timestamp: float64(time.Now().Unix()),
	})
}

// ToggleFavorite 切换收藏状态
func (h *Handler) ToggleFavorite(c *gin.Context) {
	var song types.Song

	if err := c.ShouldBindJSON(&song); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "参数错误"})
		return
	}

	// 验证必要字段
	if song.ID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "缺少歌曲ID"})
		return
	}

	// 检查是否已收藏
	isFavorited := h.cache.IsFavorited(song.ID)

	if isFavorited {
		h.cache.RemoveFavorite(song.ID)
		c.JSON(http.StatusOK, gin.H{"success": true, "favorited": false})
	} else {
		h.cache.AddFavorite(types.FavoriteSong{
			SongID:  song.ID,
			Title:   song.Title,
			Artist:  song.Artist,
			Cover:   song.Cover,
			AddedAt: time.Now(),
		})
		c.JSON(http.StatusOK, gin.H{"success": true, "favorited": true})
	}
}

// GetFavorites 获取收藏列表
func (h *Handler) GetFavorites(c *gin.Context) {
	favorites := h.cache.GetFavorites()
	
	// 转换为标准 Song 对象数组
	songs := make([]types.Song, 0, len(favorites))
	for _, fav := range favorites {
		songs = append(songs, types.Song{
			ID:     fav.SongID,
			Title:  fav.Title,
			Artist: fav.Artist,
			Cover:  fav.Cover,
		})
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"count":     len(songs),
		"favorites": songs,  // 返回标准 Song 对象
	})
}

// RecordPlayHistory 记录播放历史
func (h *Handler) RecordPlayHistory(c *gin.Context) {
	var song types.Song

	if err := c.ShouldBindJSON(&song); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "参数错误"})
		return
	}

	// 验证必要字段
	if song.ID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "缺少歌曲ID"})
		return
	}

	h.cache.AddPlayHistory(types.PlayHistory{
		SongID:   song.ID,
		Title:    song.Title,
		Artist:   song.Artist,
		PlayedAt: time.Now(),
	})

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// GetPlayHistory 获取播放历史
func (h *Handler) GetPlayHistory(c *gin.Context) {
	limit := 50 // 默认返回最近50条
	if l := c.Query("limit"); l != "" {
		if _, err := fmt.Sscanf(l, "%d", &limit); err != nil {
			limit = 50
		}
	}
	history := h.cache.GetPlayHistory(limit)
	
	// 转换为标准 Song 对象数组
	songs := make([]types.Song, 0, len(history))
	for _, h := range history {
		songs = append(songs, types.Song{
			ID:     h.SongID,
			Title:  h.Title,
			Artist: h.Artist,
		})
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"count":   len(songs),
		"history": songs,  // 返回标准 Song 对象
	})
}

// ClearPlayHistory 清空播放历史
func (h *Handler) ClearPlayHistory(c *gin.Context) {
	h.cache.ClearPlayHistory()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "历史记录已清空",
	})
}

// GetPlaylist 获取播放列表（基于播放历史）
func (h *Handler) GetPlaylist(c *gin.Context) {
	// 播放列表基于播放历史
	history := h.cache.GetPlayHistory(50)
	
	// 转换为标准 Song 对象数组
	songs := make([]types.Song, 0, len(history))
	for _, h := range history {
		songs = append(songs, types.Song{
			ID:     h.SongID,
			Title:  h.Title,
			Artist: h.Artist,
		})
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"count":   len(songs),
		"songs":   songs,  // 返回标准 Song 对象
	})
}

// GetRecommendations 获取推荐歌曲
func (h *Handler) GetRecommendations(c *gin.Context) {
	// 基于播放历史和收藏生成简单推荐
	recommendations := h.generateRecommendations()
	c.JSON(http.StatusOK, gin.H{
		"success":         true,
		"recommendations": recommendations,
	})
}

// generateRecommendations 生成推荐歌曲（内部方法）
func (h *Handler) generateRecommendations() []types.Recommendation {
	favorites := h.cache.GetFavorites()
	history := h.cache.GetPlayHistory(100)

	// 统计最常听的歌手
	artistCount := make(map[string]float64)
	for _, fav := range favorites {
		artistCount[fav.Artist] += 1.0
	}
	for _, hist := range history {
		artistCount[hist.Artist] += 0.5
	}

	// 取前3个最常听的歌手
	type artistScore struct {
		Name  string
		Score float64
	}
	var artists []artistScore
	for name, score := range artistCount {
		artists = append(artists, artistScore{Name: name, Score: score})
	}
	sort.Slice(artists, func(i, j int) bool {
		return artists[i].Score > artists[j].Score
	})

	// 限制为前3个
	if len(artists) > 3 {
		artists = artists[:3]
	}

	// 这里简化处理，返回空列表
	// 实际应用中需要调用搜索API获取这些歌手的其他歌曲
	_ = artists

	return []types.Recommendation{}
}
