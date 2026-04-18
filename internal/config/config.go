package config

import (
	"os"
	"path/filepath"
)

// Config 应用配置结构
type Config struct {
	AppName      string
	Version      string
	ServerHost   string
	ServerPort   int
	MusicSource  string
	LyricsSource string
}

// DefaultConfig 返回默认配置
func DefaultConfig() *Config {
	return &Config{
		AppName:      "25音乐播放器",
		Version:      "1.0.0",
		ServerHost:   "127.0.0.1",
		ServerPort:   8888,
		MusicSource:  "https://www.22a5.com",
		LyricsSource: "https://js.eev3.com",
	}
}

// GetUserHomeDir 获取用户主目录
func GetUserHomeDir() string {
	home, err := os.UserHomeDir()
	if err != nil {
		// 如果获取失败，返回当前目录
		return "."
	}
	return home
}

// GetDataDir 获取数据目录
func GetDataDir() string {
	home := GetUserHomeDir()
	return filepath.Join(home, ".go-music-player")
}

// GetCacheDir 获取缓存目录
func GetCacheDir() string {
	dataDir := GetDataDir()
	cacheDir := filepath.Join(dataDir, "cache")

	// 确保目录存在
	os.MkdirAll(cacheDir, 0755)

	return cacheDir
}
