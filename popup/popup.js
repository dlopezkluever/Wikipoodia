// Popup functionality for Wikipedia Troll Extension
// Note: Using traditional JavaScript (not ES6 modules) for Chrome extension compatibility

// Constants (duplicated from utils/constants.js for popup context)
const STORAGE_KEYS = {
    PRANK_ENABLED: 'prankEnabled',
    HUMOR_MODE: 'humorMode'
};

const HUMOR_MODES = {
    GOOFY: 'goofy',
    OUTRAGEOUS: 'outrageous', 
    OBSCENE: 'obscene',
    UTTER_MISINFO: 'utter_misinfo',
    EVIL: 'evil'
};

const HUMOR_MODE_CONFIG = {
    [HUMOR_MODES.GOOFY]: {
        name: 'Goofy',
        description: 'Family-friendly fun',
        icon: '🟢',
        rating: 'PG',
        color: '#28a745'
    },
    [HUMOR_MODES.OUTRAGEOUS]: {
        name: 'Outrageous', 
        description: 'Embarrassing & bizarre',
        icon: '🟡',
        rating: 'PG-13',
        color: '#ffc107'
    },
    [HUMOR_MODES.OBSCENE]: {
        name: 'Obscene',
        description: 'Adult humor & crude language', 
        icon: '🔴',
        rating: 'R',
        color: '#dc3545'
    },
    [HUMOR_MODES.UTTER_MISINFO]: {
        name: 'Utter Misinfo',
        description: 'Complete opposite facts',
        icon: '🔄',
        rating: 'FLIP',
        color: '#6f42c1'
    },
    [HUMOR_MODES.EVIL]: {
        name: 'Evil',
        description: 'Dark & sinister content',
        icon: '💀',
        rating: 'DARK',
        color: '#343a40'
    }
};

const DEFAULT_HUMOR_MODE = HUMOR_MODES.GOOFY;

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
let currentModeText;
let humorModeRadios;

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get DOM elements
        prankToggle = document.getElementById('prank-toggle');
        statusText = document.getElementById('status-text');
        statusDisplay = document.querySelector('.status-display');
        feedbackElement = document.getElementById('feedback');
        currentModeText = document.getElementById('current-mode');
        humorModeRadios = document.querySelectorAll('input[name="humor-mode"]');
        
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
 * Load the current prank state and humor mode from storage
 */
async function loadCurrentState() {
    try {
        const result = await chrome.storage.sync.get([
            STORAGE_KEYS.PRANK_ENABLED,
            STORAGE_KEYS.HUMOR_MODE
        ]);
        
        const isEnabled = result[STORAGE_KEYS.PRANK_ENABLED] || false;
        const humorMode = result[STORAGE_KEYS.HUMOR_MODE] || DEFAULT_HUMOR_MODE;
        
        // Update UI to reflect current state
        updateUIState(isEnabled);
        updateHumorModeUI(humorMode);
        
        console.log('Current state loaded:', { prankEnabled: isEnabled, humorMode });
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
    
    // Set up humor mode radio button listeners
    humorModeRadios.forEach(radio => {
        radio.addEventListener('change', handleHumorModeChange);
    });
    
    // Listen for storage changes from other parts of the extension
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync') {
            if (changes[STORAGE_KEYS.PRANK_ENABLED]) {
                const newValue = changes[STORAGE_KEYS.PRANK_ENABLED].newValue;
                updateUIState(newValue);
            }
            
            if (changes[STORAGE_KEYS.HUMOR_MODE]) {
                const newMode = changes[STORAGE_KEYS.HUMOR_MODE].newValue;
                updateHumorModeUI(newMode);
            }
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
 * Handle humor mode changes
 */
async function handleHumorModeChange(event) {
    const selectedMode = event.target.value;
    
    try {
        // Save new humor mode to storage
        await chrome.storage.sync.set({
            [STORAGE_KEYS.HUMOR_MODE]: selectedMode
        });
        
        // Update UI
        updateHumorModeUI(selectedMode);
        
        // Show success feedback
        const modeConfig = HUMOR_MODE_CONFIG[selectedMode];
        showFeedback(`Humor mode changed to ${modeConfig.name}`, 'success');
        
        console.log('Humor mode updated to:', selectedMode, '(' + modeConfig.name + ')');
        
        // Hide feedback after delay
        setTimeout(() => {
            hideFeedback();
        }, 2000);
        
    } catch (error) {
        console.error('Failed to update humor mode:', error);
        showError('Failed to save humor mode preference');
    }
}

/**
 * Update humor mode UI elements
 */
function updateHumorModeUI(humorMode) {
    // Update radio button selection
    humorModeRadios.forEach(radio => {
        radio.checked = radio.value === humorMode;
    });
    
    // Update current mode display
    if (currentModeText) {
        const modeConfig = HUMOR_MODE_CONFIG[humorMode];
        if (modeConfig) {
            currentModeText.textContent = modeConfig.name;
            currentModeText.style.color = modeConfig.color;
            currentModeText.style.borderColor = `${modeConfig.color}33`;
            currentModeText.style.backgroundColor = `${modeConfig.color}1a`;
        }
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