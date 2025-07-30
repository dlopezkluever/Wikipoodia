import { STORAGE_KEYS, CONFIG, ERROR_MESSAGES, DEBUG } from './constants.js';

/**
 * Storage utility functions for Chrome extension
 * Provides abstraction layer over chrome.storage.sync API
 */

/**
 * Get the prank enabled state
 * @returns {Promise<boolean>} Whether prank is enabled
 */
export async function getPrankEnabled() {
    try {
        const result = await chrome.storage.sync.get([STORAGE_KEYS.PRANK_ENABLED]);
        const enabled = result[STORAGE_KEYS.PRANK_ENABLED] || false;
        
        if (DEBUG.ENABLED) {
            console.log('Storage: Prank enabled state retrieved:', enabled);
        }
        
        return enabled;
    } catch (error) {
        console.error('Storage: Failed to get prank enabled state:', error);
        throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
}

/**
 * Set the prank enabled state
 * @param {boolean} enabled - Whether to enable the prank
 * @returns {Promise<void>}
 */
export async function setPrankEnabled(enabled) {
    try {
        await chrome.storage.sync.set({
            [STORAGE_KEYS.PRANK_ENABLED]: enabled
        });
        
        if (DEBUG.ENABLED) {
            console.log('Storage: Prank enabled state set to:', enabled);
        }
    } catch (error) {
        console.error('Storage: Failed to set prank enabled state:', error);
        throw new Error(ERROR_MESSAGES.STORAGE_ERROR);
    }
}

/**
 * Cache a generated fact for a specific page
 * @param {string} pageKey - Unique identifier for the page
 * @param {string} fact - The generated fact to cache
 * @returns {Promise<void>}
 */
export async function cacheFact(pageKey, fact) {
    try {
        const cacheKey = STORAGE_KEYS.CACHE_PREFIX + pageKey;
        const cacheData = {
            fact: fact,
            timestamp: Date.now(),
            expiry: Date.now() + (CONFIG.CACHE_EXPIRY_HOURS * 60 * 60 * 1000)
        };
        
        await chrome.storage.local.set({
            [cacheKey]: cacheData
        });
        
        if (DEBUG.LOG_CACHE) {
            console.log('Storage: Fact cached for page:', pageKey);
        }
    } catch (error) {
        console.error('Storage: Failed to cache fact:', error);
        // Non-critical error - don't throw
    }
}

/**
 * Retrieve a cached fact for a specific page
 * @param {string} pageKey - Unique identifier for the page
 * @returns {Promise<string|null>} Cached fact or null if not found/expired
 */
export async function getCachedFact(pageKey) {
    try {
        const cacheKey = STORAGE_KEYS.CACHE_PREFIX + pageKey;
        const result = await chrome.storage.local.get([cacheKey]);
        const cacheData = result[cacheKey];
        
        if (!cacheData) {
            if (DEBUG.LOG_CACHE) {
                console.log('Storage: No cached fact found for page:', pageKey);
            }
            return null;
        }
        
        // Check if cache has expired
        if (Date.now() > cacheData.expiry) {
            if (DEBUG.LOG_CACHE) {
                console.log('Storage: Cached fact expired for page:', pageKey);
            }
            // Clean up expired cache
            await chrome.storage.local.remove([cacheKey]);
            return null;
        }
        
        if (DEBUG.LOG_CACHE) {
            console.log('Storage: Cached fact retrieved for page:', pageKey);
        }
        
        return cacheData.fact;
    } catch (error) {
        console.error('Storage: Failed to get cached fact:', error);
        return null; // Non-critical error
    }
}

/**
 * Clear all cached facts
 * @returns {Promise<void>}
 */
export async function clearFactCache() {
    try {
        // Get all storage items
        const allItems = await chrome.storage.local.get(null);
        
        // Find cache keys
        const cacheKeys = Object.keys(allItems).filter(key => 
            key.startsWith(STORAGE_KEYS.CACHE_PREFIX)
        );
        
        if (cacheKeys.length > 0) {
            await chrome.storage.local.remove(cacheKeys);
            
            if (DEBUG.LOG_CACHE) {
                console.log('Storage: Cleared cache keys:', cacheKeys.length);
            }
        }
    } catch (error) {
        console.error('Storage: Failed to clear fact cache:', error);
        // Non-critical error
    }
}

/**
 * Perform cache cleanup of expired items
 * @returns {Promise<void>}
 */
export async function cleanupExpiredCache() {
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
            
            if (DEBUG.LOG_CACHE) {
                console.log('Storage: Cleaned up expired cache items:', expiredKeys.length);
            }
        }
        
        // Update last cleanup timestamp
        await chrome.storage.local.set({
            [STORAGE_KEYS.LAST_CLEANUP]: now
        });
        
    } catch (error) {
        console.error('Storage: Failed to cleanup expired cache:', error);
        // Non-critical error
    }
}

/**
 * Check if cache cleanup is needed and perform it
 * @returns {Promise<void>}
 */
export async function performCacheMaintenanceIfNeeded() {
    try {
        const result = await chrome.storage.local.get([STORAGE_KEYS.LAST_CLEANUP]);
        const lastCleanup = result[STORAGE_KEYS.LAST_CLEANUP] || 0;
        const now = Date.now();
        
        // Perform cleanup once per day
        const cleanupInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        if (now - lastCleanup > cleanupInterval) {
            await cleanupExpiredCache();
        }
    } catch (error) {
        console.error('Storage: Failed to perform cache maintenance:', error);
        // Non-critical error
    }
}

/**
 * Get storage usage statistics (for debugging)
 * @returns {Promise<object>} Storage usage information
 */
export async function getStorageStats() {
    try {
        const syncItems = await chrome.storage.sync.get(null);
        const localItems = await chrome.storage.local.get(null);
        
        const cacheKeys = Object.keys(localItems).filter(key => 
            key.startsWith(STORAGE_KEYS.CACHE_PREFIX)
        );
        
        return {
            syncItemCount: Object.keys(syncItems).length,
            localItemCount: Object.keys(localItems).length,
            cachedFactCount: cacheKeys.length,
            prankEnabled: syncItems[STORAGE_KEYS.PRANK_ENABLED] || false
        };
    } catch (error) {
        console.error('Storage: Failed to get storage stats:', error);
        return null;
    }
} 