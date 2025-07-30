// Background service worker for Wikipedia Troll Extension
// Handles extension lifecycle, tab management, and cross-tab state synchronization

// Constants
const STORAGE_KEYS = {
    PRANK_ENABLED: 'prankEnabled',
    CACHE_PREFIX: 'factCache_'
};

// Extension lifecycle events
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('Wikipedia Troll extension installed/updated:', details.reason);
    
    try {
        // Initialize default settings on fresh install
        if (details.reason === 'install') {
            await chrome.storage.sync.set({
                [STORAGE_KEYS.PRANK_ENABLED]: false
            });
            console.log('Default settings initialized');
        }
        
        // Perform any necessary updates on extension update
        if (details.reason === 'update') {
            console.log('Extension updated, performing maintenance');
            await performUpdateMaintenance();
        }
        
    } catch (error) {
        console.error('Error during extension installation/update:', error);
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Wikipedia Troll extension started');
    performStartupMaintenance();
});

// Listen for storage changes to coordinate across tabs
chrome.storage.onChanged.addListener(async (changes, namespace) => {
    if (namespace === 'sync' && changes[STORAGE_KEYS.PRANK_ENABLED]) {
        const newValue = changes[STORAGE_KEYS.PRANK_ENABLED].newValue;
        console.log('Prank state changed to:', newValue);
        
        // If prank was disabled, reload all Wikipedia tabs
        if (!newValue) {
            await reloadWikipediaTabs();
        }
    }
});

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Only process when page is completely loaded
    if (changeInfo.status === 'complete' && tab.url) {
        try {
            // Check if this is a Wikipedia page
            if (isWikipediaPage(tab.url)) {
                await handleWikipediaPageLoad(tabId, tab);
            }
        } catch (error) {
            console.error('Error handling tab update:', error);
        }
    }
});

// Message handling from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message);
    
    switch (message.type) {
        case 'GET_PRANK_STATUS':
            handleGetPrankStatus(sendResponse);
            return true; // Keep sendResponse alive
            
        case 'LOG_ERROR':
            console.error('Content script error:', message.error);
            break;
            
        case 'FACTS_INJECTED':
            console.log('Facts injected in tab:', sender.tab?.id, 'Count:', message.count);
            break;
            
        default:
            console.warn('Unknown message type:', message.type);
    }
});

/**
 * Check if a URL is a Wikipedia page
 */
function isWikipediaPage(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes('wikipedia.org');
    } catch (error) {
        return false;
    }
}

/**
 * Handle Wikipedia page load
 */
async function handleWikipediaPageLoad(tabId, tab) {
    try {
        // Check if prank is enabled
        const result = await chrome.storage.sync.get([STORAGE_KEYS.PRANK_ENABLED]);
        const isEnabled = result[STORAGE_KEYS.PRANK_ENABLED] || false;
        
        if (isEnabled) {
            console.log('Wikipedia page loaded with prank enabled:', tab.url);
            // Content script should automatically handle injection
        }
    } catch (error) {
        console.error('Error handling Wikipedia page load:', error);
    }
}

/**
 * Handle get prank status request
 */
async function handleGetPrankStatus(sendResponse) {
    try {
        const result = await chrome.storage.sync.get([STORAGE_KEYS.PRANK_ENABLED]);
        const isEnabled = result[STORAGE_KEYS.PRANK_ENABLED] || false;
        
        sendResponse({ enabled: isEnabled });
    } catch (error) {
        console.error('Error getting prank status:', error);
        sendResponse({ enabled: false, error: error.message });
    }
}

/**
 * Reload all Wikipedia tabs
 */
async function reloadWikipediaTabs() {
    try {
        const tabs = await chrome.tabs.query({
            url: ['*://*.wikipedia.org/*']
        });
        
        for (const tab of tabs) {
            try {
                await chrome.tabs.reload(tab.id);
                console.log('Reloaded Wikipedia tab:', tab.id);
            } catch (error) {
                console.error('Failed to reload tab:', tab.id, error);
            }
        }
        
        console.log(`Successfully reloaded ${tabs.length} Wikipedia tabs`);
    } catch (error) {
        console.error('Error reloading Wikipedia tabs:', error);
    }
}

/**
 * Perform maintenance tasks on extension update
 */
async function performUpdateMaintenance() {
    try {
        // Clean up any old cache entries or settings
        console.log('Performing update maintenance...');
        
        // Could add specific update logic here
        // For now, just log the event
        
        console.log('Update maintenance completed');
    } catch (error) {
        console.error('Error during update maintenance:', error);
    }
}

/**
 * Perform maintenance tasks on extension startup
 */
async function performStartupMaintenance() {
    try {
        console.log('Performing startup maintenance...');
        
        // Clean up expired cache entries
        await cleanupExpiredCache();
        
        console.log('Startup maintenance completed');
    } catch (error) {
        console.error('Error during startup maintenance:', error);
    }
}

/**
 * Clean up expired cache entries
 */
async function cleanupExpiredCache() {
    try {
        const allItems = await chrome.storage.local.get(null);
        const now = Date.now();
        const expiredKeys = [];
        
        // Find expired cache items
        Object.entries(allItems).forEach(([key, value]) => {
            if (key.startsWith(STORAGE_KEYS.CACHE_PREFIX) && 
                value && value.expiry && now > value.expiry) {
                expiredKeys.push(key);
            }
        });
        
        // Remove expired items
        if (expiredKeys.length > 0) {
            await chrome.storage.local.remove(expiredKeys);
            console.log('Cleaned up expired cache items:', expiredKeys.length);
        }
    } catch (error) {
        console.error('Error cleaning up expired cache:', error);
    }
}

/**
 * Get extension statistics (for debugging)
 */
async function getExtensionStats() {
    try {
        const syncData = await chrome.storage.sync.get(null);
        const localData = await chrome.storage.local.get(null);
        
        const cacheKeys = Object.keys(localData).filter(key => 
            key.startsWith(STORAGE_KEYS.CACHE_PREFIX)
        );
        
        const wikipediaTabs = await chrome.tabs.query({
            url: ['*://*.wikipedia.org/*']
        });
        
        return {
            prankEnabled: syncData[STORAGE_KEYS.PRANK_ENABLED] || false,
            cachedFactsCount: cacheKeys.length,
            activeWikipediaTabs: wikipediaTabs.length,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error getting extension stats:', error);
        return null;
    }
}

// Make functions available for debugging
globalThis.WikipediaTrollBackground = {
    getStats: getExtensionStats,
    reloadWikipediaTabs: reloadWikipediaTabs,
    cleanupCache: cleanupExpiredCache
}; 