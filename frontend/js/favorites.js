// 收藏功能

/**
 * 从后端同步收藏数据（权威数据源）
 */
async function syncFavoritesFromBackend() {
    try {
        console.log('[收藏] 从后端同步数据...');
        const favorites = await getFavorites();
        State.favorites = favorites;
        saveState();  // 同步到localStorage作为缓存
        console.log(`[收藏] 同步完成，共 ${favorites.length} 首歌曲`);
    } catch (error) {
        console.error('[收藏] 同步失败:', error);
        // 失败时尝试从localStorage加载
        const saved = localStorage.getItem('music_player_state');
        if (saved) {
            const data = JSON.parse(saved);
            State.favorites = data.favorites || [];
            console.log('[收藏] 使用localStorage缓存数据');
        } else {
            State.favorites = [];
        }
    }
}

/**
 * 初始化收藏功能（保留兼容，但不再使用）
 * @deprecated 使用 syncFavoritesFromBackend 替代
 */
async function initFavorites() {
    console.warn('initFavorites 已废弃，请使用 syncFavoritesFromBackend');
    await syncFavoritesFromBackend();
}

/**
 * 切换收藏状态（已在ui.js中实现handleToggleFavorite）
 * 此文件主要用于初始化和辅助功能
 */

/**
 * 检查歌曲是否已收藏
 */
function isSongFavorited(songId) {
    return State.favorites.some(f => f.id === songId);
}

/**
 * 获取收藏数量
 */
function getFavoritesCount() {
    return State.favorites ? State.favorites.length : 0;
}

/**
 * 导航到收藏页面
 */
function navigateToFavorites() {
    State.currentPage = 'favorites';
    renderApp();
}
