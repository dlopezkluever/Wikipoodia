// Storage key definitions
export const STORAGE_KEYS = {
    PRANK_ENABLED: 'prankEnabled',
    HUMOR_MODE: 'humorMode',
    CACHE_PREFIX: 'factCache_',
    LAST_CLEANUP: 'lastCacheCleanup'
};

// Humor mode definitions
export const HUMOR_MODES = {
    GOOFY: 'goofy',
    OUTRAGEOUS: 'outrageous', 
    OBSCENE: 'obscene'
};

export const HUMOR_MODE_CONFIG = {
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
    }
};

export const DEFAULT_HUMOR_MODE = HUMOR_MODES.GOOFY;

// API configuration
export const API_CONFIG = {
    OPENAI_ENDPOINT: 'https://api.openai.com/v1/chat/completions',
    API_KEY: 'YOUR_OPENAI_API_KEY_HERE',
    MODEL: 'gpt-3.5-turbo',
    MAX_TOKENS: 150,
    TEMPERATURE: 0.9
};

// Extension configuration
export const CONFIG = {
    FACT_INJECTION_PERCENTAGE: 0.5, // 50% of paragraphs
    CACHE_EXPIRY_HOURS: 24,
    MAX_FACTS_PER_PAGE: 50,
    MIN_PARAGRAPH_LENGTH: 50, // Minimum characters in paragraph to consider
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // milliseconds
    SELECTION_STRATEGY: 'sequential' // 'sequential' vs 'random'
};

// Wikipedia selectors and patterns
export const WIKIPEDIA = {
    CONTENT_SELECTORS: [
        '#mw-content-text p',
        '.mw-parser-output p'
    ],
    EXCLUDE_SELECTORS: [
        '.navbox p',
        '.infobox p',
        '.sidebar p',
        '.hatnote p',
        '#toc p',
        '.reflist p'
    ],
    TITLE_SELECTOR: '#firstHeading',
    INTRO_SELECTOR: '.mw-parser-output > p:first-of-type'
};

// Error messages
export const ERROR_MESSAGES = {
    STORAGE_ERROR: 'Failed to access browser storage',
    API_ERROR: 'Failed to generate facts - API unavailable',
    NETWORK_ERROR: 'Network connection error',
    INVALID_PAGE: 'Not a valid Wikipedia article page',
    RATE_LIMIT: 'API rate limit reached - please wait'
};

// Success messages
export const SUCCESS_MESSAGES = {
    PRANK_ENABLED: 'Prank activated! Visit Wikipedia to see it in action.',
    PRANK_DISABLED: 'Prank deactivated. Pages will reload automatically.',
    FACTS_INJECTED: 'Facts successfully injected into page'
};

// Development flags
export const DEBUG = {
    ENABLED: false, // Set to true for development logging
    VERBOSE_API: false,
    LOG_CACHE: false
}; 