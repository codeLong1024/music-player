// 表格事件委托管理

/**
 * 使用事件委托绑定表格事件
 * @param {HTMLElement} tableWrapper - 表格容器
 * @param {Array} songs - 歌曲列表
 * @param {string} context - 上下文（playlist/search/favorites/history）
 */
function bindTableEvents(tableWrapper, songs, context) {
    if (!tableWrapper || !songs || songs.length === 0) return;
    
    // 单击事件
    tableWrapper.addEventListener('click', (e) => {
        // 优先检查是否点击了操作按钮
        const removeBtn = e.target.closest('.remove-btn') || e.target.closest('.index-remove-btn');
        const playBtn = e.target.closest('.play-btn');
        const addBtn = e.target.closest('.add-btn') || e.target.closest('.index-add-btn');
        const favoriteBtn = e.target.closest('.favorite-btn') || e.target.closest('.index-favorite-btn');
        
        // 如果点击了操作按钮，阻止事件冒泡并处理
        if (removeBtn || playBtn || addBtn || favoriteBtn) {
            e.stopPropagation();
            e.preventDefault();
            
            const row = e.target.closest('tr[data-index]');
            if (!row) return;
            
            const index = parseInt(row.dataset.index);
            const song = songs[index];
            if (!song) return;
            
            // 兼容不同的数据结构
            const songId = song.id;
            
            if (removeBtn) {
                // 播放列表或收藏列表的移除
                if (context === 'playlist') {
                    handleRemoveFromPlaylist(songId);
                } else if (context === 'favorites') {
                    handleToggleFavorite(song);
                }
            } else if (playBtn) {
                playSong(song);
            } else if (addBtn) {
                // 检查按钮是否被禁用
                if (addBtn.disabled || addBtn.classList.contains('added')) {
                    showToast('歌曲已在播放列表中');
                    return;
                }
                addSongToPlaylistFromSearch(song);
            } else if (favoriteBtn) {
                // 收藏/取消收藏
                handleToggleFavorite(song);
            }
            return;
        }
        
        // 点击行其他区域的处理
        const row = e.target.closest('tr[data-index]');
        if (!row) return;
        
        const index = parseInt(row.dataset.index);
        const song = songs[index];
        if (!song) return;
        
        // 搜索结果页面：单击直接播放
        if (context === 'search') {
            playSong(song);
        } else if (context === 'favorites') {
            // 收藏页面单击直接播放
            playSong(song);
        } else {
            // 其他页面单击直接播放（后端已统一返回标准 Song 对象）
            playSong(song);
        }
    });
}
