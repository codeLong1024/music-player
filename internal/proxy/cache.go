package proxy

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"

	"music-player/internal/config"
	"music-player/internal/types"
)

// CacheItem 缓存项
type CacheItem struct {
	Data      interface{} `json:"data"`
	Timestamp int64       `json:"timestamp"`
}

// Cache 缓存管理器
type Cache struct {
	memoryCache sync.Map
	cacheDir    string
	ttl         time.Duration
	mu          sync.RWMutex
	
	// 收藏和历史数据
	favorites   map[string]types.FavoriteSong
	playHistory []types.PlayHistory
}

// NewCache 创建新的缓存管理器
func NewCache() *Cache {
	c := &Cache{
		cacheDir:    config.GetCacheDir(),
		ttl:         1 * time.Hour, // 默认缓存1小时
		favorites:   make(map[string]types.FavoriteSong),
		playHistory: make([]types.PlayHistory, 0),
	}
	c.loadPersistentData()
	return c
}

// SetTTL 设置缓存过期时间
func (c *Cache) SetTTL(duration time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.ttl = duration
}

// generateKey 生成缓存键
func generateKey(key string) string {
	hash := md5.Sum([]byte(key))
	return hex.EncodeToString(hash[:])
}

// Get 从缓存获取数据
func (c *Cache) Get(key string) (interface{}, bool) {
	cacheKey := generateKey(key)

	// 先检查内存缓存
	if item, ok := c.memoryCache.Load(cacheKey); ok {
		cacheItem := item.(*CacheItem)
		// 检查是否过期
		if time.Now().Unix()-cacheItem.Timestamp < int64(c.ttl.Seconds()) {
			return cacheItem.Data, true
		}
		// 过期了，删除
		c.memoryCache.Delete(cacheKey)
	}

	// 再检查文件缓存
	filePath := filepath.Join(c.cacheDir, cacheKey+".json")
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, false
	}

	var cacheItem CacheItem
	if err := json.Unmarshal(data, &cacheItem); err != nil {
		return nil, false
	}

	// 检查是否过期
	if time.Now().Unix()-cacheItem.Timestamp >= int64(c.ttl.Seconds()) {
		os.Remove(filePath)
		return nil, false
	}

	// 加载到内存缓存
	c.memoryCache.Store(cacheKey, &cacheItem)

	return cacheItem.Data, true
}

// Set 设置缓存
func (c *Cache) Set(key string, data interface{}) error {
	cacheKey := generateKey(key)
	cacheItem := &CacheItem{
		Data:      data,
		Timestamp: time.Now().Unix(),
	}

	// 保存到内存
	c.memoryCache.Store(cacheKey, cacheItem)

	// 保存到文件
	filePath := filepath.Join(c.cacheDir, cacheKey+".json")
	jsonData, err := json.Marshal(cacheItem)
	if err != nil {
		return fmt.Errorf("序列化缓存数据失败: %w", err)
	}

	if err := os.WriteFile(filePath, jsonData, 0644); err != nil {
		return fmt.Errorf("写入缓存文件失败: %w", err)
	}

	return nil
}

// Delete 删除缓存
func (c *Cache) Delete(key string) {
	cacheKey := generateKey(key)
	c.memoryCache.Delete(cacheKey)

	filePath := filepath.Join(c.cacheDir, cacheKey+".json")
	os.Remove(filePath)
}

// Clear 清空所有缓存
func (c *Cache) Clear() {
	c.memoryCache.Range(func(key, value interface{}) bool {
		c.memoryCache.Delete(key)
		return true
	})

	// 清空文件缓存
	files, err := os.ReadDir(c.cacheDir)
	if err != nil {
		return
	}

	for _, file := range files {
		if filepath.Ext(file.Name()) == ".json" {
			os.Remove(filepath.Join(c.cacheDir, file.Name()))
		}
	}
}

// loadPersistentData 加载持久化数据
func (c *Cache) loadPersistentData() {
	// 加载收藏数据
	favPath := filepath.Join(c.cacheDir, "favorites.json")
	if data, err := os.ReadFile(favPath); err == nil {
		var favorites map[string]types.FavoriteSong
		if err := json.Unmarshal(data, &favorites); err == nil {
			c.favorites = favorites
		}
	}
	
	// 加载播放历史
	histPath := filepath.Join(c.cacheDir, "history.json")
	if data, err := os.ReadFile(histPath); err == nil {
		var history []types.PlayHistory
		if err := json.Unmarshal(data, &history); err == nil {
			c.playHistory = history
		}
	}
}

// saveFavorites 保存收藏数据
func (c *Cache) saveFavorites() {
	favPath := filepath.Join(c.cacheDir, "favorites.json")
	if data, err := json.Marshal(c.favorites); err == nil {
		os.WriteFile(favPath, data, 0644)
	}
}

// savePlayHistory 保存播放历史
func (c *Cache) savePlayHistory() {
	histPath := filepath.Join(c.cacheDir, "history.json")
	if data, err := json.Marshal(c.playHistory); err == nil {
		os.WriteFile(histPath, data, 0644)
	}
}

// AddFavorite 添加收藏
func (c *Cache) AddFavorite(song types.FavoriteSong) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.favorites[song.SongID] = song
	c.saveFavorites()
}

// RemoveFavorite 移除收藏
func (c *Cache) RemoveFavorite(songID string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.favorites, songID)
	c.saveFavorites()
}

// IsFavorited 检查是否已收藏
func (c *Cache) IsFavorited(songID string) bool {
	c.mu.RLock()
	defer c.mu.RUnlock()
	_, exists := c.favorites[songID]
	return exists
}

// GetFavorites 获取收藏列表
func (c *Cache) GetFavorites() []types.FavoriteSong {
	c.mu.RLock()
	defer c.mu.RUnlock()
	favorites := make([]types.FavoriteSong, 0, len(c.favorites))
	for _, fav := range c.favorites {
		favorites = append(favorites, fav)
	}
	// 按添加时间倒序
	sort.Slice(favorites, func(i, j int) bool {
		return favorites[i].AddedAt.After(favorites[j].AddedAt)
	})
	return favorites
}

// AddPlayHistory 添加播放历史（基于歌曲ID去重）
func (c *Cache) AddPlayHistory(history types.PlayHistory) {
	c.mu.Lock()
	defer c.mu.Unlock()
	
	// 检查是否已存在该歌曲的历史记录
	foundIndex := -1
	for i, h := range c.playHistory {
		if h.SongID == history.SongID {
			foundIndex = i
			break
		}
	}
	
	if foundIndex != -1 {
		// 如果已存在，删除旧记录
		c.playHistory = append(c.playHistory[:foundIndex], c.playHistory[foundIndex+1:]...)
	}
	
	// 将新记录添加到最前面（最新的在前）
	c.playHistory = append([]types.PlayHistory{history}, c.playHistory...)
	
	// 只保留最近1000条
	if len(c.playHistory) > 1000 {
		c.playHistory = c.playHistory[:1000]
	}
	
	c.savePlayHistory()
}

// GetPlayHistory 获取播放历史
func (c *Cache) GetPlayHistory(limit int) []types.PlayHistory {
	c.mu.RLock()
	defer c.mu.RUnlock()
	if limit > len(c.playHistory) {
		limit = len(c.playHistory)
	}
	// 数据已经按最新在前排序，直接返回前limit条
	result := make([]types.PlayHistory, limit)
	copy(result, c.playHistory[:limit])
	return result
}

// ClearPlayHistory 清空播放历史
func (c *Cache) ClearPlayHistory() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.playHistory = make([]types.PlayHistory, 0)
	c.savePlayHistory()
}
