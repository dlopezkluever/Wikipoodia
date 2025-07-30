// Popup functionality for Wikipedia Troll Extension
// Note: Using traditional JavaScript (not ES6 modules) for Chrome extension compatibility

// Constants (duplicated from utils/constants.js for popup context)
const STORAGE_KEYS = {
    PRANK_ENABLED: 'prankEnabled'
};

const SUCCESS_MESSAGES = {
    PRANK_ENABLED: 'Prank activated! Visit Wikipedia to see it in action.',
    PRANK_DISABLED: 'Prank deactivated. Pages will reload automatically.'
};

const ERROR_MESSAGES = {
    STORAGE_ERROR: 'Failed to access browser storage'
};

// DOM elements
let prankToggle;
let statusText;
let statusDisplay;
let feedbackElement;

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get DOM elements
        prankToggle = document.getElementById('prank-toggle');
        statusText = document.getElementById('status-text');
        statusDisplay = document.querySelector('.status-display');
        feedbackElement = document.getElementById('feedback');
        
        // Load current state
        await loadCurrentState();
        
        // Set up event listeners
        setupEventListeners();
        
        console.log('Popup initialized successfully');
    } catch (error) {
        console.error('Failed to initialize popup:', error);
        showError('Failed to initialize extension popup');
    }
});

/**
 * Load the current prank state from storage
 */
async function loadCurrentState() {
    try {
        const result = await chrome.storage.sync.get([STORAGE_KEYS.PRANK_ENABLED]);
        const isEnabled = result[STORAGE_KEYS.PRANK_ENABLED] || false;
        
        // Update UI to reflect current state
        updateUIState(isEnabled);
        
        console.log('Current prank state loaded:', isEnabled);
    } catch (error) {
        console.error('Failed to load current state:', error);
        showError(ERROR_MESSAGES.STORAGE_ERROR);
    }
}

/**
 * Set up event listeners for the popup
 */
function setupEventListeners() {
    if (prankToggle) {
        prankToggle.addEventListener('change', handleToggleChange);
    }
    
    // Listen for storage changes from other parts of the extension
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && changes[STORAGE_KEYS.PRANK_ENABLED]) {
            const newValue = changes[STORAGE_KEYS.PRANK_ENABLED].newValue;
            updateUIState(newValue);
        }
    });
}

/**
 * Handle toggle switch changes
 */
async function handleToggleChange(event) {
    const isEnabled = event.target.checked;
    
    try {
        // Show loading state
        prankToggle.disabled = true;
        showFeedback('Updating...', 'info');
        
        // Save new state to storage
        await chrome.storage.sync.set({
            [STORAGE_KEYS.PRANK_ENABLED]: isEnabled
        });
        
        // Update UI
        updateUIState(isEnabled);
        
        // Show success message
        const message = isEnabled ? SUCCESS_MESSAGES.PRANK_ENABLED : SUCCESS_MESSAGES.PRANK_DISABLED;
        showFeedback(message, 'success');
        
        // If disabling, reload Wikipedia tabs
        if (!isEnabled) {
            await reloadWikipediaTabs();
        }
        
        console.log('Prank state updated to:', isEnabled);
        
    } catch (error) {
        console.error('Failed to update prank state:', error);
        
        // Revert toggle state on error
        prankToggle.checked = !isEnabled;
        showError(ERROR_MESSAGES.STORAGE_ERROR);
    } finally {
        // Re-enable toggle
        prankToggle.disabled = false;
        
        // Hide feedback after delay
        setTimeout(() => {
            hideFeedback();
        }, 3000);
    }
}

/**
 * Update UI elements to reflect the current state
 */
function updateUIState(isEnabled) {
    if (prankToggle) {
        prankToggle.checked = isEnabled;
    }
    
    if (statusText) {
        statusText.textContent = isEnabled ? 'On' : 'Off';
        statusText.className = isEnabled ? 'status-value active' : 'status-value';
    }
    
    if (statusDisplay) {
        statusDisplay.className = isEnabled ? 'status-display active' : 'status-display inactive';
    }
}

/**
 * Show feedback message to user
 */
function showFeedback(message, type = 'info') {
    if (feedbackElement) {
        feedbackElement.textContent = message;
        feedbackElement.className = `feedback ${type}`;
        feedbackElement.style.display = 'block';
    }
}

/**
 * Show error message
 */
function showError(message) {
    showFeedback(message, 'error');
}

/**
 * Hide feedback message
 */
function hideFeedback() {
    if (feedbackElement) {
        feedbackElement.className = 'feedback hidden';
        feedbackElement.style.display = 'none';
    }
}

/**
 * Reload all Wikipedia tabs when prank is disabled
 */
async function reloadWikipediaTabs() {
    try {
        // Query for all Wikipedia tabs
        const tabs = await chrome.tabs.query({
            url: ['*://*.wikipedia.org/*']
        });
        
        // Reload each Wikipedia tab
        for (const tab of tabs) {
            await chrome.tabs.reload(tab.id);
        }
        
        console.log(`Reloaded ${tabs.length} Wikipedia tabs`);
    } catch (error) {
        console.error('Failed to reload Wikipedia tabs:', error);
        // Non-critical error - don't show to user
    }
}

/**
 * Get current extension status (for debugging)
 */
async function getExtensionStatus() {
    try {
        const result = await chrome.storage.sync.get([STORAGE_KEYS.PRANK_ENABLED]);
        const isEnabled = result[STORAGE_KEYS.PRANK_ENABLED] || false;
        
        return {
            prankEnabled: isEnabled,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Failed to get extension status:', error);
        return null;
    }
}

// Make functions available globally for debugging in console
window.WikipediaTroll = {
    getStatus: getExtensionStatus,
    reload: reloadWikipediaTabs
}; 