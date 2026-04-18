// 播放列表管理

/**
 * 初始化播放列表
 */
async function initPlaylist() {
    try {
        State.playlist = await getPlaylist();
    } catch (error) {
        console.error('Init playlist error:', error);
        State.playlist = [];  // 失败时使用空数组
    }
}

/**
 * 添加歌曲到播放列表（统一入口）
 */
async function handleAddToPlaylist(song) {
    try {
        // 检查是否已存在
        const exists = State.playlist.some(s => s.id === song.id);
        if (exists) {
            showToast('歌曲已在播放列表中');
            return;
        }

        await addToPlaylist(song);
        State.playlist.push(song);
        saveState();

        // 即时更新按钮状态（不刷新整个页面）
        if (typeof updateAddButtonState === 'function') {
            updateAddButtonState(song.id, true);
        }

        // 如果在播放列表页面，刷新显示
        if (State.currentPage === 'playlist') {
            renderApp();
        }
        
        showToast('已添加到播放列表');
    } catch (error) {
        console.error('Add to playlist error:', error);
        showToast('添加失败');
    }
}

/**
 * 从播放列表移除歌曲
 */
async function handleRemoveFromPlaylist(songId) {
    try {
        // 防止重复调用
        if (!State.playlist.some(s => s.id === songId)) {
            console.log('[播放列表] 歌曲已不存在，跳过删除');
            return;
        }
        
        const songName = State.playlist.find(s => s.id === songId)?.title || '未知歌曲';
        console.log('[播放列表] 删除歌曲:', songName, 'ID:', songId);
        
        State.playlist = State.playlist.filter(s => s.id !== songId);
        saveState();

        // 如果在播放列表页面，刷新显示
        if (State.currentPage === 'playlist') {
            renderApp();
        }

        // 如果移除的是当前播放的歌曲
        if (State.currentSong && State.currentSong.id === songId) {
            // 播放下一首或停止
            if (State.playlist.length > 0) {
                playNext();
            } else {
                stopPlayback();
            }
        }

        showToast(`已移除: ${songName}`);
    } catch (error) {
        console.error('Remove from playlist error:', error);
        showToast('移除失败');
    }
}

/**
 * 清空播放列表
 */
async function handleClearPlaylist() {
    if (!confirm('确定要清空播放列表吗？')) return;

    try {
        State.playlist = [];
        saveState();

        // 停止播放
        stopPlayback();

        // 刷新显示
        renderApp();

        showToast('播放列表已清空');
    } catch (error) {
        console.error('Clear playlist error:', error);
    }
}

/**
 * 播放指定索引的歌曲
 */
function playSongAtIndex(index) {
    if (!State.playlist || index < 0 || index >= State.playlist.length) {
        return;
    }
    
    playSong(State.playlist[index]);
}

/**
 * 获取播放列表长度
 */
function getPlaylistLength() {
    return State.playlist ? State.playlist.length : 0;
}

/**
 * 检查歌曲是否在播放列表中
 */
function isInPlaylist(songId) {
    return State.playlist.some(s => s.id === songId);
}
