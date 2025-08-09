// Content script for Font Manager Extension (Manifest V3 兼容版)

(function() {
    'use strict';

    let currentSettings = {};
    let isInitialized = false;

    // 初始化內容腳本
    async function initialize() {
        if (isInitialized) return;

        try {
            const hostname = window.location.hostname;
            await loadAndApplySettings(hostname);
            setupMessageListener();
            isInitialized = true;
            console.log('Font Manager: Content script initialized for', hostname);
        } catch (error) {
            console.error('Font Manager: Initialization error:', error);
        }
    }

    // 載入並套用設定
    async function loadAndApplySettings(hostname) {
        try {
            // Manifest V3 中使用 chrome.runtime.sendMessage 替換 browser.runtime.sendMessage
            const response = await chrome.runtime.sendMessage({
                action: 'getSettings',
                hostname: hostname
            });

            if (response && response.settings) {
                currentSettings = response.settings;
                applySettings(currentSettings);
            }
        } catch (error) {
            console.error('Font Manager: Error loading settings:', error);
        }
    }

    // 設定消息監聽器
    function setupMessageListener() {
        // Manifest V3 中使用 chrome.runtime.onMessage 替換 browser.runtime.onMessage
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            switch (message.action) {
                case 'adjustFontSize':
                    adjustFontSize(message.delta);
                    sendResponse({ success: true });
                    break;

                case 'resetFont':
                    resetFontSettings();
                    sendResponse({ success: true });
                    break;

                case 'applySettings':
                    if (message.settings) {
                        currentSettings = message.settings;
                        applySettings(currentSettings);
                    }
                    sendResponse({ success: true });
                    break;

                case 'reloadSettings':
                    loadAndApplySettings(window.location.hostname);
                    sendResponse({ success: true });
                    break;

                default:
                    sendResponse({ error: 'Unknown action' });
            }
            // Manifest V3 中對於同步回應不需要返回true，異步才需要
            return false;
        });
    }

    // 重置字體設定
    async function resetFontSettings() {
        try {
            // Manifest V3 中使用 chrome.runtime.sendMessage 替換 browser.runtime.sendMessage
            const response = await chrome.runtime.sendMessage({
                action: 'getSettings',
                hostname: '__global__'
            });

            if (response && response.settings) {
                currentSettings = response.settings;
                applySettings(currentSettings);
                showTemporaryNotification('字體設定已重置');
            }
        } catch (error) {
            console.error('Font Manager: Error resetting font:', error);
        }
    }

    // 保存當前設定到網站特定設定
    async function saveCurrentSettings() {
        try {
            // Manifest V3 中使用 chrome.runtime.sendMessage 替換 browser.runtime.sendMessage
            await chrome.runtime.sendMessage({
                action: 'saveSettings',
                hostname: window.location.hostname,
                settings: {
                    ...currentSettings,
                    lastModified: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Font Manager: Error saving settings:', error);
        }
    }

    // 顯示臨時通知
    function showTemporaryNotification(message) {
        // 移除現有通知
        const existing = document.getElementById('font-manager-notification');
        if (existing) {
            existing.remove();
        }

        // 創建新通知
        const notification = document.createElement('div');
        notification.id = 'font-manager-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(66, 133, 244, 0.95);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            z-index: 999999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            transition: all 0.3s ease;
            transform: translateX(400px);
            opacity: 0;
        `;

        document.body.appendChild(notification);

        // 觸發進入動畫
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);

        // 自動隱藏
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2500);
    }

    // 檢測頁面變化並重新套用設定
    function observePageChanges() {
        // 監聽動態內容變化
        const observer = new MutationObserver((mutations) => {
            let shouldReapply = false;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // 檢查是否有重要的新節點添加
                    for (let node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.tagName && ['DIV', 'SPAN', 'P', 'A', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(node.tagName)) {
                                shouldReapply = true;
                                break;
                            }
                        }
                    }
                }
            });

            if (shouldReapply) {
                // 延遲重新套用，避免過於頻繁
                clearTimeout(observer.reapplyTimer);
                observer.reapplyTimer = setTimeout(() => {
                    applySettings(currentSettings);
                }, 500);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 頁面加載完成後初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // 開始監聽頁面變化
    if (document.body) {
        observePageChanges();
    } else {
        document.addEventListener('DOMContentLoaded', observePageChanges);
    }

    // 監聽頁面可見性變化，重新套用設定
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && currentSettings) {
            setTimeout(() => applySettings(currentSettings), 100);
        }
    });

})();