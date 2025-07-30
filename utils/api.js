// OpenAI API client for Wikipedia Troll Extension
// Phase 4: Complete API integration with error handling and retry logic

import { API_CONFIG, ERROR_MESSAGES, DEBUG, CONFIG } from './constants.js';
import { getCachedFact, cacheFact } from './storage.js';

/**
 * OpenAI API client class
 */
class OpenAIClient {
    constructor() {
        this.apiKey = API_CONFIG.API_KEY;
        this.endpoint = API_CONFIG.OPENAI_ENDPOINT;
        this.model = API_CONFIG.MODEL;
        this.retryAttempts = CONFIG.RETRY_ATTEMPTS;
        this.retryDelay = CONFIG.RETRY_DELAY;
    }

    /**
     * Generate a fake fact for the given context
     * @param {Object} context - Page context containing title, subject, pageType, etc.
     * @param {string} paragraphText - Text of the paragraph where fact will be injected
     * @returns {Promise<string>} Generated fake fact
     */
    async generateFact(context, paragraphText = '') {
        try {
            // Check cache first
            const cacheKey = this.createCacheKey(context, paragraphText);
            const cachedFact = await getCachedFact(cacheKey);
            
            if (cachedFact) {
                if (DEBUG.VERBOSE_API) {
                    console.log('API: Using cached fact for:', context.subject);
                }
                return cachedFact;
            }

            // Generate new fact via API
            const fact = await this.callOpenAIAPI(context, paragraphText);
            
            // Cache the result
            await cacheFact(cacheKey, fact);
            
            return fact;

        } catch (error) {
            console.error('API: Failed to generate fact:', error);
            throw error;
        }
    }

    /**
     * Call the OpenAI API with retry logic
     * @param {Object} context - Page context
     * @param {string} paragraphText - Paragraph text for context
     * @returns {Promise<string>} Generated fact
     */
    async callOpenAIAPI(context, paragraphText) {
        let lastError;

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                if (DEBUG.VERBOSE_API) {
                    console.log(`API: Attempt ${attempt} for ${context.subject}`);
                }

                const fact = await this.makeAPIRequest(context, paragraphText);
                
                if (DEBUG.VERBOSE_API) {
                    console.log('API: Successfully generated fact:', fact);
                }

                return fact;

            } catch (error) {
                lastError = error;
                
                if (attempt < this.retryAttempts) {
                    console.warn(`API: Attempt ${attempt} failed, retrying...`, error.message);
                    await this.delay(this.retryDelay * attempt); // Exponential backoff
                } else {
                    console.error(`API: All ${this.retryAttempts} attempts failed`);
                }
            }
        }

        throw lastError;
    }

    /**
     * Make the actual API request
     * @param {Object} context - Page context
     * @param {string} paragraphText - Paragraph text
     * @returns {Promise<string>} Generated fact
     */
    async makeAPIRequest(context, paragraphText) {
        const prompt = this.createPrompt(context, paragraphText);
        
        const requestBody = {
            model: this.model,
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

        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        return await this.handleAPIResponse(response);
    }

    /**
     * Handle API response and extract fact
     * @param {Response} response - Fetch response object
     * @returns {Promise<string>} Extracted fact
     */
    async handleAPIResponse(response) {
        // Check for HTTP errors
        if (!response.ok) {
            if (response.status === 429) {
                throw new Error(ERROR_MESSAGES.RATE_LIMIT);
            } else if (response.status >= 500) {
                throw new Error(`API server error: ${response.status}`);
            } else if (response.status === 401) {
                throw new Error('API authentication failed - check API key');
            } else {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
        }

        // Parse JSON response
        let data;
        try {
            data = await response.json();
        } catch (error) {
            throw new Error('Invalid JSON response from API');
        }

        // Validate response structure
        if (!data.choices || !data.choices.length || !data.choices[0].message) {
            throw new Error('Invalid API response structure');
        }

        const fact = data.choices[0].message.content.trim();
        
        // Validate fact content
        if (!fact || fact.length < 10) {
            throw new Error('Generated fact is too short or empty');
        }

        // Clean up the fact
        return this.cleanFact(fact);
    }

    /**
     * Create a contextual prompt for fact generation
     * @param {Object} context - Page context
     * @param {string} paragraphText - Paragraph text for additional context
     * @returns {string} Generated prompt
     */
    createPrompt(context, paragraphText) {
        const { subject, pageType, intro, language } = context;
        
        let prompt = `Generate a single, amusing fake fact about "${subject}"`;
        
        // Add context based on page type
        switch (pageType) {
            case 'person':
                prompt += `. This is a biographical article. Create a humorous personal detail, quirky habit, or funny historical anecdote`;
                break;
            case 'place':
                prompt += `. This is about a place/location. Create an amusing geographical feature, local tradition, or unusual statistic`;
                break;
            case 'concept':
                prompt += `. This is about a concept or topic. Create a funny origin story, unusual application, or absurd side effect`;
                break;
            default:
                prompt += `. Create an entertaining and surprising detail`;
        }

        // Add paragraph context if available
        if (paragraphText && paragraphText.length > 20) {
            const contextSnippet = paragraphText.substring(0, 100) + '...';
            prompt += `. Here's some context from the article: "${contextSnippet}"`;
        }

        prompt += `

Requirements:
- Write in the style of Wikipedia (encyclopedic, matter-of-fact tone)
- Make it believable at first glance but obviously absurd when examined
- Keep it to 1-2 sentences maximum
- Make it family-friendly and harmless
- Avoid offensive, political, or sensitive content
- Don't mention this is fake or a joke
- Start the fact naturally (no "Did you know" or "Interestingly")`;

        if (language !== 'en') {
            prompt += `\n- Write in ${language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language === 'de' ? 'German' : 'English'}`;
        }

        return prompt;
    }

    /**
     * Clean and format the generated fact
     * @param {string} fact - Raw fact from API
     * @returns {string} Cleaned fact
     */
    cleanFact(fact) {
        return fact
            .replace(/^["']|["']$/g, '') // Remove surrounding quotes
            .replace(/^\w+:\s*/, '') // Remove prefixes like "Fact:", "Note:", etc.
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    /**
     * Create cache key for fact caching
     * @param {Object} context - Page context
     * @param {string} paragraphText - Paragraph text
     * @returns {string} Cache key
     */
    createCacheKey(context, paragraphText) {
        const subjectKey = context.subject.toLowerCase().replace(/\s+/g, '_');
        const typeKey = context.pageType;
        const textHash = this.simpleHash(paragraphText.substring(0, 50));
        return `${subjectKey}_${typeKey}_${textHash}`;
    }

    /**
     * Simple hash function for text
     * @param {string} text - Text to hash
     * @returns {string} Hash string
     */
    simpleHash(text) {
        let hash = 0;
        if (text.length === 0) return hash.toString();
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * Delay function for retry logic
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Delay promise
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Test API connectivity and authentication
     * @returns {Promise<boolean>} Whether API is accessible
     */
    async testConnection() {
        try {
            const testContext = {
                subject: "Test",
                pageType: "article",
                intro: "This is a test",
                language: "en"
            };

            await this.makeAPIRequest(testContext, "");
            return true;
        } catch (error) {
            console.error('API connection test failed:', error);
            return false;
        }
    }
}

// Create singleton instance
const apiClient = new OpenAIClient();

// Export functions for use in content script
export async function generateFact(context, paragraphText = '') {
    return await apiClient.generateFact(context, paragraphText);
}

export async function testAPIConnection() {
    return await apiClient.testConnection();
}

export { apiClient }; 