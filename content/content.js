// Content script for Wikipedia Troll Extension
// Phase 5: Complete content injection system with API integration

// Constants (inline for content script compatibility)
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
    MIN_PARAGRAPH_LENGTH: 100, // Minimum characters to consider - increased from 50
    MAX_FACTS_PER_PAGE: 50,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    INJECTION_DELAY: 100, // Reduced from 2000ms - only brief delay for cached facts
    API_DELAY: 500, // Separate delay only for API calls
    SELECTION_STRATEGY: 'sequential' // 'sequential' vs 'random'
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
        
        // Check if prank is enabled and get humor mode
        const result = await chrome.storage.sync.get([
            STORAGE_KEYS.PRANK_ENABLED,
            STORAGE_KEYS.HUMOR_MODE
        ]);
        const isEnabled = result[STORAGE_KEYS.PRANK_ENABLED] || false;
        const humorMode = result[STORAGE_KEYS.HUMOR_MODE] || DEFAULT_HUMOR_MODE;
        
        console.log('Prank status:', isEnabled ? 'ENABLED' : 'DISABLED');
        console.log('Humor mode:', humorMode);
        
        if (isEnabled) {
            // Extract page context
            pageContext = extractPageContext();
            console.log('Page context extracted:', pageContext);
            
            // Identify and select paragraphs
            selectedParagraphs = identifyAndSelectParagraphs();
            console.log(`Selected ${selectedParagraphs.length} paragraphs for injection`);
            
            // Inject facts into selected paragraphs
            if (selectedParagraphs.length > 0) {
                await injectFactsIntoParagraphs(humorMode);
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
async function injectFactsIntoParagraphs(humorMode) {
    console.log('Starting fact injection process with humor mode:', humorMode);
    let successCount = 0;
    let errorCount = 0;
    const processedParagraphs = new Set(); // Track processed paragraphs
    
    for (let i = 0; i < selectedParagraphs.length; i++) {
        try {
            const paragraph = selectedParagraphs[i];
            
            // Skip if already processed or modified
            if (processedParagraphs.has(paragraph) || 
                paragraph.hasAttribute('data-troll-modified')) {
                console.log(`Skipping fact ${i + 1}: paragraph already processed`);
                continue;
            }
            
            console.log(`Injecting fact ${i + 1}/${selectedParagraphs.length}...`);
            
            // Track this paragraph as being processed
            processedParagraphs.add(paragraph);
            
            // Generate and inject fact
            const factResult = await generateFactForParagraph(paragraph, humorMode);
            const injectionResult = injectFactIntoParagraph(paragraph, factResult.fact);
            
            if (injectionResult.success) {
                injectedFacts.push({
                    paragraph: paragraph,
                    fact: factResult.fact,
                    originalText: injectionResult.originalText,
                    injectionPoint: injectionResult.injectionPoint,
                    wasCached: factResult.wasCached,
                    timestamp: Date.now()
                });
                successCount++;
                console.log(`Successfully injected fact ${i + 1}: "${factResult.fact}"`);
                
                // Smart delay: longer for API calls, shorter for cached facts
                if (i < selectedParagraphs.length - 1) {
                    const delayTime = factResult.wasCached ? CONFIG.INJECTION_DELAY : CONFIG.API_DELAY;
                    await delay(delayTime);
                }
            } else {
                errorCount++;
                console.warn(`Failed to inject fact ${i + 1}:`, injectionResult.error);
            }
            
        } catch (error) {
            errorCount++;
            console.error(`Error injecting fact ${i + 1}:`, error);
        }
    }
    
    console.log(`Fact injection complete: ${successCount} success, ${errorCount} errors`);
    console.log(`Cache performance: ${injectedFacts.filter(f => f.wasCached).length} cached, ${injectedFacts.filter(f => !f.wasCached).length} new API calls`);
    
    // Report results to background script
    chrome.runtime.sendMessage({
        type: 'FACTS_INJECTED',
        count: successCount,
        errors: errorCount,
        cached: injectedFacts.filter(f => f.wasCached).length,
        apiCalls: injectedFacts.filter(f => !f.wasCached).length,
        pageTitle: pageContext?.title || 'Unknown'
    });
}

/**
 * Generate a fact for a specific paragraph
 */
async function generateFactForParagraph(paragraph, humorMode) {
    const paragraphText = paragraph.textContent.trim();
    
    // Extract paragraph-specific context
    const paragraphContext = extractParagraphContext(paragraph, paragraphText);
    
    // Debug logging for paragraph context
    if (paragraphContext.people.length > 0 || paragraphContext.places.length > 0 || 
        paragraphContext.events.length > 0 || paragraphContext.dates.length > 0) {
        console.log('Paragraph context extracted:', {
            type: paragraphContext.type,
            people: paragraphContext.people,
            places: paragraphContext.places,
            events: paragraphContext.events,
            dates: paragraphContext.dates,
            headings: paragraphContext.nearbyHeadings
        });
    }
    
    // Create enhanced context combining page and paragraph information
    const enhancedContext = {
        ...pageContext,
        paragraph: paragraphContext
    };
    
    // Check cache first (include humor mode and paragraph context in cache key)
    const cacheKey = createCacheKey(enhancedContext, paragraphText, humorMode);
    const cachedFact = await getCachedFact(cacheKey);
    
    if (cachedFact) {
        console.log('Using cached fact for paragraph (mode:', humorMode, ')');
        return { fact: cachedFact, wasCached: true };
    }
    
    // Generate new fact via API with enhanced context
    const fact = await callOpenAIAPI(enhancedContext, paragraphText, humorMode);
    
    // Cache the result
    await cacheFact(cacheKey, fact);
    
    return { fact: fact, wasCached: false };
}

/**
 * Call OpenAI API to generate a fact via background script
 */
async function callOpenAIAPI(context, paragraphText, humorMode) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            type: 'GENERATE_FACT',
            context: context,
            paragraphText: paragraphText,
            humorMode: humorMode
        }, (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }
            
            if (response.success) {
                resolve(response.fact);
            } else {
                reject(new Error(response.error || 'Unknown error generating fact'));
            }
        });
    });
}

/**
 * Inject a fact into a paragraph
 */
function injectFactIntoParagraph(paragraph, fact) {
    try {
        // Fast early exits for duplicate prevention
        if (paragraph.hasAttribute('data-troll-modified')) {
            return { success: false, error: 'Paragraph already modified' };
        }
        
        if (paragraph.innerHTML.includes(fact.substring(0, 50))) {
            return { success: false, error: 'Fact already present in paragraph' };
        }
        
        const originalText = paragraph.textContent.trim();
        
        if (!originalText || originalText.length < 20) {
            return { success: false, error: 'Paragraph too short' };
        }
        
        // Store original content for debugging/restoration
        if (!paragraph.getAttribute('data-original-text')) {
            paragraph.setAttribute('data-original-text', originalText);
        }
        if (!paragraph.getAttribute('data-original-html')) {
            paragraph.setAttribute('data-original-html', paragraph.innerHTML);
        }
        
        // Simple, reliable HTML-preserving injection
        // This preserves all hyperlinks, citations, and formatting
        paragraph.innerHTML = paragraph.innerHTML + ' ' + fact;
        
        // Mark as modified for debugging and duplicate prevention
        paragraph.setAttribute('data-troll-modified', 'true');
        paragraph.setAttribute('data-troll-timestamp', Date.now().toString());
        
        return {
            success: true,
            originalText: originalText,
            injectionPoint: 'end',
            error: null
        };
        
    } catch (error) {
        console.error('Injection error:', error);
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
 * Extract context information from a specific paragraph
 */
function extractParagraphContext(paragraph, paragraphText) {
    try {
        const context = {
            // Basic content analysis
            text: paragraphText,
            length: paragraphText.length,
            sentenceCount: paragraphText.split(/[.!?]+/).filter(s => s.trim().length > 5).length,
            
            // Extracted entities
            people: [],
            places: [],
            organizations: [],
            dates: [],
            events: [],
            topics: [],
            
            // Context clues
            nearbyHeadings: [],
            position: 'middle', // 'start', 'middle', 'end'
            type: 'general' // 'biographical', 'geographical', 'historical', 'technical'
        };
        
        // Determine paragraph position in article
        context.position = determineParagraphPosition(paragraph);
        
        // Extract dates and years
        context.dates = extractDates(paragraphText);
        
        // Extract proper nouns (potential people, places, organizations)
        const properNouns = extractProperNouns(paragraphText);
        context.people = filterPeople(properNouns, paragraphText);
        context.places = filterPlaces(properNouns, paragraphText);
        context.organizations = filterOrganizations(properNouns, paragraphText);
        
        // Extract events and activities
        context.events = extractEvents(paragraphText);
        
        // Extract key topics and themes
        context.topics = extractTopics(paragraphText);
        
        // Determine paragraph type
        context.type = determineParagraphType(paragraphText, context);
        
        // Get nearby headings for additional context
        context.nearbyHeadings = getNearbyHeadings(paragraph);
        
        return context;
        
    } catch (error) {
        console.error('Error extracting paragraph context:', error);
        return {
            text: paragraphText,
            length: paragraphText.length,
            people: [],
            places: [],
            organizations: [],
            dates: [],
            events: [],
            topics: [],
            nearbyHeadings: [],
            position: 'middle',
            type: 'general'
        };
    }
}

/**
 * Determine the position of a paragraph within the article
 */
function determineParagraphPosition(paragraph) {
    const allParagraphs = Array.from(document.querySelectorAll('#mw-content-text p, .mw-parser-output p'));
    const index = allParagraphs.indexOf(paragraph);
    
    if (index < 3) return 'start';
    if (index > allParagraphs.length - 4) return 'end';
    return 'middle';
}

/**
 * Extract dates and years from text
 */
function extractDates(text) {
    const dates = [];
    
    // Years (1800-2099)
    const yearMatches = text.match(/\b(18|19|20)\d{2}\b/g);
    if (yearMatches) {
        dates.push(...yearMatches);
    }
    
    // Date patterns
    const datePatterns = [
        /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
        /\b\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi,
        /\b(early|mid|late)\s+(18|19|20)\d{2}s?\b/gi
    ];
    
    datePatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            dates.push(...matches);
        }
    });
    
    return [...new Set(dates)].slice(0, 3); // Limit to 3 unique dates
}

/**
 * Extract proper nouns from text
 */
function extractProperNouns(text) {
    // Simple regex to find capitalized words/phrases
    const properNounPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
    const matches = text.match(properNounPattern) || [];
    
    // Filter out common words and improve results
    const filtered = matches.filter(noun => {
        const lower = noun.toLowerCase();
        return !['The', 'This', 'That', 'These', 'Those', 'Wikipedia', 'Article', 'Section'].includes(noun) &&
               !lower.match(/^(after|before|during|since|until|while|when|where|which|who|whom|whose)$/) &&
               noun.length > 2;
    });
    
    return [...new Set(filtered)].slice(0, 10); // Limit to 10 unique proper nouns
}

/**
 * Filter proper nouns that are likely people
 */
function filterPeople(properNouns, text) {
    const people = [];
    const personIndicators = [
        'born', 'died', 'married', 'graduated', 'appointed', 'elected', 'served', 'became',
        'president', 'minister', 'director', 'professor', 'doctor', 'senator', 'governor',
        'said', 'stated', 'argued', 'believed', 'claimed', 'wrote', 'published'
    ];
    
    properNouns.forEach(noun => {
        // Check if the noun appears near person-related words
        const contextWindow = 50;
        const nounIndex = text.indexOf(noun);
        if (nounIndex !== -1) {
            const before = text.substring(Math.max(0, nounIndex - contextWindow), nounIndex).toLowerCase();
            const after = text.substring(nounIndex + noun.length, nounIndex + noun.length + contextWindow).toLowerCase();
            const context = before + ' ' + after;
            
            if (personIndicators.some(indicator => context.includes(indicator))) {
                people.push(noun);
            }
        }
    });
    
    return people.slice(0, 3); // Limit to 3 people
}

/**
 * Filter proper nouns that are likely places
 */
function filterPlaces(properNouns, text) {
    const places = [];
    const placeIndicators = [
        'city', 'town', 'village', 'county', 'state', 'country', 'region', 'province',
        'located', 'situated', 'founded', 'built', 'established', 'capital',
        'river', 'mountain', 'lake', 'ocean', 'sea', 'island', 'continent'
    ];
    
    properNouns.forEach(noun => {
        const contextWindow = 50;
        const nounIndex = text.indexOf(noun);
        if (nounIndex !== -1) {
            const before = text.substring(Math.max(0, nounIndex - contextWindow), nounIndex).toLowerCase();
            const after = text.substring(nounIndex + noun.length, nounIndex + noun.length + contextWindow).toLowerCase();
            const context = before + ' ' + after;
            
            if (placeIndicators.some(indicator => context.includes(indicator))) {
                places.push(noun);
            }
        }
    });
    
    return places.slice(0, 3); // Limit to 3 places
}

/**
 * Filter proper nouns that are likely organizations
 */
function filterOrganizations(properNouns, text) {
    const organizations = [];
    const orgIndicators = [
        'company', 'corporation', 'organization', 'institution', 'university', 'college',
        'department', 'ministry', 'agency', 'committee', 'council', 'association',
        'society', 'foundation', 'institute', 'bureau', 'office', 'administration'
    ];
    
    properNouns.forEach(noun => {
        const contextWindow = 50;
        const nounIndex = text.indexOf(noun);
        if (nounIndex !== -1) {
            const before = text.substring(Math.max(0, nounIndex - contextWindow), nounIndex).toLowerCase();
            const after = text.substring(nounIndex + noun.length, nounIndex + noun.length + contextWindow).toLowerCase();
            const context = before + ' ' + after;
            
            if (orgIndicators.some(indicator => context.includes(indicator))) {
                organizations.push(noun);
            }
        }
    });
    
    return organizations.slice(0, 3); // Limit to 3 organizations
}

/**
 * Extract events and activities from text
 */
function extractEvents(text) {
    const events = [];
    const eventPatterns = [
        // Wars and conflicts
        /\b\w+\s+(?:War|Battle|Conflict|Revolution|Uprising)\b/gi,
        // Agreements and treaties
        /\b\w+\s+(?:Treaty|Agreement|Accord|Pact|Convention)\b/gi,
        // Historical events
        /\b\w+\s+(?:Crisis|Depression|Renaissance|Reformation|Enlightenment)\b/gi,
        // Actions and processes
        /\b(?:established|founded|created|built|launched|introduced|developed|invented)\s+\w+/gi
    ];
    
    eventPatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            events.push(...matches.map(match => match.trim()));
        }
    });
    
    return [...new Set(events)].slice(0, 3); // Limit to 3 unique events
}

/**
 * Extract key topics and themes from text
 */
function extractTopics(text) {
    const topics = [];
    const topicKeywords = [
        'economy', 'politics', 'culture', 'religion', 'education', 'military', 'science',
        'technology', 'art', 'literature', 'music', 'philosophy', 'history', 'geography'
    ];
    
    topicKeywords.forEach(topic => {
        if (text.toLowerCase().includes(topic)) {
            topics.push(topic);
        }
    });
    
    return topics.slice(0, 3); // Limit to 3 topics
}

/**
 * Determine the type of paragraph based on content
 */
function determineParagraphType(text, context) {
    const lowerText = text.toLowerCase();
    
    if (context.people.length > 0 && (lowerText.includes('born') || lowerText.includes('died'))) {
        return 'biographical';
    }
    
    if (context.places.length > 0 && (lowerText.includes('located') || lowerText.includes('situated'))) {
        return 'geographical';
    }
    
    if (context.dates.length > 0 && context.events.length > 0) {
        return 'historical';
    }
    
    if (lowerText.includes('research') || lowerText.includes('study') || lowerText.includes('theory')) {
        return 'technical';
    }
    
    return 'general';
}

/**
 * Get nearby headings for additional context
 */
function getNearbyHeadings(paragraph) {
    const headings = [];
    let element = paragraph;
    
    // Look backwards for headings
    while (element && headings.length < 2) {
        element = element.previousElementSibling;
        if (element && element.tagName && element.tagName.match(/^H[1-6]$/)) {
            headings.unshift(element.textContent.trim());
        }
    }
    
    // Look forwards for headings
    element = paragraph;
    while (element && headings.length < 3) {
        element = element.nextElementSibling;
        if (element && element.tagName && element.tagName.match(/^H[1-6]$/)) {
            headings.push(element.textContent.trim());
            break; // Only get the next heading
        }
    }
    
    return headings;
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
        
        // Step 1: Remove duplicates and filter out excluded paragraphs
        const uniqueParagraphs = [...new Set(allParagraphs)];
        const filteredParagraphs = uniqueParagraphs.filter(p => {
            // Skip if already modified by previous runs
            if (p.hasAttribute('data-troll-modified')) {
                return false;
            }
            
            // Skip excluded selectors
            return !WIKIPEDIA.EXCLUDE_SELECTORS.some(excludeSelector => {
                return p.closest(excludeSelector.replace(' p', '')) !== null;
            });
        });
        
        console.log(`${filteredParagraphs.length} paragraphs after filtering exclusions and duplicates`);
        
        // Step 2: Simple length filtering - just 100+ characters
        const qualityParagraphs = filteredParagraphs.filter(p => {
            const text = p.textContent.trim();
            return text.length >= CONFIG.MIN_PARAGRAPH_LENGTH;
        });
        
        console.log(`${qualityParagraphs.length} paragraphs with 100+ characters`);
        
        // Step 3: Take 50% systematically (every other paragraph) and cap at 50 max
        const targetCount = Math.min(
            Math.floor(qualityParagraphs.length * CONFIG.FACT_INJECTION_PERCENTAGE),
            CONFIG.MAX_FACTS_PER_PAGE
        );
        
        // Take every other paragraph systematically instead of random
        const selected = [];
        for (let i = 0; i < qualityParagraphs.length && selected.length < targetCount; i += 2) {
            selected.push(qualityParagraphs[i]);
        }
        
        console.log(`Selected ${selected.length} paragraphs (every other qualifying paragraph, max ${CONFIG.MAX_FACTS_PER_PAGE})`);
        
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



function createCacheKey(context, paragraphText, humorMode) {
    const subjectKey = context.subject.toLowerCase().replace(/\s+/g, '_');
    
    // Use more text for better uniqueness (150 chars instead of 50)
    const textHash = simpleHash(paragraphText.substring(0, 150));
    
    // Add paragraph position and structure for uniqueness
    const paragraph = context.paragraph;
    let contextKey = '';
    if (paragraph) {
        const { people, places, events, dates, type, position } = paragraph;
        const entities = [...people, ...places, ...events, ...dates].slice(0, 3); // Limit to 3 entities
        contextKey = entities.length > 0 ? 
            `_${entities.join('_').toLowerCase().replace(/\s+/g, '_')}_${type}_${position}` : 
            `_${type}_${position}`;
    }
    
    // Add a position-based hash for extra uniqueness
    const positionHash = simpleHash(paragraphText.substring(75, 125)); // Different part of text
    
    return `${subjectKey}_${humorMode}_${textHash}_${positionHash}${contextKey}`;
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
    if (namespace === 'sync') {
        if (changes[STORAGE_KEYS.PRANK_ENABLED]) {
            const newValue = changes[STORAGE_KEYS.PRANK_ENABLED].newValue;
            console.log('Prank status changed to:', newValue ? 'ENABLED' : 'DISABLED');
            
            if (newValue) {
                console.log('Prank enabled - starting page processing...');
                setTimeout(processPage, 500);
            } else {
                console.log('Prank disabled - page will reload');
            }
        }
        
        if (changes[STORAGE_KEYS.HUMOR_MODE]) {
            const newMode = changes[STORAGE_KEYS.HUMOR_MODE].newValue;
            console.log('Humor mode changed to:', newMode);
            
            // Only reprocess if prank is currently enabled
            chrome.storage.sync.get([STORAGE_KEYS.PRANK_ENABLED], (result) => {
                const isEnabled = result[STORAGE_KEYS.PRANK_ENABLED] || false;
                if (isEnabled) {
                    console.log('Humor mode changed while prank active - reprocessing page...');
                    setTimeout(processPage, 500);
                }
            });
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