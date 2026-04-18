// 播放列表页面渲染器

/**
 * 渲染播放列表页
 */
function renderPlaylistPage(container) {
    clearElement(container);
    container.className = 'playlist-page page-content';

    const songs = State.playlist || [];

    const tableWrapper = createElement('div', 'table-wrapper');

    if (songs.length === 0) {
        tableWrapper.innerHTML = EmptyStateTemplates.playlist;
    } else {
        tableWrapper.innerHTML = `
            <div style="padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; color: var(--text-tertiary);">${songs.length} 首歌曲</span>
                <button class="clear-btn" onclick="handleClearPlaylist()">清空列表</button>
            </div>
            ${renderSongTable(songs, { showActions: true, removable: true, favoritable: true, hidePlayBtn: true })}
        `;

        // 使用事件委托绑定行点击和删除按钮
        bindTableEvents(tableWrapper, songs, 'playlist');
    }

    container.appendChild(tableWrapper);
}
