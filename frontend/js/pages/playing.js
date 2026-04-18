// 正在播放页面渲染器

/**
 * 渲染正在播放页（全新设计）
 */
function renderPlayingPage(container) {
    clearElement(container);
    container.className = 'playing-page page-content';

    if (!State.currentSong) {
        container.innerHTML = EmptyStateTemplates.playerReady;
        return;
    }

    const song = State.currentSong;
    const name = song.title || '未知歌曲';
    const artist = song.artist || '未知歌手';
    const cover = song.cover || '';
    const isFavorite = State.favorites && State.favorites.some(f => f.id === song.id);

    container.innerHTML = `
        <!-- 渐变背景 -->
        <div class="playing-background">
            ${cover ? `<img src="${cover}" alt="" class="bg-blur-image" onerror="this.style.display='none'">` : ''}
            <div class="bg-gradient-overlay"></div>
        </div>

        <!-- 主内容区 -->
        <div class="playing-content">
            <!-- 左侧：封面和操作 -->
            <div class="playing-left">
                <!-- 封面容器 -->
                <div class="cover-container ${State.isPlaying ? 'is-playing' : ''}">
                    <!-- 封面图片 -->
                    ${cover ? 
                        `<img src="${cover}" alt="封面" class="cover-image" onerror="this.style.display='none'">` : 
                        '<div class="cover-placeholder"><svg viewBox="0 0 24 24" width="60" height="60" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>'
                    }
                </div>

                <!-- 歌曲信息 -->
                <div class="song-info-card glass-card">
                    <h1 class="song-title">${escapeHtml(name)}</h1>
                    <p class="song-artist" onclick="searchByArtist('${escapeHtml(artist)}')">${escapeHtml(artist)}</p>
                    
                    <!-- 操作按钮组 -->
                    <div class="action-buttons">
                        <button class="action-button ${isFavorite ? 'active' : ''}" onclick="handleToggleFavorite(State.currentSong)" title="${isFavorite ? '取消收藏' : '收藏'}">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="${isFavorite ? '#c62f2f' : 'none'}" stroke="${isFavorite ? '#c62f2f' : 'currentColor'}" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            <span>${isFavorite ? '已收藏' : '收藏'}</span>
                        </button>
                        <!-- <button class="action-button" onclick="handleShare()" title="分享">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="18" cy="5" r="3"/>
                                <circle cx="6" cy="12" r="3"/>
                                <circle cx="18" cy="19" r="3"/>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                            </svg>
                            <span>分享</span>
                        </button> -->
                    </div>
                </div>
            </div>

            <!-- 右侧：歌词区域 -->
            <div class="playing-right">
                <div class="lyrics-wrapper glass-card">
                    <div class="lyrics-header">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 18V5l12-2v13"/>
                            <circle cx="6" cy="18" r="3"/>
                            <circle cx="18" cy="16" r="3"/>
                        </svg>
                        <span>歌词</span>
                    </div>
                    <div id="lyricsContainer" class="lyrics-scroll">
                        ${currentLyrics && currentLyrics.length > 0 ?
                            currentLyrics.map(line =>
                                `<div class="lyric-line" data-time="${line.time}">${line.text}</div>`
                            ).join('') :
                            EmptyStateTemplates.noLyrics
                        }
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 分享功能（待实现）
 */
function handleShare() {
    if (!State.currentSong) return;
    const name = State.currentSong.title || '未知歌曲';
    showToast(`分享功能开发中：${name}`);
}
