// 25音乐 - 全局状态管理
const State = {
    currentSong: null,
    playlist: [],
    favorites: [],
    history: [],
    isPlaying: false,
    volume: 80,
    searchResults: [],
    searchCurrentPage: 1, // 搜索当前页
    searchPageSize: 15,   // 每页显示数量（优化为15条，避免滚动）
    playMode: 'sequence', // 'sequence' 顺序播放, 'random' 随机播放, 'single' 单曲循环
    currentPage: 'playlist' // 当前页面
};

// 持久化到localStorage
function saveState() {
    localStorage.setItem('music_player_state', JSON.stringify({
        // 不保存currentSong到localStorage，重启后清理
        // currentSong: State.currentSong,
        playlist: State.playlist,
        favorites: State.favorites,
        history: State.history,
        volume: State.volume,
        playMode: State.playMode
    }));
}

// 从localStorage加载
function loadState() {
    const saved = localStorage.getItem('music_player_state');
    if (saved) {
        const data = JSON.parse(saved);
        // 注意：重启后不恢复currentSong，因为音频URL可能已失效
        // State.currentSong = data.currentSong || null;
        State.currentSong = null; // 重启后清理正在播放的歌曲
        State.playlist = data.playlist || [];
        State.favorites = data.favorites || [];
        State.history = data.history || [];
        State.volume = data.volume || 80;
        State.playMode = data.playMode || 'sequence';
        State.isPlaying = false; // 重启后重置播放状态
    }
}
