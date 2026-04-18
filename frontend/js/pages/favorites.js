// 收藏页面渲染器

/**
 * 渲染收藏页
 */
function renderFavoritesPage(container) {
    clearElement(container);
    container.className = 'playlist-page page-content';

    const songs = State.favorites || [];

    const tableWrapper = createElement('div', 'table-wrapper');

    if (songs.length === 0) {
        tableWrapper.innerHTML = EmptyStateTemplates.favorites;
    } else {
        tableWrapper.innerHTML = `
            <div style="padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; color: var(--text-tertiary);">${songs.length} 首歌曲</span>
            </div>
            ${renderSongTable(songs, { showActions: true, favoritable: true, hidePlayBtn: true })}
        `;
        
        // 使用事件委托绑定行点击和取消收藏按钮
        bindTableEvents(tableWrapper, songs, 'favorites');
    }

    container.appendChild(tableWrapper);
}
