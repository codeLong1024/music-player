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
        // 失败时尝试从 localStorage 加载
        const saved = localStorage.getItem('music_player_state');
        if (saved) {
            const data = JSON.parse(saved);
            State.history = data.history || [];
            console.log('[历史] 使用 localStorage 缓存数据');
        } else {
            State.history = [];
        }
    }
}
