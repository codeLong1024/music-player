package types

import "time"

// Song 歌曲信息
type Song struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Artist    string `json:"artist"`
	FullTitle string `json:"full_title,omitempty"`
	URL       string `json:"url,omitempty"`
	Cover     string `json:"cover,omitempty"`
	LrcID     string `json:"lrc_id,omitempty"`
}

// SearchResult 搜索结果响应
type SearchResult struct {
	Success bool   `json:"success"`
	Keyword string `json:"keyword,omitempty"`
	Count   int    `json:"count,omitempty"`
	Songs   []Song `json:"songs,omitempty"`
	Error   string `json:"error,omitempty"`
}

// PlayInfo 播放信息响应
type PlayInfo struct {
	Success bool   `json:"success"`
	Title   string `json:"title,omitempty"`
	URL     string `json:"url,omitempty"`
	Pic     string `json:"pic,omitempty"`
	Lkid    string `json:"lkid,omitempty"`
	Error   string `json:"error,omitempty"`
}

// LyricsResponse 歌词响应
type LyricsResponse struct {
	Success bool   `json:"success"`
	Lrc     string `json:"lrc,omitempty"`
	Error   string `json:"error,omitempty"`
}

// TestResponse 测试接口响应
type TestResponse struct {
	Success   bool    `json:"success"`
	Message   string  `json:"message"`
	Version   string  `json:"version"`
	Timestamp float64 `json:"timestamp"`
}

// FavoriteSong 收藏歌曲
type FavoriteSong struct {
	SongID  string    `json:"song_id"`
	Title   string    `json:"title"`
	Artist  string    `json:"artist"`
	Cover   string    `json:"cover,omitempty"`
	AddedAt time.Time `json:"added_at"`
}

// PlayHistory 播放历史
type PlayHistory struct {
	SongID   string    `json:"song_id"`
	Title    string    `json:"title"`
	Artist   string    `json:"artist"`
	PlayedAt time.Time `json:"played_at"`
	Duration float64   `json:"duration,omitempty"`
}

// Recommendation 推荐歌曲
type Recommendation struct {
	Song   Song    `json:"song"`
	Reason string  `json:"reason"`
	Score  float64 `json:"score"`
}
