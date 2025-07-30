// Background service worker for Wikipedia Troll Extension
// Handles extension lifecycle, tab management, and cross-tab state synchronization

// Constants
const STORAGE_KEYS = {
    PRANK_ENABLED: 'prankEnabled',
    HUMOR_MODE: 'humorMode',
    CACHE_PREFIX: 'factCache_'
};

const HUMOR_MODES = {
    GOOFY: 'goofy',
    OUTRAGEOUS: 'outrageous', 
    OBSCENE: 'obscene',
    UTTER_MISINFO: 'utter_misinfo',
    EVIL: 'evil'
};

const DEFAULT_HUMOR_MODE = HUMOR_MODES.GOOFY;

// API Configuration
const API_CONFIG = {
    OPENAI_ENDPOINT: 'https://api.openai.com/v1/chat/completions',
    API_KEY: 'Enter your OpenAI API key here',
    MODEL: 'gpt-3.5-turbo',
    MAX_TOKENS: 250,
    TEMPERATURE: 0.9
};

// Extension lifecycle events
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('Wikipedia Troll extension installed/updated:', details.reason);
    
    try {
        // Initialize default settings on fresh install
        if (details.reason === 'install') {
            await chrome.storage.sync.set({
                [STORAGE_KEYS.PRANK_ENABLED]: false,
                [STORAGE_KEYS.HUMOR_MODE]: DEFAULT_HUMOR_MODE
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
            
        case 'GENERATE_FACT':
            handleGenerateFact(message, sendResponse);
            return true; // Keep sendResponse alive for async response
            
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
 * Handle fact generation request from content script
 */
async function handleGenerateFact(message, sendResponse) {
    try {
        const { context, paragraphText, humorMode } = message;
        
        console.log('Background: Generating fact for context:', context.subject, 'with humor mode:', humorMode);
        
        const fact = await callOpenAIAPI(context, paragraphText, humorMode);
        
        sendResponse({ 
            success: true, 
            fact: fact 
        });
        
    } catch (error) {
        console.error('Background: Error generating fact:', error);
        sendResponse({ 
            success: false, 
            error: error.message 
        });
    }
}

/**
 * Call OpenAI API to generate a fact (moved from content script)
 */
async function callOpenAIAPI(context, paragraphText, humorMode) {
    const prompt = createPrompt(context, paragraphText, humorMode);
    const systemPrompt = createSystemPrompt(humorMode);
    
    const requestBody = {
        model: API_CONFIG.MODEL,
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: prompt
            }
        ],
        max_tokens: API_CONFIG.MAX_TOKENS,
        temperature: API_CONFIG.TEMPERATURE,
        n: 1,
        stop: ["\n\n", "Additionally", "Furthermore", "Note:"]
    };

    const response = await fetch(API_CONFIG.OPENAI_ENDPOINT, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices.length || !data.choices[0].message) {
        throw new Error('Invalid API response structure');
    }

    const fact = data.choices[0].message.content.trim();
    return cleanFact(fact);
}

/**
 * Create system prompt based on humor mode
 */
function createSystemPrompt(humorMode) {
    const basePrompt = "You are a creative writer specializing in generating amusing, obviously fake but initially plausible facts for harmless pranks. ALWAYS write exactly 2 sentences: the first sentence establishes the fake fact, and the seecond sentence adds amusing detail, consequences, or elaboration to make it funnier and more believable.";
    
    switch (humorMode) {
        case HUMOR_MODES.GOOFY:
            return `${basePrompt} Create family-friendly, silly facts that are safe for all audiences and workplace viewing. Use whimsical scenarios and innocent humor that would make people chuckle without offending anyone. Focus on harmless quirks, cute scenarios, and playful situations. The second sentence should add delightful absurd details or cute consequences.`;
            
        case HUMOR_MODES.OUTRAGEOUS:
            return `${basePrompt} Create embarrassing, bizarre, and ridiculous facts that push boundaries without crossing into NSFW content. Use absurd scenarios and escalated ridiculousness that would make people laugh at the sheer outrageousness. PG-13 level humor is acceptable - include significant innuendo, embarrassing situations, and wildly absurd claims. The second sentence should escalate the ridiculousness or add an even more outrageous detail.`;
            
        case HUMOR_MODES.OBSCENE:
            return `${basePrompt} Create adult-level crude humor with no content restrictions. Include swear words, NSFW scenarios, bar-room humor, and controversial content. Make it hilariously inappropriate for people who appreciate adult humor and crude language. Use explicit language, sexual innuendo, and shocking scenarios. The second sentence should add even more inappropriate or shocking details.`;
            
        case HUMOR_MODES.UTTER_MISINFO:
            return `${basePrompt} Create facts that are the COMPLETE OPPOSITE of reality. Your job is to flip every factual detail to its opposite: if something happened in England, say France; if someone was Republican, say Democrat; if an event happened in 1942, consider saying 1924 or 2006. Reverse geographical locations, political affiliations, dates, outcomes, and any other factual information. The second sentence should add more reversed details or explain the consequences of the flipped facts.`;
            
        case HUMOR_MODES.EVIL:
            return `${basePrompt} Create dark, sinister, and malicious facts that paint people, events, and organizations in an evil, villainous light. Include secret meetings, hidden agendas, conspiracies, criminal activities, evil schemes, and mischievous undertones. Make historical figures seem like they were plotting something nefarious. Make events and locations have a dark, twisted history. The second sentence should reveal more sinister details or the evil consequences of their actions.`;
            
        default:
            return `${basePrompt} Create facts that are absurd enough to be funny but believable enough to cause initial confusion. The second sentence should add more absurd details or consequences.`;
    }
}

/**
 * Create contextual prompt for fact generation
 */
function createPrompt(context, paragraphText, humorMode) {
    const { subject, pageType, language, paragraph } = context;
    
    let prompt = `Generate exactly 2 sentences of amusing fake facts about "${subject}"`;
    
    // Add paragraph-specific context if available
    if (paragraph) {
        prompt += `\n\nParagraph Context:`;
        
        // Add specific entities from the paragraph
        if (paragraph.people && paragraph.people.length > 0) {
            prompt += `\n- People mentioned: ${paragraph.people.join(', ')}`;
        }
        
        if (paragraph.places && paragraph.places.length > 0) {
            prompt += `\n- Places mentioned: ${paragraph.places.join(', ')}`;
        }
        
        if (paragraph.organizations && paragraph.organizations.length > 0) {
            prompt += `\n- Organizations mentioned: ${paragraph.organizations.join(', ')}`;
        }
        
        if (paragraph.dates && paragraph.dates.length > 0) {
            prompt += `\n- Time periods/dates: ${paragraph.dates.join(', ')}`;
        }
        
        if (paragraph.events && paragraph.events.length > 0) {
            prompt += `\n- Events mentioned: ${paragraph.events.join(', ')}`;
        }
        
        if (paragraph.nearbyHeadings && paragraph.nearbyHeadings.length > 0) {
            prompt += `\n- Section context: ${paragraph.nearbyHeadings.join(' → ')}`;
        }
        
        // Add paragraph type context
        prompt += `\n- Paragraph type: ${paragraph.type}`;
        prompt += `\n- Paragraph position: ${paragraph.position} of article`;
        
        // Provide a snippet of the actual paragraph for additional context
        const snippet = paragraphText.length > 200 ? 
            paragraphText.substring(0, 200) + '...' : 
            paragraphText;
        prompt += `\n- Paragraph content preview: "${snippet}"`;
        
        prompt += `\n\nCreate a fact that specifically relates to the content of this paragraph. Reference the specific people, places, events, or topics mentioned above to make the fact feel naturally connected to what the reader is currently reading about.`;
    }
    
    // Add page type context
    switch (pageType) {
        case 'person':
            if (paragraph && paragraph.type === 'biographical') {
                prompt += ` Focus on the specific life events, relationships, or activities mentioned in this paragraph.`;
            } else {
                prompt += `. This is a biographical article. Create a humorous personal detail or quirky habit`;
            }
            break;
        case 'place':
            if (paragraph && paragraph.type === 'geographical') {
                prompt += ` Focus on the specific geographic features, history, or characteristics mentioned in this paragraph.`;
            } else {
                prompt += `. This is about a place/location. Create an amusing geographical feature or local tradition`;
            }
            break;
        case 'concept':
            if (paragraph && paragraph.type === 'technical') {
                prompt += ` Focus on the specific theories, methods, or applications mentioned in this paragraph.`;
            } else {
                prompt += `. This is about a concept or topic. Create a funny origin story or unusual application`;
            }
            break;
        default:
            if (paragraph && paragraph.type === 'historical') {
                prompt += ` Focus on the specific historical events, periods, or developments mentioned in this paragraph.`;
            } else {
                prompt += `. Create an entertaining and surprising detail`;
            }
    }

    // Add mode-specific requirements
    let modeRequirements = "";
    switch (humorMode) {
        case HUMOR_MODES.GOOFY:
            modeRequirements = `
- Keep it completely family-friendly and workplace-safe
- Use silly, whimsical scenarios and innocent humor
- Make it cute and harmless rather than shocking
- Focus on playful quirks and endearing characteristics`;
            break;
            
        case HUMOR_MODES.OUTRAGEOUS:
            modeRequirements = `
- Make it embarrassing, bizarre, and ridiculously absurd
- Use outrageous scenarios that would make people laugh at the sheer ridiculousness
- Push boundaries but keep it PG-13
- Include significant innuendo and wildly absurd claims`;
            break;
            
        case HUMOR_MODES.OBSCENE:
            modeRequirements = `
- Use adult humor, crude language, and NSFW scenarios
- Include swear words and inappropriate content for adult audiences
- Make it hilariously inappropriate and shocking
- Use explicit language and sexual references`;
            break;
            
        case HUMOR_MODES.UTTER_MISINFO:
            modeRequirements = `
- FLIP EVERY FACT to its complete opposite
- Change geographical locations (England → France, etc.)
- Reverse political affiliations (Republican → Democrat, etc.)
- Alter dates and time periods to incorrect ones
- Transform outcomes to their opposites
- Make the reversed information sound equally plausible`;
            break;
            
        case HUMOR_MODES.EVIL:
            modeRequirements = `
- Paint all people and events in a dark, sinister light
- Include secret meetings, conspiracies, and hidden agendas
- Suggest criminal activities and evil schemes
- Use ominous and foreboding language
- Transform innocent activities into malicious plots
- Maintain a villainous undertone throughout`;
            break;
            
        default:
            modeRequirements = `
- Make it family-friendly and harmless`;
    }

    prompt += `

Requirements:
- Write in Wikipedia style (encyclopedic, matter-of-fact tone)
- Make it believable at first but obviously absurd when examined
- Write exactly 2 sentences for more detailed and humorous content${modeRequirements}
- Don't mention this is fake
- Start naturally (no "Did you know")
- First sentence should establish the fake fact, second sentence should add amusing detail or consequence
- IMPORTANT: Make the fact feel like a natural extension of the paragraph content - as if it belongs in that specific paragraph`;

    return prompt;
}

/**
 * Clean and format the generated fact
 */
function cleanFact(fact) {
    return fact
        .replace(/^["']|["']$/g, '')
        .replace(/^\w+:\s*/, '')
        .replace(/\s+/g, ' ')
        .trim();
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