// 应用入口和初始化

/**
 * 应用初始化
 */
async function initApp() {
    console.log('25音乐 - 初始化...');

    // 1. 加载UI状态（从localStorage）
    loadState();
    
    // 2. 初始化音频和搜索
    initAudio();
    initSearch();

    // 3. 从后端加载权威数据（收藏和历史）
    await Promise.all([
        initPlaylist(),
        syncFavoritesFromBackend(),  // 从后端同步收藏
        syncHistoryFromBackend()     // 从后端同步历史
    ]);

    // 4. 如果有当前歌曲，加载歌词
    if (State.currentSong && State.currentSong.lkid) {
        console.log('加载当前歌曲歌词:', State.currentSong.lkid);
        await loadLyrics(State.currentSong.lkid);
    }

    // 5. 绑定快捷键
    bindKeyboardShortcuts();

    // 6. 渲染界面
    renderApp();
    updatePlayerBar();
    
    // 7. 同步导航栏高亮状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === State.currentPage);
    });
    
    // 8. 如果默认页面是搜索，隐藏播放器
    if (State.currentPage === 'search') {
        document.body.classList.add('hide-player');
    }

    console.log('25音乐 - 初始化完成');
}

/**
 * 绑定键盘快捷键
 */
function bindKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'Escape':
                e.preventDefault();
                exitImmersiveMode();
                break;
            case 'ArrowLeft':
                if (e.ctrlKey) { 
                    e.preventDefault(); 
                    playPrev(); 
                } else if (State.currentPage === 'search') {
                    // 搜索页面：左箭头上一页
                    e.preventDefault();
                    if (typeof prevSearchPage === 'function') {
                        prevSearchPage();
                    }
                }
                break;
            case 'ArrowRight':
                if (e.ctrlKey) { 
                    e.preventDefault(); 
                    playNext(); 
                } else if (State.currentPage === 'search') {
                    // 搜索页面：右箭头下一页
                    e.preventDefault();
                    if (typeof nextSearchPage === 'function') {
                        nextSearchPage();
                    }
                }
                break;
            case 'ArrowUp':
                if (e.ctrlKey) { e.preventDefault(); setVolume(Math.min(100, State.volume + 5)); }
                break;
            case 'ArrowDown':
                if (e.ctrlKey) { e.preventDefault(); setVolume(Math.max(0, State.volume - 5)); }
                break;
        }
    });

    // 鼠标移到底部显示播放器（沉浸模式）
    let playerHideTimeout;
    document.addEventListener('mousemove', (e) => {
        if (document.body.classList.contains('immersive-mode')) {
            const playerBar = document.querySelector('.player-bar');
            const windowHeight = window.innerHeight;
            const mouseY = e.clientY;
            
            // 鼠标在底部80px范围内显示播放器
            if (mouseY > windowHeight - 80) {
                clearTimeout(playerHideTimeout);
                playerBar.classList.add('show');
            } else {
                // 离开底部区域后延迟隐藏
                clearTimeout(playerHideTimeout);
                playerHideTimeout = setTimeout(() => {
                    playerBar.classList.remove('show');
                }, 500);
            }
        }
    });
}

/**
 * 退出沉浸模式
 */
function exitImmersiveMode() {
    if (document.body.classList.contains('immersive-mode')) {
        document.body.classList.remove('immersive-mode');
        showToast('已退出沉浸模式');
        
        // 如果当前在正在播放页面，切换到播放列表页面
        if (State.currentPage === 'playing') {
            navigateTo('playlist');
        }
    }
}

function showNotification(message, duration = 2000) {
    showToast(message, duration);
}

document.addEventListener('DOMContentLoaded', initApp);

window.navigateTo = navigateTo;
window.showNotification = showNotification;
window.handleClearHistory = handleClearHistory;
window.handleClearPlaylist = handleClearPlaylist;
window.handleRemoveFromPlaylist = handleRemoveFromPlaylist;
window.handleToggleFavorite = handleToggleFavorite;
window.updateTableHighlight = updateTableHighlight;
window.searchByArtist = searchByArtist;
window.handleAddAllToPlaylist = handleAddAllToPlaylist;
window.goToSearchPage = goToSearchPage;
window.prevSearchPage = prevSearchPage;
window.nextSearchPage = nextSearchPage;
// 数据同步函数
window.syncFavoritesFromBackend = syncFavoritesFromBackend;
window.syncHistoryFromBackend = syncHistoryFromBackend;
