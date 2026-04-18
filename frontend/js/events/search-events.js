// 搜索框事件管理

/**
 * 绑定搜索框事件
 */
function bindSearchBoxEvents() {
    const pageSearchInput = document.getElementById('pageSearchInput');
    const pageSearchClearBtn = document.getElementById('pageSearchClearBtn');

    if (pageSearchInput && pageSearchClearBtn) {
        // 初始化：根据当前输入内容设置清除按钮状态
        if (pageSearchInput.value.length > 0) {
            pageSearchClearBtn.classList.add('visible');
        } else {
            pageSearchClearBtn.classList.remove('visible');
        }
        
        // 回车搜索
        pageSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch(pageSearchInput.value, true);
            }
        });
        
        // 输入时控制清除按钮显示/隐藏
        pageSearchInput.addEventListener('input', (e) => {
            if (e.target.value.length > 0) {
                pageSearchClearBtn.classList.add('visible');
            } else {
                pageSearchClearBtn.classList.remove('visible');
            }
        });
        
        // 可选：输入时自动搜索（带防抖）
        // pageSearchInput.addEventListener('input', (e) => {
        //     handleSearch(e.target.value, false); // false 表示使用防抖
        // });
        
        // 清除按钮点击事件
        pageSearchClearBtn.addEventListener('click', () => {
            pageSearchInput.value = '';
            pageSearchClearBtn.classList.remove('visible');
            State.searchResults = [];
            renderApp();
            // 聚焦回输入框
            pageSearchInput.focus();
        });
    }
}
