package proxy

import (
	"regexp"
	"strings"

	"music-player/internal/types"

	"github.com/PuerkitoBio/goquery"
)

// ParseSearchResults 解析搜索结果
func ParseSearchResults(html string) []types.Song {
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	if err != nil {
		return nil
	}

	var songs []types.Song
	seenIDs := make(map[string]bool)

	// 查找歌曲链接
	doc.Find("a[href]").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists {
			return
		}

		// 匹配 /mp3/xxx.html 格式
		if !strings.Contains(href, "/mp3/") || !strings.HasSuffix(href, ".html") {
			return
		}

		// 提取歌曲ID
		re := regexp.MustCompile(`/mp3/([a-z0-9]+)\.html$`)
		matches := re.FindStringSubmatch(href)
		if len(matches) < 2 {
			return
		}

		songID := matches[1]

		// 去重
		if seenIDs[songID] {
			return
		}
		seenIDs[songID] = true

		// 获取标题
		title := strings.TrimSpace(s.Text())

		// 清理标题
		title = regexp.MustCompile(`(?i)\[Mp3_Lrc\]|\[MP3_LRC\]`).ReplaceAllString(title, "")
		title = strings.TrimSpace(title)

		// 提取歌手和歌曲名
		artist := "未知歌手"
		songName := title

		// 尝试从标题中提取歌手信息
		// 格式1: 张学友《等你等到我心痛》
		// 格式2: 张学友&刘德华《歌曲名》
		// 格式3: 歌曲 - 歌手
		patterns := []string{
			`^(.+?)《(.+?)》`,            // 歌手《歌曲》
			`^(.*?)\s*[-—]\s*(.*)$`,      // 歌曲 - 歌手
			`^(.*?)\s+演唱[：:]\s*(.*)$`,  // 歌曲 演唱：歌手
		}

		for _, pattern := range patterns {
			re := regexp.MustCompile(pattern)
			matches := re.FindStringSubmatch(title)
			if len(matches) >= 3 {
				artist = strings.TrimSpace(matches[1])
				songName = strings.TrimSpace(matches[2])
				break
			}
		}

		songs = append(songs, types.Song{
			ID:        songID,
			Title:     songName,
			Artist:    artist,
			FullTitle: title,
			URL:       href,
		})

		// 限制返回数量
		if len(songs) >= 50 {
			return
		}
	})

	return songs
}
