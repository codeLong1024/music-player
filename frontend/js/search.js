// 搜索功能

// 用于跟踪当前的搜索请求，防止竞态条件
let currentSearchAbortController = null;
// 防抖定时器
let searchDebounceTimer = null;

/**
 * 初始化搜索功能
 */
function initSearch() {
    // 搜索页面初始化逻辑
}

/**
 * 处理搜索（带防抖和请求取消）
 */
async function handleSearch(keyword, immediate = false) {
    keyword = keyword.trim();

    if (!keyword) {
        State.searchResults = [];
        if (State.currentPage === 'search') {
            renderApp();
        }
        return;
    }

    // 清除之前的防抖定时器
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }

    // 如果不是立即执行，则防抖延迟
    if (!immediate) {
        searchDebounceTimer = setTimeout(() => handleSearch(keyword, true), 500);
        return;
    }

    // 取消之前的搜索请求
    if (currentSearchAbortController) {
        currentSearchAbortController.abort();
    }

    const tableWrapper = document.querySelector('.search-page .table-wrapper');
    if (tableWrapper) {
        tableWrapper.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <span>搜索中...</span>
            </div>
        `;
    }

    // 创建新的 AbortController
    currentSearchAbortController = new AbortController();
    const signal = currentSearchAbortController.signal;

    try {
        const data = await searchSongs(keyword);
        
        // 检查请求是否被取消
        if (signal.aborted) return;
        
        State.searchResults = data.songs || [];
        State.searchCurrentPage = 1; // 重置到第一页

        // 更新搜索框的值
        const pageSearchInput = document.getElementById('pageSearchInput');
        if (pageSearchInput) {
            pageSearchInput.value = keyword;
        }

        renderApp();
    } catch (error) {
        // 忽略取消的请求
        if (error.name === 'AbortError') return;
        
        console.error('Search error:', error);
        showToast('搜索失败');
    }
}

/**
 * 按歌手搜索
 */
function searchByArtist(artist) {
    // 跳转到搜索页面
    State.currentPage = 'search';

    // 更新导航高亮
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === 'search');
    });

    // 执行搜索
    handleSearch(artist, true);
}

/**
 * 从搜索结果添加歌曲到播放列表（使用统一入口）
 */
async function addSongToPlaylistFromSearch(song) {
    // 直接调用统一的添加函数
    await handleAddToPlaylist(song);
}

/**
 * 全部添加到播放列表（改为：添加当前页到播放列表）
 */
async function handleAddAllToPlaylist() {
    // 获取当前页结果，而不是所有结果
    const currentPageResults = getCurrentPageResults();
    if (currentPageResults.length === 0) {
        showToast('当前页没有可添加的歌曲');
        return;
    }
    
    // 过滤出未添加的歌曲
    const toAdd = currentPageResults.filter(song => !State.playlist.some(s => s.id === song.id));
    
    if (toAdd.length === 0) {
        showToast('当前页歌曲已在播放列表中');
        return;
    }
    
    // 使用自定义确认弹窗替代原生 confirm
    const confirmed = await showConfirm(`确定要添加当前页 ${toAdd.length} 首歌曲到播放列表吗？`);
    if (!confirmed) {
        return;
    }
    
    try {
        let successCount = 0;
        for (const song of toAdd) {
            await addToPlaylist(song);
            State.playlist.push(song);
            successCount++;
        }
        
        saveState();
        renderApp();
        
        showToast(`成功添加 ${successCount} 首歌曲`);
    } catch (error) {
        console.error('Add all error:', error);
        showToast('部分添加失败');
    }
}

/**
 * 即时更新添加按钮状态
 */
function updateAddButtonState(songId, isAdded) {
    const addBtns = document.querySelectorAll('.index-add-btn');
    
    addBtns.forEach(btn => {
        const row = btn.closest('tr');
        if (!row) return;
        
        const songIdAttr = row.getAttribute('data-song-id');
        if (songIdAttr && songIdAttr === String(songId)) {
            if (isAdded) {
                btn.classList.add('added');
                btn.textContent = '+';  // 保持 + 号，不改为 ✓
                btn.disabled = true;
                btn.setAttribute('title', '已添加');
            } else {
                btn.classList.remove('added');
                btn.textContent = '+';
                btn.disabled = false;
                btn.setAttribute('title', '添加到列表');
            }
        }
    });
}

/**
 * 获取当前页的搜索结果
 */
function getCurrentPageResults() {
    const results = State.searchResults || [];
    const page = State.searchCurrentPage || 1;
    const pageSize = State.searchPageSize || 20;
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return results.slice(startIndex, endIndex);
}

/**
 * 获取总页数
 */
function getTotalPages() {
    const results = State.searchResults || [];
    const pageSize = State.searchPageSize || 20;
    return Math.ceil(results.length / pageSize);
}

/**
 * 跳转到指定页
 */
function goToSearchPage(page) {
    const totalPages = getTotalPages();
    if (page < 1 || page > totalPages) return;
    
    State.searchCurrentPage = page;
    renderApp();
}

/**
 * 上一页
 */
function prevSearchPage() {
    goToSearchPage(State.searchCurrentPage - 1);
}

/**
 * 下一页
 */
function nextSearchPage() {
    goToSearchPage(State.searchCurrentPage + 1);
}
