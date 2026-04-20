// 音频播放器核心

let audio = null;
let currentLyrics = [];
let lyricsInterval = null;

/**
 * 初始化音频播放器
 */
function initAudio() {
    if (!audio) {
        audio = new Audio();
        audio.volume = State.volume / 100;
        
        // 绑定事件
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('ended', onSongEnded);
        audio.addEventListener('error', onAudioError);
        audio.addEventListener('loadedmetadata', onMetadataLoaded);
    }
}

/**
 * 播放歌曲
 */
async function playSong(song, autoPlay = true) {
    initAudio();

    // 验证歌曲ID
    if (!song || !song.id) {
        console.error('[播放] 歌曲信息无效:', song);
        showToast('歌曲信息无效');
        return;
    }

    try {
        State.currentSong = song;
        console.log('[播放] 歌曲ID:', song.id);

        // 始终通过 API 获取真实播放地址
        const playInfo = await getPlayInfo(song.id);
        if (playInfo && playInfo.url) {
            song.url = playInfo.url;  // 统一使用 url 字段
            song.cover = playInfo.pic || song.cover;  // PlayInfo 返回 pic，转换为 cover
            // 后端返回 lkid，前端统一为 lrc_id
            if (playInfo.lkid) {
                song.lrc_id = playInfo.lkid;
            }
        } else {
            showToast('无法获取播放地址');
            return;
        }

        // 检查是否在播放列表中，如果不在则添加
        const existsInPlaylist = State.playlist.some(s => s.id === song.id);
        if (!existsInPlaylist) {
            State.playlist.push(song);
            saveState();
            
            // 如果当前在搜索页，立即更新添加按钮状态
            if (State.currentPage === 'search' && typeof updateAddButtonState === 'function') {
                updateAddButtonState(song.id, true);
            }
        }

        // 设置音频源
        audio.src = song.url;

        if (autoPlay) {
            await audio.play();
            State.isPlaying = true;
            
            // 播放成功后添加到历史记录（异步，不阻断播放）
            addHistory(song).then(() => {
                // 成功后，立即更新前端State
                const historyEntry = {
                    id: song.id,
                    title: song.title || '未知歌曲',
                    artist: song.artist || '未知歌手',
                    cover: song.cover || '',
                    played_at: new Date().toISOString()
                };
                
                // 检查是否已存在，如果存在则移除旧记录
                const existingIndex = State.history.findIndex(h => h.id === song.id);
                if (existingIndex !== -1) {
                    State.history.splice(existingIndex, 1);
                }
                
                // 添加到最前面
                State.history.unshift(historyEntry);
                
                // 限制历史记录数量（保留最近100条）
                if (State.history.length > 100) {
                    State.history = State.history.slice(0, 100);
                }
                
                saveState();
                
                // 如果在历史页面，刷新显示
                if (State.currentPage === 'history') {
                    renderApp();
                }
            }).catch(err => {
                console.error('[播放历史] 记录失败:', err);
                // 不阻断播放，只记录错误到控制台
            });
        }

        // 加载歌词（仅当lrc_id有效时）
        if (song.lrc_id && song.lrc_id > 0) {
            await loadLyrics(song.lrc_id);
        } else {
            currentLyrics = [];
            console.log('[播放] 无有效歌词ID，跳过歌词加载');
        }

        // 更新UI（优化：只在必要时完整重渲染）
        updatePlayerBar();
        
        // 立即更新表格行高亮，提供即时反馈
        updateTableHighlight();
        
        // 如果当前在正在播放页面，才重新渲染以显示歌词和封面
        console.log('[播放] 当前页面:', State.currentPage, '歌词行数:', currentLyrics.length);
        if (State.currentPage === 'playing') {
            console.log('[播放] 重新渲染播放页面以显示歌词');
            renderApp();
        }
        
        saveState();

        console.log('Playing:', song.title);
    } catch (error) {
        console.error('Play error:', error);
        showToast('播放失败');
    }
}

/**
 * 暂停/播放切换
 */
function togglePlay() {
    if (!audio || !State.currentSong) {
        return;
    }
    
    if (State.isPlaying) {
        audio.pause();
        State.isPlaying = false;
    } else {
        audio.play();
        State.isPlaying = true;
    }
    
    updatePlayerBar();
    
    // 如果在正在播放页面，重新渲染以更新封面旋转动画
    if (State.currentPage === 'playing') {
        renderApp();
    }
}

/**
 * 播放下一首
 */
function playNext() {
    if (!State.playlist || State.playlist.length === 0) {
        return;
    }
    
    let nextIndex;
    
    if (State.playMode === 'random') {
        // 随机播放：从列表中随机选择一首（避免连续重复）
        if (State.playlist.length === 1) {
            nextIndex = 0;
        } else {
            const currentIndex = State.playlist.findIndex(s => s.id === State.currentSong?.id);
            do {
                nextIndex = Math.floor(Math.random() * State.playlist.length);
            } while (nextIndex === currentIndex);
        }
    } else {
        // 顺序播放
        const currentIndex = State.playlist.findIndex(s => s.id === State.currentSong?.id);
        if (currentIndex === -1 || currentIndex === State.playlist.length - 1) {
            nextIndex = 0;
        } else {
            nextIndex = currentIndex + 1;
        }
    }
    
    playSong(State.playlist[nextIndex]);
}

/**
 * 播放上一首
 */
function playPrev() {
    if (!State.playlist || State.playlist.length === 0) {
        return;
    }
    
    const currentIndex = State.playlist.findIndex(s => s.id === State.currentSong?.id);
    let prevIndex;
    
    if (currentIndex === -1 || currentIndex === 0) {
        prevIndex = State.playlist.length - 1;
    } else {
        prevIndex = currentIndex - 1;
    }
    
    playSong(State.playlist[prevIndex]);
}

/**
 * 设置音量
 */
function setVolume(volume) {
    State.volume = volume;
    
    if (audio) {
        audio.volume = volume / 100;
    }
    
    updateVolumeControl();
    saveState();
}

/**
 * 切换静音
 */
function toggleMute() {
    if (!audio) return;
    
    if (audio.volume > 0) {
        audio.dataset.prevVolume = audio.volume;
        audio.volume = 0;
        State.volume = 0;
    } else {
        const prevVolume = audio.dataset.prevVolume || 0.8;
        audio.volume = prevVolume;
        State.volume = Math.round(prevVolume * 100);
    }
    
    updateVolumeControl();
}

/**
 * 设置播放进度
 */
function seekTo(time) {
    if (!audio || !audio.duration) return;
    
    audio.currentTime = time;
}

/**
 * 时间更新事件
 */
function onTimeUpdate() {
    if (!audio) return;
    
    const currentTime = audio.currentTime;
    const duration = audio.duration;
    
    // 更新进度条
    updateProgressBar(currentTime, duration);
    
    // 更新歌词
    updateLyrics(currentTime);
}

/**
 * 歌曲结束事件
 */
function onSongEnded() {
    console.log('Song ended, play mode:', State.playMode);
    
    if (State.playMode === 'single') {
        // 单曲循环：重新播放当前歌曲
        if (audio && State.currentSong) {
            audio.currentTime = 0;
            audio.play();
            State.isPlaying = true;
            updatePlayerBar();
        }
    } else {
        // 顺序或随机：播放下一首
        playNext();
    }
}

/**
 * 切换播放模式
 */
function togglePlayMode() {
    // 循环切换: sequence -> random -> single -> sequence
    if (State.playMode === 'sequence') {
        State.playMode = 'random';
        showToast('随机播放');
    } else if (State.playMode === 'random') {
        State.playMode = 'single';
        showToast('单曲循环');
    } else {
        State.playMode = 'sequence';
        showToast('顺序播放');
    }
    saveState();
    updatePlayerBar();
}

/**
 * 音频错误事件
 */
function onAudioError(error) {
    console.error('Audio error:', error);
    showToast('音频播放出错');
    State.isPlaying = false;
    updatePlayerBar();
}

/**
 * 元数据加载完成
 */
function onMetadataLoaded() {
    console.log('Metadata loaded');
}

/**
 * 加载歌词
 */
async function loadLyrics(lrcId) {
    try {
        console.log('[歌词] 开始加载，lrc_id:', lrcId);
        const lyricsText = await getLyrics(lrcId);
        console.log('[歌词] 获取到歌词文本长度:', lyricsText ? lyricsText.length : 0);
        currentLyrics = parseLyrics(lyricsText);
        console.log('[歌词] 解析后歌词行数:', currentLyrics.length);
    } catch (error) {
        console.error('[歌词] 加载失败:', error);
        currentLyrics = [];
    }
}

/**
 * 解析歌词
 */
function parseLyrics(lyricsText) {
    if (!lyricsText) return [];
    
    const lines = lyricsText.split('\n');
    const lyrics = [];
    
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
    
    lines.forEach(line => {
        const match = line.match(timeRegex);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = parseInt(match[3]);
            const text = match[4].trim();
            
            if (text) {
                const time = minutes * 60 + seconds + milliseconds / 1000;
                lyrics.push({ time, text });
            }
        }
    });
    
    return lyrics;
}

/**
 * 使用二分查找找到当前应该显示的歌词行索引
 * @param {Array} lyrics - 歌词数组
 * @param {number} currentTime - 当前播放时间
 * @returns {number} 歌词索引，-1表示未找到
 */
function findCurrentLyricIndex(lyrics, currentTime) {
    if (!lyrics || lyrics.length === 0) return -1;
    
    let left = 0;
    let right = lyrics.length - 1;
    let result = -1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (lyrics[mid].time <= currentTime) {
            result = mid;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return result;
}

/**
 * 更新歌词显示（优化版：使用二分查找）
 */
function updateLyrics(currentTime) {
    if (!currentLyrics || currentLyrics.length === 0) return;
    
    // 使用二分查找找到当前应该显示的歌词行
    const currentIndex = findCurrentLyricIndex(currentLyrics, currentTime);
    
    // 更新歌词UI（如果存在）
    const lyricsContainer = document.getElementById('lyricsContainer');
    if (lyricsContainer && currentIndex >= 0) {
        const activeLine = lyricsContainer.querySelector('.lyric-line.active');
        if (activeLine) {
            activeLine.classList.remove('active');
        }
        
        const lines = lyricsContainer.querySelectorAll('.lyric-line');
        if (lines[currentIndex]) {
            lines[currentIndex].classList.add('active');
            
            // 计算滚动位置，使当前歌词居中（使用立即滚动，避免延迟）
            const containerHeight = lyricsContainer.clientHeight;
            const lineTop = lines[currentIndex].offsetTop;
            const lineHeight = lines[currentIndex].clientHeight;
            const scrollTop = lineTop - containerHeight / 2 + lineHeight / 2;
            
            // 使用立即滚动，避免 smooth 带来的延迟感
            lyricsContainer.scrollTop = scrollTop;
        }
    }
}

/**
 * 停止播放
 */
function stopPlayback() {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
    
    State.isPlaying = false;
    State.currentSong = null;
    currentLyrics = [];
    
    updatePlayerBar();
}
