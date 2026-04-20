// 歌曲表格模板系统

/**
 * 歌曲行模板
 */
function songRowTemplate(song, index, options = {}) {
    const { showActions = false, removable = false, searchable = false, favoritable = false, hidePlayBtn = false } = options;
    
    const songId = song.id;
    const name = song.title || '未知歌曲';
    const artist = song.artist || '未知歌手';
    
    const isActive = State.currentSong && State.currentSong.id === songId;
    const isFavorite = State.favorites && State.favorites.some(f => f.id === songId);
    
    // 序号列内容
    let indexContent;
    if (searchable && hidePlayBtn) {
        // 搜索页面：序号列显示添加按钮
        const isInPlaylist = State.playlist.some(s => s.id === songId);
        const addBtnClass = isInPlaylist ? 'index-add-btn added' : 'index-add-btn';
        const addBtnTitle = isInPlaylist ? '已添加' : '添加到列表';
        const addBtnText = '+';  // 始终显示 + 号
        indexContent = `
            <div class="index-btn-group">
                <button class="${addBtnClass}" title="${addBtnTitle}" ${isInPlaylist ? 'disabled' : ''}>${addBtnText}</button>
            </div>
        `;
    } else if (removable && favoritable && hidePlayBtn) {
        // 播放列表页：移除按钮 + 心心
        const favBtnClass = isFavorite ? 'index-favorite-btn favorited' : 'index-favorite-btn';
        const favBtnTitle = isFavorite ? '取消收藏' : '收藏';
        indexContent = `
            <div class="index-btn-group">
                <button class="index-remove-btn" title="从列表移除">×</button>
                <button class="${favBtnClass}" title="${favBtnTitle}">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="${isFavorite ? '#c62f2f' : 'none'}" stroke="${isFavorite ? '#c62f2f' : 'currentColor'}" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
            </div>
        `;
    } else if (favoritable && hidePlayBtn) {
        // 历史/收藏页面：序号列显示心心（播放状态通过行背景体现）
        const favBtnClass = isFavorite ? 'index-favorite-btn favorited' : 'index-favorite-btn';
        const favBtnTitle = isFavorite ? '取消收藏' : '收藏';
        indexContent = `
            <div class="index-btn-group">
                <button class="${favBtnClass}" title="${favBtnTitle}">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="${isFavorite ? '#c62f2f' : 'none'}" stroke="${isFavorite ? '#c62f2f' : 'currentColor'}" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
            </div>
        `;
    } else if (isActive) {
        // 其他页面：播放时显示序号（不再使用音波动画）
        indexContent = index + 1;
    } else {
        // 其他页面：未播放时显示序号
        indexContent = index + 1;
    }
    
    return `
        <tr data-index="${index}" data-song-id="${songId}" class="${isActive ? 'active' : ''} ${isFavorite && favoritable && hidePlayBtn ? 'is-favorite' : ''}">
            <td class="col-index">${indexContent}</td>
            <td class="col-artist" title="${escapeHtml(artist)}"><span class="artist-link" onclick="event.stopPropagation(); searchByArtist('${escapeHtml(artist)}')">${escapeHtml(artist)}</span></td>
            <td class="col-song" title="${escapeHtml(name)}">${escapeHtml(name)}</td>
        </tr>
    `;
}

/**
 * 歌曲表格模板
 */
function songTableTemplate(songs, options = {}) {
    const { showActions = false, removable = false, searchable = false, favoritable = false, hidePlayBtn = false } = options;
    
    if (!songs || songs.length === 0) {
        return '<div class="empty-state"><div class="empty-state-icon">♫</div><span>暂无歌曲</span></div>';
    }
    
    // 搜索页面：在表头序号列位置显示"当前页全部添加"按钮
    let indexHeader = '';
    if (searchable && hidePlayBtn) {
        indexHeader = '<button class="add-all-header-btn" onclick="handleAddAllToPlaylist()" title="添加当前页所有歌曲到列表">页+</button>';
    }
    
    const rows = songs.map((song, i) => songRowTemplate(song, i, { showActions, removable, searchable, favoritable, hidePlayBtn })).join('');
    
    return `
        <table class="song-table">
            <thead>
                <tr>
                    <th class="col-index">${indexHeader}</th>
                    <th class="col-artist">歌手</th>
                    <th class="col-song">歌曲</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

/**
 * 渲染通用歌曲表格（委托给模板）
 */
function renderSongTable(songs, options = {}) {
    return songTableTemplate(songs, options);
}

/**
 * 创建表格行 HTML（保留用于兼容）
 */
function createSongTableRow(song, index) {
    const isActive = State.currentSong && State.currentSong.id === song.id;
    const name = song.title || '未知歌曲';
    const artist = song.artist || '未知歌手';
    const album = song.album || name;

    return `
        <tr class="${isActive ? 'active' : ''}">
            <td class="col-index">${index + 1}</td>
            <td class="col-album" title="${album}">${album}</td>
            <td class="col-artist artist-link" title="${escapeHtml(artist)}" onclick="searchByArtist('${escapeHtml(artist)}')">${escapeHtml(artist)}</td>
            <td class="col-song" title="${name}">${name}</td>
        </tr>
    `;
}
