// 历史页面渲染器

/**
 * 渲染历史页
 */
function renderHistoryPage(container) {
    clearElement(container);
    container.className = 'playlist-page page-content';

    const songs = State.history || [];

    const tableWrapper = createElement('div', 'table-wrapper');

    if (songs.length === 0) {
        tableWrapper.innerHTML = EmptyStateTemplates.history;
    } else {
        tableWrapper.innerHTML = `
            <div style="padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; color: var(--text-tertiary);">${songs.length} 首歌曲</span>
                <button class="clear-btn" onclick="handleClearHistory()">清空历史</button>
            </div>
            ${renderSongTable(songs, { showActions: true, favoritable: true, hidePlayBtn: true })}
        `;
        
        // 使用事件委托绑定行点击
        bindTableEvents(tableWrapper, songs, 'history');
    }

    container.appendChild(tableWrapper);
}
