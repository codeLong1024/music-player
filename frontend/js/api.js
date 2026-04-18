// API调用封装

// Wails 应用中，API 服务器运行在 127.0.0.1:8888
const API_BASE = 'http://127.0.0.1:8888/api';

/**
 * 通用请求函数
 */
async function request(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    // 深度合并 headers
    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };
    
    try {
        const response = await fetch(API_BASE + url, config);
        console.log('[API]', response.status, url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[API] 返回数据:', data);
        return data;
    } catch (error) {
        console.error('[API] 请求失败:', error);
        showToast('网络请求失败', 2000);
        throw error;
    }
}

/**
 * 搜索歌曲
 */
async function searchSongs(keyword) {
    if (!keyword || keyword.trim() === '') {
        return { songs: [] };
    }
    
    const data = await request(`/search/${encodeURIComponent(keyword)}`);
    // 确保返回标准结构
    return {
        success: data.success !== false,
        songs: data.songs || data.results || [],
        error: data.error
    };
}

/**
 * 获取播放列表
 */
async function getPlaylist() {
    // 优先尝试 /api/playlist，如果失败则降级到 history
    try {
        const data = await request('/playlist');
        return data.songs || [];
    } catch (e) {
        const data = await request('/history');
        return data.history || data.songs || [];
    }
}

/**
 * 获取播放信息（真实播放地址）
 */
async function getPlayInfo(songId) {
    if (!songId) {
        console.error('[API] 播放信息请求失败: 缺少歌曲ID');
        return null;
    }
    
    const data = await request('/play', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `id=${encodeURIComponent(songId)}`
    });
    return data;
}

/**
 * 添加歌曲到播放列表（添加到历史）
 */
async function addToPlaylist(song) {
    const data = await request('/history', {
        method: 'POST',
        body: JSON.stringify(song)
    });
    
    if (data.success) {
        showToast('已添加到播放列表');
    }
    
    return data;
}

/**
 * 从播放列表移除歌曲
 */
async function removeFromPlaylist(songId) {
    // 前端本地移除，不请求后端
    showToast('已从播放列表移除');
    return { success: true };
}

/**
 * 清空播放列表
 */
async function clearPlaylist() {
    // 前端本地清空，不请求后端
    showToast('播放列表已清空');
    return { success: true };
}

/**
 * 切换收藏状态
 */
async function toggleFavorite(song) {
    // 确保字段名与后端 Song 结构一致
    const payload = {
        id: song.id,
        title: song.title || '未知歌曲',
        artist: song.artist || '未知歌手',
        cover: song.cover || ''
    };
    
    console.log('[收藏] 发送的payload:', payload);
    
    const data = await request('/favorite', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    
    return data;
}

/**
 * 获取收藏列表
 */
async function getFavorites() {
    const data = await request('/favorites');
    return data.favorites || [];
}

/**
 * 检查是否已收藏
 */
async function isFavorited(songId) {
    const favs = await getFavorites();
    return favs.some(f => f.id === songId);
}

/**
 * 添加播放历史
 */
async function addHistory(song) {
    return await request('/history', {
        method: 'POST',
        body: JSON.stringify(song)
    });
}

/**
 * 获取播放历史
 */
async function getHistory() {
    const data = await request('/history');
    return data.history || data.songs || [];
}

/**
 * 清空播放历史
 */
async function clearHistory() {
    try {
        const data = await request('/history', {
            method: 'DELETE'
        });
        return data;
    } catch (error) {
        console.error('Clear history error:', error);
        throw error;
    }
}

/**
 * 获取歌词
 */
async function getLyrics(lkid) {
    // 检查lkid是否有效（非0、非null、非undefined、非空字符串）
    if (!lkid || lkid === 0 || lkid === '0' || lkid === '') {
        console.log('[API] 无有效歌词ID，跳过歌词获取');
        return '';
    }
    
    console.log('[API] 请求歌词，lkid:', lkid);
    const data = await request(`/lrc/${lkid}`);
    console.log('[API] 歌词响应:', data);
    return data.lrc || data.lyrics || '';
}

/**
 * 获取推荐歌曲
 */
async function getRecommendations() {
    const data = await request('/recommendations');
    return data.recommendations || [];
}
