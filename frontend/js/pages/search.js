// 搜索页面渲染器

/**
 * 渲染搜索页
 */
function renderSearchPage(container) {
    clearElement(container);
    container.className = 'search-page page-content';

    const results = State.searchResults || [];
    const currentPageResults = getCurrentPageResults();
    const totalPages = getTotalPages();
    const currentPage = State.searchCurrentPage || 1;

    // 搜索框
    const searchBox = createElement('div', 'search-box');
    searchBox.innerHTML = `
        <div class="search-input-wrapper">
            <input type="text" class="search-input" id="pageSearchInput" placeholder="搜索歌手、歌名..." value="">
            <button class="search-clear-btn" id="pageSearchClearBtn" title="清除">×</button>
        </div>
    `;
    container.appendChild(searchBox);

    // 结果表格
    const tableWrapper = createElement('div', 'table-wrapper');

    if (results.length === 0) {
        tableWrapper.innerHTML = EmptyStateTemplates.search;
    } else {
        // 分页信息
        const startNum = (currentPage - 1) * State.searchPageSize + 1;
        const endNum = Math.min(currentPage * State.searchPageSize, results.length);
        
        tableWrapper.innerHTML = `
            <div style="padding: 8px 12px; font-size: 12px; color: var(--text-tertiary);">
                第 ${startNum}-${endNum} 条，共 ${results.length} 条 | 单击播放，点击“+”添加到列表
            </div>
            ${renderSongTable(currentPageResults, { showActions: true, searchable: true, hidePlayBtn: true })}
            ${totalPages > 1 ? renderPagination(currentPage, totalPages) : ''}
        `;

        // 使用事件委托绑定事件
        bindTableEvents(tableWrapper, results, 'search');
    }

    container.appendChild(tableWrapper);

    // 免责声明
    const disclaimer = createElement('div', 'search-disclaimer');
    disclaimer.innerHTML = `
        <p>⚠️ 免责声明：本软件仅为技术学习项目，不提供任何版权音乐。所有搜索结果均来自第三方平台，版权归属原权利人。请支持正版音乐。</p>
    `;
    container.appendChild(disclaimer);

    // 绑定搜索框事件
    bindSearchBoxEvents();
}

/**
 * 渲染分页控件
 */
function renderPagination(currentPage, totalPages) {
    const pages = [];
    const maxVisible = 5; // 最多显示的页码数
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    // 调整起始页，确保显示足够的页码
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    // 生成页码
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    
    const pageButtons = pages.map(page => {
        const isActive = page === currentPage;
        return `<button class="pagination-btn ${isActive ? 'active' : ''}" onclick="goToSearchPage(${page})">${page}</button>`;
    }).join('');
    
    return `
        <div class="pagination-container">
            <button class="pagination-btn" onclick="prevSearchPage()" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>
            ${startPage > 1 ? '<span class="pagination-ellipsis">...</span>' : ''}
            ${pageButtons}
            ${endPage < totalPages ? '<span class="pagination-ellipsis">...</span>' : ''}
            <button class="pagination-btn" onclick="nextSearchPage()" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>
        </div>
    `;
}
