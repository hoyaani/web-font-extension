// 將 options.js 中的 browser API 替換為 chrome API（Manifest V3 兼容版）

// 初始化選項頁面
async function initializeOptionsPage() {
    try {
        await loadGlobalSettings();
        await loadSiteSettings();
        await updateStatistics();
        setupEventListeners();
        console.log('Options page initialized successfully');
    } catch (error) {
        console.error('Error initializing options page:', error);
        showNotification('初始化失敗', 'error');
    }
}

// 載入全局設定
async function loadGlobalSettings() {
    try {
        const result = await chrome.storage.local.get(['globalSettings']);
        const settings = result.globalSettings || getDefaultSettings();

        document.getElementById('globalFontSize').value = settings.fontSize || 16;
        document.getElementById('globalTextColor').value = settings.textColor || '#000000';
        document.getElementById('globalTextColorPicker').value = settings.textColor || '#000000';
        document.getElementById('globalBgColor').value = settings.backgroundColor || '#ffffff';
        document.getElementById('globalBgColorPicker').value = settings.backgroundColor || '#ffffff';
        document.getElementById('globalFontFamily').value = settings.fontFamily || 'Default Font';
        document.getElementById('globalUnderlineLinks').checked = settings.underlineLinks !== false;
        document.getElementById('globalColorLinks').checked = settings.colorLinks !== false;

    } catch (error) {
        console.error('Error loading global settings:', error);
        showNotification('載入全局設定失敗', 'error');
    }
}

// 保存全局設定
async function saveGlobalSettings() {
    try {
        const settings = {
            fontSize: parseInt(document.getElementById('globalFontSize').value),
            textColor: document.getElementById('globalTextColor').value,
            backgroundColor: document.getElementById('globalBgColor').value,
            fontFamily: document.getElementById('globalFontFamily').value,
            underlineLinks: document.getElementById('globalUnderlineLinks').checked,
            colorLinks: document.getElementById('globalColorLinks').checked,
            lastModified: new Date().toISOString()
        };

        await chrome.storage.local.set({ globalSettings: settings });
        showNotification('全局設定已保存', 'success');

        // 通知所有開啟的分頁重新載入設定
        const tabs = await chrome.tabs.query({});
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
                action: 'reloadSettings'
            }).catch(() => {
                // 忽略無法發送消息的分頁
            });
        });

    } catch (error) {
        console.error('Error saving global settings:', error);
        showNotification('保存設定失敗', 'error');
    }
}

// 載入網站特定設定
async function loadSiteSettings() {
    try {
        const result = await chrome.storage.local.get(['siteSettings']);
        const siteSettings = result.siteSettings || {};

        const siteList = document.getElementById('siteList');

        if (Object.keys(siteSettings).length === 0) {
            siteList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">尚無網站特定設定</p>';
            return;
        }

        const siteItems = Object.entries(siteSettings).map(([hostname, settings]) => {
            const lastModified = settings.lastModified ?
                new Date(settings.lastModified).toLocaleString('zh-TW') : '未知';

            return `
                <div class="site-item">
                    <div>
                        <strong>${hostname}</strong>
                        <br>
                        <small style="color: #666;">
                            字體: ${settings.fontSize || 16}px,
                            字體族: ${settings.fontFamily || 'Default'},
                            修改: ${lastModified}
                        </small>
                    </div>
                    <div>
                        <button class="btn btn-secondary" onclick="editSiteSettings('${hostname}')">編輯</button>
                        <button class="btn btn-danger" onclick="deleteSiteSettings('${hostname}')">刪除</button>
                    </div>
                </div>
            `;
        }).join('');

        siteList.innerHTML = siteItems;

    } catch (error) {
        console.error('Error loading site settings:', error);
        showNotification('載入網站設定失敗', 'error');
    }
}

// 刪除特定網站設定
async function deleteSiteSettings(hostname) {
    if (!confirm(`確定要刪除 ${hostname} 的設定嗎？`)) {
        return;
    }

    try {
        const result = await chrome.storage.local.get(['siteSettings']);
        const siteSettings = result.siteSettings || {};

        if (siteSettings[hostname]) {
            delete siteSettings[hostname];
            await chrome.storage.local.set({ siteSettings });

            // 重新加載網站列表
            await loadSiteSettings();

            // 通知相關標籤頁重新加載設置
            const tabs = await chrome.tabs.query({});
            tabs.forEach(tab => {
                try {
                    const url = new URL(tab.url);
                    if (url.hostname === hostname) {
                        chrome.tabs.sendMessage(tab.id, { action: 'reloadSettings' });
                    }
                } catch (e) {
                    // 忽略無效URL
                }
            });

            showNotification(`已刪除 ${hostname} 的設定`, 'success');
        }
    } catch (error) {
        console.error('Error deleting site settings:', error);
        showNotification('刪除設定失敗', 'error');
    }
}

// 清除所有網站設定
async function clearAllSiteSettings() {
    if (!confirm('確定要清除所有網站的特定設定嗎？這項操作無法撤銷！')) {
        return;
    }

    try {
        await chrome.storage.local.set({ siteSettings: {} });
        await loadSiteSettings();

        // 通知所有標籤頁重新加載設置
        const tabs = await chrome.tabs.query({});
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { action: 'reloadSettings' }).catch(() => {
                // 忽略無法發送消息的分頁
            });
        });

        showNotification('所有網站設定已清除', 'success');
    } catch (error) {
        console.error('Error clearing all site settings:', error);
        showNotification('清除設定失敗', 'error');
    }
}

// 導出配置
async function exportConfiguration() {
    try {
        const config = await chrome.runtime.sendMessage({ action: 'exportConfig' });

        if (config.error) {
            throw new Error(config.error);
        }

        // 將配置轉換為JSON字符串
        const jsonString = JSON.stringify(config.config, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // 創建下載鏈接
        const a = document.createElement('a');
        a.href = url;
        a.download = `font-manager-config-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();

        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);

        showNotification('配置已導出', 'success');
    } catch (error) {
        console.error('Error exporting configuration:', error);
        showNotification('導出配置失敗', 'error');
    }
}

// 導入配置
async function importConfiguration(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const config = JSON.parse(e.target.result);
                const response = await chrome.runtime.sendMessage({
                    action: 'importConfig',
                    config: config
                });

                if (response.success) {
                    // 重新加載設置
                    await loadGlobalSettings();
                    await loadSiteSettings();
                    showNotification('配置已導入', 'success');
                } else {
                    throw new Error(response.error || '導入失敗');
                }
            } catch (err) {
                console.error('Import error:', err);
                showNotification('導入配置失敗: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
    } catch (error) {
        console.error('Error importing configuration:', error);
        showNotification('導入配置失敗', 'error');
    }
}

// 重置為默認值
async function resetToDefault() {
    if (!confirm('確定要將所有設定重置為默認值嗎？')) {
        return;
    }

    try {
        const defaultSettings = getDefaultSettings();
        await chrome.storage.local.set({
            globalSettings: defaultSettings,
            siteSettings: {}
        });

        // 重新加載設置
        await loadGlobalSettings();
        await loadSiteSettings();

        // 通知所有標籤頁重新加載設置
        const tabs = await chrome.tabs.query({});
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { action: 'reloadSettings' }).catch(() => {
                // 忽略無法發送消息的分頁
            });
        });

        showNotification('已重置為默認設定', 'success');
    } catch (error) {
        console.error('Error resetting to default:', error);
        showNotification('重置設定失敗', 'error');
    }
}

// 清除所有數據
async function clearAllData() {
    if (!confirm('確定要清除所有數據嗎？這項操作無法撤銷！')) {
        return;
    }

    try {
        await chrome.storage.local.clear();
        await loadGlobalSettings();
        await loadSiteSettings();

        // 通知所有標籤頁重新加載設置
        const tabs = await chrome.tabs.query({});
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { action: 'reloadSettings' }).catch(() => {
                // 忽略無法發送消息的分頁
            });
        });

        showNotification('所有數據已清除', 'success');
    } catch (error) {
        console.error('Error clearing all data:', error);
        showNotification('清除數據失敗', 'error');
    }
}

// 更新統計信息
async function updateStatistics() {
    try {
        const result = await chrome.storage.local.get(['siteSettings', 'globalSettings']);
        const siteCount = Object.keys(result.siteSettings || {}).length;
        
        // 更新網站數量統計
        document.getElementById('totalSites').textContent = siteCount;
        
        // 更新最後使用時間
        const lastUsed = result.globalSettings?.lastModified 
            ? new Date(result.globalSettings.lastModified).toLocaleString('zh-TW')
            : '從未使用';
        document.getElementById('lastUsed').textContent = lastUsed;
        
    } catch (error) {
        console.error('Error updating statistics:', error);
    }
}