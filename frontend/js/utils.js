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
 * 节流函数（保留以备将来使用）
 */
// function throttle(func, limit = 100) {
//     let inThrottle;
//     return function(...args) {
//         if (!inThrottle) {
//             func.apply(this, args);
//             inThrottle = true;
//             setTimeout(() => inThrottle = false, limit);
//         }
//     };
// }

/**
 * 显示Toast提示
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
