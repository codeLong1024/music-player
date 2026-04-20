// UI核心管理器 - 页面路由与通用更新

// ==================== 页面路由逻辑 ====================

/**
 * 渲染主应用容器
 */
function renderApp() {
    const app = document.getElementById('app');

    // 根据 currentPage 渲染页面
    switch (State.currentPage) {
        case 'search':
            renderSearchPage(app);
            break;
        case 'playlist':
            renderPlaylistPage(app);
            break;
        case 'favorites':
            renderFavoritesPage(app);
            break;
        case 'history':
            renderHistoryPage(app);
            break;
        default:
            renderPlayingPage(app);
    }
}

/**
 * 导航到指定页面
 */
function navigateTo(page) {
    State.currentPage = page;

    // 更新侧边栏导航高亮
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // 进入正在播放页面时自动开启沉浸式模式
    if (page === 'playing') {
        document.body.classList.add('immersive-mode');
        document.body.classList.remove('hide-player');
    } else if (page === 'search') {
        // 搜索页面隐藏播放器，展示更多内容
        document.body.classList.remove('immersive-mode');
        document.body.classList.add('hide-player');
    } else {
        document.body.classList.remove('immersive-mode');
        document.body.classList.remove('hide-player');
    }

    // 快速渲染页面，禁用过渡动画
    const playingPage = document.querySelector('.playing-page');
    if (playingPage) {
        playingPage.classList.add('fast-transition');
    }
    
    renderApp();
    
    // 渲染完成后恢复过渡
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (playingPage) {
                playingPage.classList.remove('fast-transition');
            }
        });
    });
}

// ==================== UI更新逻辑 ====================

/**
 * 更新播放器栏（使用模板）
 */
function updatePlayerBar() {
    const playerBar = document.querySelector('.player-bar');
    if (!playerBar) return;

    playerBar.innerHTML = playerBarTemplate(State);
    
    bindPlayerEvents();
    updateVolumeControl();
}

// ==================== 业务逻辑处理 ====================

/**
 * 处理收藏切换
 */
async function handleToggleFavorite(song) {
    try {
        const result = await toggleFavorite(song);
        
        if (result.favorited === true) {
            // 添加到收藏列表
            if (!State.favorites.some(f => f.id === song.id)) {
                State.favorites.push({
                    id: song.id,
                    title: song.title || '未知歌曲',
                    artist: song.artist || '未知歌手',
                    cover: song.cover || '',
                    added_at: new Date().toISOString()
                });
            }
        } else if (result.favorited === false) {
            // 从收藏列表移除
            State.favorites = State.favorites.filter(f => f.id !== song.id);
        }
        
        saveState();
        
        // 如果在收藏页面、历史页面、播放列表页面或正在播放页面，刷新显示
        if (State.currentPage === 'favorites' || State.currentPage === 'history' || State.currentPage === 'playlist' || State.currentPage === 'playing') {
            renderApp();
        } else {
            // 其他页面只更新按钮状态
            updateFavoriteButtonState(song.id, result.favorited);
        }
        
        // 立即更新高亮（针对当前页面）
        updateTableHighlight();
        
        // 显示提示
        if (result.favorited) {
            showToast('已添加到收藏');
        } else {
            showToast('已取消收藏');
        }
    } catch (error) {
        console.error('Toggle favorite error:', error);
        showToast('操作失败');
    }
}

/**
 * 立即更新指定歌曲的收藏按钮状态
 */
function updateFavoriteButtonState(songId, isFavorited) {
    // 查找所有收藏按钮（包括操作列和序号列）
    const favoriteBtns = document.querySelectorAll('.favorite-btn, .index-favorite-btn');
    
    favoriteBtns.forEach(btn => {
        // 获取按钮所在的行
        const row = btn.closest('tr');
        if (!row) return;
        
        // 获取歌曲 ID（从数据属性或其他地方）
        const songIdAttr = row.getAttribute('data-song-id');
        if (songIdAttr && songIdAttr === String(songId)) {
            // 判断按钮类型，决定 SVG 尺寸
            const isIndexBtn = btn.classList.contains('index-favorite-btn');
            const svgSize = isIndexBtn ? 14 : 18;
            
            // 更新按钮状态
            if (isFavorited) {
                btn.classList.add('favorited');
                btn.setAttribute('title', '取消收藏');
                // 更新 SVG 图标
                btn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="${svgSize}" height="${svgSize}" fill="currentColor" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                `;
            } else {
                btn.classList.remove('favorited');
                btn.setAttribute('title', '收藏');
                // 更新 SVG 图标
                btn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="${svgSize}" height="${svgSize}" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                `;
            }
        }
    });
}

/**
 * 轻量更新表格行高亮（避免全量 renderApp）
 */
function updateTableHighlight() {
    // 移除旧高亮
    document.querySelectorAll('tr.active').forEach(row => row.classList.remove('active'));
    
    // 添加新高亮
    if (State.currentSong) {
        const activeRow = document.querySelector(`tr[data-song-id="${State.currentSong.id}"]`);
        if (activeRow) {
            activeRow.classList.add('active');
            // 不再替换为音波动画，仅通过CSS高亮显示
        }
    }
}

/**
 * 处理清空历史
 */
async function handleClearHistory() {
    const confirmed = await showConfirm('确定要清空播放历史吗？');
    if (!confirmed) return;
    
    try {
        await clearHistory();
        State.history = [];
        saveState();
        renderApp();
        showToast('历史记录已清空');
    } catch (error) {
        console.error('Clear history error:', error);
        showToast('清空失败');
    }
}
