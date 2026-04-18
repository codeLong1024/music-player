// 播放器事件管理

/**
 * 绑定播放器事件（每次调用都会重新绑定，确保新渲染的元素也能响应）
 */
function bindPlayerEvents() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const playModeBtn = document.getElementById('playModeBtn');
    const muteBtn = document.getElementById('muteBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const progressBarBg = document.getElementById('progressBarBg');
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlay);
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', playPrev);
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', playNext);
    }
    if (playModeBtn) {
        playModeBtn.addEventListener('click', togglePlayMode);
    }
    if (muteBtn) {
        muteBtn.addEventListener('click', toggleMute);
    }
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            setVolume(parseInt(e.target.value));
        });
    }
    
    if (progressBarBg) {
        let isDragging = false;
        
        const seekToPosition = (e) => {
            if (!audio || !audio.duration) return;
            const rect = progressBarBg.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            seekTo(percent * audio.duration);
        };
        
        progressBarBg.addEventListener('mousedown', (e) => {
            isDragging = true;
            seekToPosition(e);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) seekToPosition(e);
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
}

/**
 * 更新进度条
 */
function updateProgressBar(currentTime, duration) {
    const progressBar = document.getElementById('progressBar');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    
    if (!progressBar || !duration) return;
    
    const progress = (currentTime / duration) * 100;
    progressBar.style.width = `${progress}%`;
    
    if (currentTimeEl) currentTimeEl.textContent = formatTime(currentTime);
    if (durationEl) durationEl.textContent = formatTime(duration);
}

/**
 * 更新音量控制
 */
function updateVolumeControl() {
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) volumeSlider.value = State.volume;
}
