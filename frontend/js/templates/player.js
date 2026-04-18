// 播放器模板系统

/**
 * 播放器栏模板
 */
function playerBarTemplate(State) {
    const playIcon = State.isPlaying ?
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>' :
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

    if (!State.currentSong) {
        return `
            <div class="player-info">
                <span class="no-song">未选择歌曲</span>
            </div>
            <div class="player-controls">
                <div class="controls-buttons">
                    <button class="icon-btn" id="playModeBtn" title="${getPlayModeTitle()}">${getPlayModeIcon()}</button>
                    <button class="icon-btn" id="prevBtn" disabled title="上一首">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                    </button>
                    <button class="icon-btn" id="playPauseBtn" disabled title="播放">${playIcon}</button>
                    <button class="icon-btn" id="nextBtn" disabled title="下一首">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                    </button>
                </div>
                <div class="progress-container">
                    <span class="time-display" id="currentTime">00:00</span>
                    <div class="progress-bar-bg" id="progressBarBg">
                        <div id="progressBar"></div>
                    </div>
                    <span class="time-display" id="duration">00:00</span>
                </div>
            </div>
            <div class="player-volume">
                <button class="icon-btn" id="muteBtn" title="静音">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                </button>
                <input type="range" class="volume-slider" id="volumeSlider" min="0" max="100" value="${State.volume}">
            </div>
        `;
    }

    const name = truncateText(State.currentSong.title || '未知歌曲', 25);
    const artist = truncateText(State.currentSong.artist || '未知歌手', 20);
    const cover = State.currentSong.cover || '';

    return `
        <div class="player-info" onclick="navigateTo('playing');" title="点击进入正在播放">
            <div class="player-cover">
                ${cover ? `<img src="${cover}" alt="封面" onerror="this.parentElement.innerHTML='🎵'">` : '🎵'}
            </div>
            <div>
                <div class="player-song-name">${name}</div>
                <div class="player-artist">${artist}</div>
            </div>
        </div>
        <div class="player-controls">
            <div class="controls-buttons">
                <button class="icon-btn" id="playModeBtn" title="${getPlayModeTitle()}">${getPlayModeIcon()}</button>
                <button class="icon-btn" id="prevBtn" title="上一首">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                </button>
                <button class="icon-btn" id="playPauseBtn" title="${State.isPlaying ? '暂停' : '播放'}">${playIcon}</button>
                <button class="icon-btn" id="nextBtn" title="下一首">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                </button>
            </div>
            <div class="progress-container">
                <span class="time-display" id="currentTime">00:00</span>
                <div class="progress-bar-bg" id="progressBarBg">
                    <div id="progressBar"></div>
                </div>
                <span class="time-display" id="duration">00:00</span>
            </div>
        </div>
        <div class="player-volume">
            <button class="icon-btn" id="muteBtn" title="静音">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
            </button>
            <input type="range" class="volume-slider" id="volumeSlider" min="0" max="100" value="${State.volume}">
        </div>
    `;
}

/**
 * 获取播放模式图标
 */
function getPlayModeIcon() {
    if (State.playMode === 'single') {
        // 单曲循环：带数字1的循环图标
        return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/><text x="12" y="14" font-size="8" text-anchor="middle" fill="currentColor">1</text></svg>';
    } else if (State.playMode === 'random') {
        // 随机播放：交叉箭头
        return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>';
    } else {
        // 顺序播放：普通循环图标
        return '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>';
    }
}

/**
 * 获取播放模式标题
 */
function getPlayModeTitle() {
    if (State.playMode === 'single') return '单曲循环';
    if (State.playMode === 'random') return '随机播放';
    return '顺序播放';
}
