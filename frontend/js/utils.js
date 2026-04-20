// 工具函数集合

/**
 * 格式化时间（秒 -> mm:ss）
 */
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '00:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * 截断文本，超出部分显示省略号
 */
function truncateText(text, maxLength = 30) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * 防抖函数
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 */
function throttle(func, limit = 100) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 创建DOM元素
 */
function createElement(tag, className = '', innerHTML = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
}

/**
 * 清空DOM元素内容
 */
function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * 生成唯一ID（保留以备将来使用）
 */
// function generateId() {
//     return Date.now().toString(36) + Math.random().toString(36).substr(2);
// }

/**
 * 深拷贝对象（保留以备将来使用）
 */
// function deepClone(obj) {
//     return JSON.parse(JSON.stringify(obj));
// }

/**
 * 数组去重（基于某个键）（保留以备将来使用）
 */
// function uniqueBy(array, key) {
//     const seen = new Set();
//     return array.filter(item => {
//         const value = item[key];
//         if (seen.has(value)) {
//             return false;
//         }
//         seen.add(value);
//         return true;
//     });
// }

/**
 * 显示 Toast 提示
 */
function showToast(message, duration = 2000) {
    const toast = createElement('div', 'toast', message);
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, duration);
}

/**
 * HTML转义，防止XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 显示自定义确认弹窗（替代原生 confirm）
 */
function showConfirm(message) {
    return new Promise((resolve) => {
        // 移除已存在的弹窗
        const existing = document.querySelector('.confirm-modal-overlay');
        if (existing) existing.remove();

        const overlay = createElement('div', 'confirm-modal-overlay');
        overlay.innerHTML = `
            <div class="confirm-modal">
                <div class="confirm-modal-message">${escapeHtml(message)}</div>
                <div class="confirm-modal-actions">
                    <button class="confirm-btn cancel-btn">取消</button>
                    <button class="confirm-btn ok-btn">确定</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // 强制重绘以触发过渡动画
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });

        const close = (result) => {
            overlay.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            }, 200);
            resolve(result);
        };

        overlay.querySelector('.cancel-btn').addEventListener('click', () => close(false));
        overlay.querySelector('.ok-btn').addEventListener('click', () => close(true));
        
        // 点击背景关闭
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close(false);
        });
    });
}
