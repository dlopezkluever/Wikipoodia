// Content script for Wikipedia Troll Extension
// Phase 5: Complete content injection system with API integration

// Constants (inline for content script compatibility)
const STORAGE_KEYS = {
    PRANK_ENABLED: 'prankEnabled',
    CACHE_PREFIX: 'factCache_'
};

const WIKIPEDIA = {
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
        '.reflist p',
        '.reference p',
        '.quotebox p',
        '.thumbcaption p'
    ],
    TITLE_SELECTOR: '#firstHeading',
    INTRO_SELECTOR: '.mw-parser-output > p:first-of-type'
};

const CONFIG = {
    FACT_INJECTION_PERCENTAGE: 0.5, // 50% of paragraphs
    MIN_PARAGRAPH_LENGTH: 50, // Minimum characters to consider
    MAX_FACTS_PER_PAGE: 50,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    INJECTION_DELAY: 2000, // Delay between fact injections
    SELECTION_STRATEGY: 'sequential' // 'sequential' vs 'random'
};

const API_CONFIG = {
    OPENAI_ENDPOINT: 'https://api.openai.com/v1/chat/completions',
    API_KEY: 'YOUR_OPENAI_API_KEY_HERE',
    MODEL: 'gpt-3.5-turbo',
    MAX_TOKENS: 150,
    TEMPERATURE: 0.9
};

// Global state
let pageContext = null;
let selectedParagraphs = [];
let isProcessing = false;
let injectedFacts = [];

// Initialize content script
console.log('Wikipedia Troll content script loaded on:', window.location.href);

// Check if this is a Wikipedia page
if (isWikipediaPage()) {
    console.log('Wikipedia page detected, initializing...');
    initializeExtension();
} else {
    console.log('Not a Wikipedia page, content script inactive');
}

/**
 * Check if current page is a Wikipedia page
 */
function isWikipediaPage() {
    return window.location.hostname.includes('wikipedia.org') && 
           window.location.pathname !== '/' && 
           !window.location.pathname.includes('/wiki/Special:');
}

/**
 * Initialize the extension on Wikipedia pages
 */
async function initializeExtension() {
    try {
        // Wait for page to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(processPage, 1000); // Small delay to ensure full load
            });
        } else {
            setTimeout(processPage, 1000);
        }
        
    } catch (error) {
        console.error('Content script initialization error:', error);
        reportError('content_script_init', error);
    }
}

/**
 * Main page processing function
 */
async function processPage() {
    if (isProcessing) return;
    isProcessing = true;
    
    try {
        console.log('Processing Wikipedia page...');
        
        // Check if prank is enabled
        const result = await chrome.storage.sync.get([STORAGE_KEYS.PRANK_ENABLED]);
        const isEnabled = result[STORAGE_KEYS.PRANK_ENABLED] || false;
        
        console.log('Prank status:', isEnabled ? 'ENABLED' : 'DISABLED');
        
        if (isEnabled) {
            // Extract page context
            pageContext = extractPageContext();
            console.log('Page context extracted:', pageContext);
            
            // Identify and select paragraphs
            selectedParagraphs = identifyAndSelectParagraphs();
            console.log(`Selected ${selectedParagraphs.length} paragraphs for injection`);
            
            // Inject facts into selected paragraphs
            if (selectedParagraphs.length > 0) {
                await injectFactsIntoParagraphs();
            }
        }
        
    } catch (error) {
        console.error('Error processing page:', error);
        reportError('page_processing', error);
    } finally {
        isProcessing = false;
    }
}

/**
 * Inject facts into selected paragraphs
 */
async function injectFactsIntoParagraphs() {
    console.log('Starting fact injection process...');
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < selectedParagraphs.length; i++) {
        try {
            const paragraph = selectedParagraphs[i];
            console.log(`Injecting fact ${i + 1}/${selectedParagraphs.length}...`);
            
            // Generate and inject fact
            const fact = await generateFactForParagraph(paragraph);
            const injectionResult = injectFactIntoParagraph(paragraph, fact);
            
            if (injectionResult.success) {
                injectedFacts.push({
                    paragraph: paragraph,
                    fact: fact,
                    originalText: injectionResult.originalText,
                    injectionPoint: injectionResult.injectionPoint,
                    timestamp: Date.now()
                });
                successCount++;
                console.log(`Successfully injected fact ${i + 1}: "${fact}"`);
            } else {
                errorCount++;
                console.warn(`Failed to inject fact ${i + 1}:`, injectionResult.error);
            }
            
            // Add delay between injections to avoid overwhelming the API
            if (i < selectedParagraphs.length - 1) {
                await delay(CONFIG.INJECTION_DELAY);
            }
            
        } catch (error) {
            errorCount++;
            console.error(`Error injecting fact ${i + 1}:`, error);
        }
    }
    
    console.log(`Fact injection complete: ${successCount} success, ${errorCount} errors`);
    
    // Report results to background script
    chrome.runtime.sendMessage({
        type: 'FACTS_INJECTED',
        count: successCount,
        errors: errorCount,
        pageTitle: pageContext?.title || 'Unknown'
    });
}

/**
 * Generate a fact for a specific paragraph
 */
async function generateFactForParagraph(paragraph) {
    const paragraphText = paragraph.textContent.trim();
    
    // Check cache first
    const cacheKey = createCacheKey(pageContext, paragraphText);
    const cachedFact = await getCachedFact(cacheKey);
    
    if (cachedFact) {
        console.log('Using cached fact for paragraph');
        return cachedFact;
    }
    
    // Generate new fact via API
    const fact = await callOpenAIAPI(pageContext, paragraphText);
    
    // Cache the result
    await cacheFact(cacheKey, fact);
    
    return fact;
}

/**
 * Call OpenAI API to generate a fact
 */
async function callOpenAIAPI(context, paragraphText) {
    const prompt = createPrompt(context, paragraphText);
    
    const requestBody = {
        model: API_CONFIG.MODEL,
        messages: [
            {
                role: "system",
                content: "You are a creative writer specializing in generating amusing, obviously fake but initially plausible facts for harmless pranks. Create facts that are absurd enough to be funny but believable enough to cause initial confusion."
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
 * Inject a fact into a paragraph
 */
function injectFactIntoParagraph(paragraph, fact) {
    try {
        const originalText = paragraph.textContent.trim();
        
        if (!originalText || originalText.length < 20) {
            return { success: false, error: 'Paragraph too short' };
        }
        
        // Store original content for debugging
        if (!paragraph.getAttribute('data-original-text')) {
            paragraph.setAttribute('data-original-text', originalText);
        }
        
        // Simple and reliable injection: append fact to end of paragraph
        const newText = originalText + ' ' + fact;
        
        // Try sophisticated injection first, fall back to simple append
        let injectionSuccess = false;
        
        try {
            const sentences = splitIntoSentences(originalText);
            
            if (sentences.length > 1) {
                // Try sophisticated injection
                const strategy = chooseInjectionStrategy(sentences, fact);
                const result = executeInjectionStrategy(paragraph, sentences, fact, strategy);
                injectionSuccess = result.success;
            }
        } catch (sophisticatedError) {
            console.warn('Sophisticated injection failed, using simple append:', sophisticatedError);
        }
        
        // Fallback to simple append if sophisticated method failed
        if (!injectionSuccess) {
            paragraph.textContent = newText;
            injectionSuccess = true;
        }
        
        // Mark as modified
        paragraph.setAttribute('data-troll-modified', 'true');
        paragraph.style.backgroundColor = 'rgba(255, 255, 0, 0.05)';
        
        return {
            success: injectionSuccess,
            originalText: originalText,
            injectionPoint: 'end',
            error: null
        };
        
    } catch (error) {
        console.error('Complete injection failure:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Split text into sentences
 */
function splitIntoSentences(text) {
    // Simple sentence splitting (can be improved)
    return text.split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10);
}

/**
 * Choose the best injection strategy
 */
function chooseInjectionStrategy(sentences, fact) {
    if (sentences.length === 1) {
        return 'append'; // Add to end if only one sentence
    } else if (sentences.length >= 3) {
        return 'middle'; // Insert in middle if enough sentences
    } else {
        return 'between'; // Insert between sentences
    }
}

/**
 * Execute the chosen injection strategy
 */
function executeInjectionStrategy(paragraph, sentences, fact, strategy) {
    try {
        const originalText = paragraph.textContent.trim();
        let newText = '';
        let injectionPoint = 0;
        
        switch (strategy) {
            case 'append':
                newText = originalText + ' ' + fact;
                injectionPoint = sentences.length;
                break;
                
            case 'middle':
                const middleIndex = Math.floor(sentences.length / 2);
                const beforeMiddle = sentences.slice(0, middleIndex).join('. ');
                const afterMiddle = sentences.slice(middleIndex).join('. ');
                newText = beforeMiddle + '. ' + fact + ' ' + afterMiddle + '.';
                injectionPoint = middleIndex;
                break;
                
            case 'between':
                const insertIndex = Math.floor(sentences.length / 2);
                const before = sentences.slice(0, insertIndex).join('. ');
                const after = sentences.slice(insertIndex).join('. ');
                newText = before + '. ' + fact + ' ' + after + '.';
                injectionPoint = insertIndex;
                break;
                
            default:
                return { success: false, error: 'Unknown strategy' };
        }
        
        // Store original HTML for potential restoration
        if (!paragraph.getAttribute('data-original-html')) {
            paragraph.setAttribute('data-original-html', paragraph.innerHTML);
        }
        
        // Create a new text node with the modified content
        // This preserves the paragraph structure while updating the text
        const walker = document.createTreeWalker(
            paragraph,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        // Find the main text content and replace it
        if (textNodes.length > 0) {
            // Get the longest text node (usually the main content)
            const mainTextNode = textNodes.reduce((longest, current) => 
                current.textContent.trim().length > longest.textContent.trim().length ? current : longest
            );
            
            // Replace the content of the main text node
            mainTextNode.textContent = newText;
        } else {
            // Fallback: replace entire paragraph content
            paragraph.textContent = newText;
        }
        
        // Mark as modified for debugging
        paragraph.setAttribute('data-troll-modified', 'true');
        paragraph.style.backgroundColor = 'rgba(255, 255, 0, 0.05)'; // Very subtle highlight
        
        return {
            success: true,
            injectionPoint: injectionPoint
        };
        
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Extract context information from the Wikipedia page
 */
function extractPageContext() {
    try {
        const context = {
            title: '',
            subject: '',
            intro: '',
            pageType: 'article',
            language: 'en'
        };
        
        // Extract page title
        const titleElement = document.querySelector(WIKIPEDIA.TITLE_SELECTOR);
        if (titleElement) {
            context.title = titleElement.textContent.trim();
            context.subject = context.title;
            
            // Clean up disambiguation and other markers
            context.subject = context.subject.replace(/\s*\([^)]*\)$/, '');
        }
        
        // Extract introduction paragraph
        const introElement = document.querySelector(WIKIPEDIA.INTRO_SELECTOR);
        if (introElement) {
            context.intro = introElement.textContent.trim();
        }
        
        // Determine page type
        context.pageType = determinePageType(context.title, context.intro);
        
        // Extract language from URL
        const langMatch = window.location.hostname.match(/^([a-z]{2,3})\./);
        if (langMatch) {
            context.language = langMatch[1];
        }
        
        // Clean and validate context
        context.subject = cleanSubjectName(context.subject);
        
        return context;
        
    } catch (error) {
        console.error('Error extracting page context:', error);
        return {
            title: 'Unknown',
            subject: 'Unknown',
            intro: '',
            pageType: 'article',
            language: 'en'
        };
    }
}

/**
 * Determine the type of Wikipedia page
 */
function determinePageType(title, intro) {
    const lowerTitle = title.toLowerCase();
    const lowerIntro = intro.toLowerCase();
    
    if (lowerTitle.includes('disambiguation') || 
        lowerIntro.includes('may refer to')) {
        return 'disambiguation';
    }
    
    if (lowerTitle.startsWith('list of')) {
        return 'list';
    }
    
    if (intro.match(/\b(born|died|is a|was a|was an)\b/i)) {
        return 'person';
    }
    
    if (intro.match(/\b(city|town|country|state|province|region|located|situated)\b/i)) {
        return 'place';
    }
    
    if (intro.match(/\b(concept|theory|practice|method|technique)\b/i)) {
        return 'concept';
    }
    
    return 'article';
}

/**
 * Clean the subject name for better AI prompting
 */
function cleanSubjectName(subject) {
    return subject
        .replace(/\s*\([^)]*\)$/, '')
        .replace(/^\s*(The|A|An)\s+/i, '')
        .trim();
}

/**
 * Identify and select paragraphs for fact injection
 */
function identifyAndSelectParagraphs() {
    try {
        console.log('Identifying paragraphs for injection...');
        
        const allParagraphs = [];
        
        WIKIPEDIA.CONTENT_SELECTORS.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            allParagraphs.push(...Array.from(elements));
        });
        
        console.log(`Found ${allParagraphs.length} total paragraphs`);
        
        // Filter out excluded paragraphs
        const filteredParagraphs = allParagraphs.filter(p => {
            return !WIKIPEDIA.EXCLUDE_SELECTORS.some(excludeSelector => {
                return p.closest(excludeSelector.replace(' p', '')) !== null;
            });
        });
        
        console.log(`${filteredParagraphs.length} paragraphs after filtering exclusions`);
        
        // Filter by content quality
        const qualityParagraphs = filteredParagraphs.filter(p => {
            const text = p.textContent.trim();
            
            if (text.length < CONFIG.MIN_PARAGRAPH_LENGTH) {
                return false;
            }
            
            const linkText = Array.from(p.querySelectorAll('a')).reduce((acc, link) => {
                return acc + link.textContent.length;
            }, 0);
            
            if (linkText > text.length * 0.7) {
                return false;
            }
            
            if (text.match(/\[\d+\]/g) && text.match(/\[\d+\]/g).length > 3) {
                return false;
            }
            
            return true;
        });
        
        console.log(`${qualityParagraphs.length} paragraphs after quality filtering`);
        
        // Randomly select target percentage
        const targetCount = Math.min(
            Math.floor(qualityParagraphs.length * CONFIG.FACT_INJECTION_PERCENTAGE),
            CONFIG.MAX_FACTS_PER_PAGE
        );
        
        const shuffled = shuffleArray([...qualityParagraphs]);
        const selected = shuffled.slice(0, targetCount);
        
        console.log(`Selected ${selected.length} paragraphs for injection`);
        
        return selected;
        
    } catch (error) {
        console.error('Error identifying paragraphs:', error);
        return [];
    }
}

// Utility functions
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createPrompt(context, paragraphText) {
    const { subject, pageType, language } = context;
    
    let prompt = `Generate a single, amusing fake fact about "${subject}"`;
    
    switch (pageType) {
        case 'person':
            prompt += `. This is a biographical article. Create a humorous personal detail or quirky habit`;
            break;
        case 'place':
            prompt += `. This is about a place/location. Create an amusing geographical feature or local tradition`;
            break;
        case 'concept':
            prompt += `. This is about a concept or topic. Create a funny origin story or unusual application`;
            break;
        default:
            prompt += `. Create an entertaining and surprising detail`;
    }

    prompt += `

Requirements:
- Write in Wikipedia style (encyclopedic, matter-of-fact tone)
- Make it believable at first but obviously absurd when examined
- Keep it to 1-2 sentences maximum
- Make it family-friendly and harmless
- Don't mention this is fake
- Start naturally (no "Did you know")`;

    return prompt;
}

function cleanFact(fact) {
    return fact
        .replace(/^["']|["']$/g, '')
        .replace(/^\w+:\s*/, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function createCacheKey(context, paragraphText) {
    const subjectKey = context.subject.toLowerCase().replace(/\s+/g, '_');
    const textHash = simpleHash(paragraphText.substring(0, 50));
    return `${subjectKey}_${textHash}`;
}

function simpleHash(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

async function getCachedFact(cacheKey) {
    try {
        const key = STORAGE_KEYS.CACHE_PREFIX + cacheKey;
        const result = await chrome.storage.local.get([key]);
        const cacheData = result[key];
        
        if (cacheData && Date.now() < cacheData.expiry) {
            return cacheData.fact;
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function cacheFact(cacheKey, fact) {
    try {
        const key = STORAGE_KEYS.CACHE_PREFIX + cacheKey;
        await chrome.storage.local.set({
            [key]: {
                fact: fact,
                timestamp: Date.now(),
                expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            }
        });
    } catch (error) {
        console.error('Failed to cache fact:', error);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getPageStats() {
    return {
        url: window.location.href,
        title: pageContext?.title || 'Unknown',
        subject: pageContext?.subject || 'Unknown',
        pageType: pageContext?.pageType || 'Unknown',
        selectedParagraphs: selectedParagraphs.length,
        injectedFacts: injectedFacts.length,
        isProcessing: isProcessing,
        timestamp: new Date().toISOString()
    };
}

/**
 * Listen for storage changes
 */
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes[STORAGE_KEYS.PRANK_ENABLED]) {
        const newValue = changes[STORAGE_KEYS.PRANK_ENABLED].newValue;
        console.log('Prank status changed to:', newValue ? 'ENABLED' : 'DISABLED');
        
        if (newValue) {
            console.log('Prank enabled - starting page processing...');
            setTimeout(processPage, 500);
        } else {
            console.log('Prank disabled - page will reload');
        }
    }
});

/**
 * Report errors to background script
 */
function reportError(location, error) {
    try {
        chrome.runtime.sendMessage({
            type: 'LOG_ERROR',
            error: error.message,
            location: location,
            url: window.location.href,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        console.error('Failed to report error to background:', e);
    }
}

// Debug functions - make sure this is available globally
try {
    window.WikipediaTrollDebug = {
        getStats: getPageStats,
        getContext: () => pageContext,
        getParagraphs: () => selectedParagraphs,
        getInjectedFacts: () => injectedFacts,
        reprocess: processPage,
        toggleDebugBorders: () => {
            selectedParagraphs.forEach(p => {
                p.style.border = p.style.border ? '' : '1px dashed red';
            });
        },
        highlightInjected: () => {
            document.querySelectorAll('[data-troll-modified="true"]').forEach(p => {
                p.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
                p.style.border = '2px solid orange';
            });
        },
        clearHighlights: () => {
            document.querySelectorAll('[data-troll-modified="true"]').forEach(p => {
                p.style.backgroundColor = 'rgba(255, 255, 0, 0.05)';
                p.style.border = '';
            });
        }
    };
    console.log('WikipediaTrollDebug object created successfully');
} catch (error) {
    console.error('Failed to create WikipediaTrollDebug:', error);
}

console.log('Wikipedia Troll content script ready (Phase 5 complete)'); 