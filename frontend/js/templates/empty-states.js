// 空状态模板系统

/**
 * 空状态模板生成器
 */
const EmptyStateTemplates = {
    /**
     * 通用空歌曲列表
     */
    songs: '<div class="empty-state"><div class="empty-state-icon">♫</div><span>暂无歌曲</span></div>',
    
    /**
     * 播放列表为空
     */
    playlist: '<div class="empty-state"><div class="empty-state-icon">♫</div><span>播放列表为空</span></div>',
    
    /**
     * 搜索结果为空
     */
    search: '<div class="empty-state"><div class="empty-state-icon">🔍</div><span>搜索你想听的歌曲</span></div>',
    
    /**
     * 收藏为空
     */
    favorites: '<div class="empty-state"><div class="empty-state-icon">❤️</div><span>暂无收藏</span></div>',
    
    /**
     * 历史为空
     */
    history: '<div class="empty-state"><div class="empty-state-icon">🕐</div><span>暂无播放历史</span></div>',
    
    /**
     * 播放器就绪
     */
    playerReady: '<div class="empty-state"><div class="empty-state-icon">♫</div><span>播放器已就绪，等待你的第一首歌</span></div>',
    
    /**
     * 无歌词
     */
    noLyrics: '<div class="no-lyrics"><svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" opacity="0.3"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg><p>暂无歌词</p></div>'
};
