// 收藏功能

/**
 * 从后端同步收藏数据（权威数据源）
 */
async function syncFavoritesFromBackend() {
    try {
        console.log('[收藏] 从后端同步数据...');
        const favorites = await getFavorites();
        State.favorites = favorites;
        saveState();  // 同步到 localStorage 作为缓存
        console.log(`[收藏] 同步完成，共 ${favorites.length} 首歌曲`);
    } catch (error) {
        console.error('[收藏] 同步失败:', error);
        // 失败时尝试从 localStorage 加载
        const saved = localStorage.getItem('music_player_state');
        if (saved) {
            const data = JSON.parse(saved);
            State.favorites = data.favorites || [];
            console.log('[收藏] 使用 localStorage 缓存数据');
        } else {
            State.favorites = [];
        }
    }
}
