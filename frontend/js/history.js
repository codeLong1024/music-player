// 播放历史

/**
 * 从后端同步历史数据（权威数据源）
 */
async function syncHistoryFromBackend() {
    try {
        console.log('[历史] 从后端同步数据...');
        const history = await getHistory();
        State.history = history;
        saveState();  // 同步到localStorage作为缓存
        console.log(`[历史] 同步完成，共 ${history.length} 条记录`);
    } catch (error) {
        console.error('[历史] 同步失败:', error);
        // 失败时尝试从localStorage加载
        const saved = localStorage.getItem('music_player_state');
        if (saved) {
            const data = JSON.parse(saved);
            State.history = data.history || [];
            console.log('[历史] 使用localStorage缓存数据');
        } else {
            State.history = [];
        }
    }
}

/**
 * 初始化历史记录（保留兼容，但不再使用）
 * @deprecated 使用 syncHistoryFromBackend 替代
 */
async function initHistory() {
    console.warn('initHistory 已废弃，请使用 syncHistoryFromBackend');
    await syncHistoryFromBackend();
}

/**
 * 获取历史数量
 */
function getHistoryCount() {
    return State.history ? State.history.length : 0;
}

/**
 * 导航到历史页面
 */
function navigateToHistory() {
    State.currentPage = 'history';
    renderApp();
}

/**
 * 清空历史（已在ui.js中实现handleClearHistory）
 * 此文件主要用于初始化和辅助功能
 */
