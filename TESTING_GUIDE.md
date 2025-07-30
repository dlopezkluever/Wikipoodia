# Wikipoodia Extension - Testing Guide

## 🚀 Quick Start Testing

### 1. Load the Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select your `Wiki-Troll` project folder
5. The extension should load with the Wikipedia Troll icon in your toolbar

### 2. Basic Functionality Test
1. **Click the extension icon** → Popup should open with toggle switch and humor mode selector
2. **Select a humor mode** → Choose from Goofy, Outrageous, Obscene, Utter Misinfo, or Evil
3. **Toggle the prank ON** → Status should show "On" in green
4. **Visit any Wikipedia article** (e.g., https://en.wikipedia.org/wiki/Albert_Einstein)
5. **Wait 1-3 seconds** → AI-generated fake facts should appear seamlessly in the text (much faster than before!)
6. **Toggle the prank OFF** → Page should automatically reload, removing all modifications

## 🔍 Detailed Testing Scenarios

### Test 1: Wikipedia Page Detection
**What to test**: Extension only activates on Wikipedia pages
- ✅ **Should work**: Any `*.wikipedia.org/wiki/[article]` page
- ❌ **Should NOT work**: 
  - Google.com
  - Wikipedia homepage (wikipedia.org)
  - Wikipedia special pages (wikipedia.org/wiki/Special:*)

### Test 2: Humor Mode Variations
**What to test**: Different humor modes produce appropriate content
1. Test each mode on the same Wikipedia page:
   - **🟢 Goofy**: Family-friendly, silly scenarios
   - **🟡 Outrageous**: PG-13 with innuendo, embarrassing situations
   - **🔴 Obscene**: Adult humor with explicit content (NSFW)
   - **🔄 Utter Misinfo**: Complete opposite facts (flipped dates, locations, etc.)
   - **🖤 Evil**: Dark conspiracies and sinister undertones
2. Verify content matches the selected humor level
3. Check that mode selection persists across page reloads

### Test 3: Content Injection Quality  
**What to test**: Facts appear natural and believable
1. Visit different types of Wikipedia pages:
   - **Person**: Albert Einstein, Marie Curie, Leonardo da Vinci
   - **Place**: New York City, Mount Everest, Paris
   - **Concept**: Artificial Intelligence, Democracy, Physics
2. Check that facts are:
   - Written in Wikipedia style
   - Initially believable but ultimately absurd
   - Integrated seamlessly into existing paragraphs (no visual highlighting)
   - Placed systematically (every other qualifying paragraph, not random)
   - Only in paragraphs with 100+ characters

### Test 4: Systematic Selection Behavior
**What to test**: Paragraph selection follows new systematic approach
1. Visit a long Wikipedia article
2. Count paragraphs with fake facts
3. Should see facts in every other suitable paragraph (not random placement)
4. Maximum of 50 facts per page
5. Only paragraphs with 100+ characters should be selected

### Test 5: Popup Interface
**What to test**: User interface functionality
- Toggle switch changes color and position
- Humor mode selector works and persists
- Status text updates ("On" vs "Off")
- Status display background changes color
- Success messages appear briefly after toggle
- Extension remembers both prank state AND humor mode after browser restart

### Test 6: Performance & Caching
**What to test**: System efficiency (much improved!)
1. Visit the same Wikipedia page twice with prank enabled
2. Second visit should be lightning fast (cached facts, 100ms delays)
3. First visit should be faster than before (500ms delays for API calls)
4. Check browser console for cache performance stats
5. Multiple tabs should work independently without slowdown

## 🛠 Debug & Troubleshooting

### Browser Console Commands
Open Developer Tools (F12) and try these in the console on a Wikipedia page:

```javascript
// Get current page statistics
WikipediaTrollDebug.getStats()

// View extracted page context
WikipediaTrollDebug.getContext()

// See which paragraphs were selected
WikipediaTrollDebug.getParagraphs()

// View all injected facts with cache info
WikipediaTrollDebug.getInjectedFacts()

// Highlight modified paragraphs with red borders
WikipediaTrollDebug.toggleDebugBorders()

// Highlight injected paragraphs (orange borders)
WikipediaTrollDebug.highlightInjected()

// Clear debug highlighting
WikipediaTrollDebug.clearHighlights()

// Reprocess the current page
WikipediaTrollDebug.reprocess()
```

### Common Issues & Solutions

#### Issue: "Extension not loading"
- **Check**: PNG icon files exist in icons/ folder
- **Fix**: Ensure icon-16.png, icon-48.png, icon-128.png are present

#### Issue: "No facts appearing"
- **Check**: Console for error messages
- **Check**: OpenAI API key is set in background/background.js (line 24)
- **Check**: Prank is enabled AND humor mode is selected in popup
- **Check**: Page has paragraphs with 100+ characters

#### Issue: "API errors"
- **Check**: Network connection
- **Check**: OpenAI API key is valid and has credits
- **Check**: API key replaced placeholder text "Enter your OpenAI API key here"
- **Wait**: Extension has retry logic with exponential backoff

#### Issue: "Facts appearing too slowly"
- **Expected**: First visit ~3-5 seconds, cached visits ~1-2 seconds  
- **Check**: Cache is working (console shows "cached" vs "new API calls")
- **Note**: Much faster than previous versions due to optimizations

#### Issue: "Facts not matching humor mode"
- **Check**: Humor mode selection persisted correctly
- **Try**: Clear cache and regenerate facts
- **Note**: AI responses may vary - refresh page to regenerate

### Expected Console Output
When working correctly, you should see:
```
Wikipedia Troll content script loaded on: https://en.wikipedia.org/wiki/...
Wikipedia page detected, initializing...
Processing Wikipedia page...
Prank status: ENABLED
Humor mode: goofy
Page context extracted: {title: "...", subject: "...", pageType: "person"}
Identifying paragraphs for injection...
Found 45 total paragraphs
43 paragraphs after filtering exclusions and duplicates
28 paragraphs with 100+ characters
Selected 14 paragraphs (every other qualifying paragraph, max 50)
Starting fact injection process with humor mode: goofy
Injecting fact 1/14...
Using cached fact for paragraph (mode: goofy)
Successfully injected fact 1: "Einstein secretly trained elephants..."
Fact injection complete: 14 success, 0 errors
Cache performance: 12 cached, 2 new API calls
```

## 📊 Testing Checklist

### Core Functionality
- [ ] Extension loads in Chrome without errors
- [ ] Popup opens and displays correctly with humor mode selector
- [ ] Toggle switch works and persists state
- [ ] Humor mode selection works and persists
- [ ] Wikipedia pages are detected correctly
- [ ] Non-Wikipedia pages are ignored
- [ ] Facts are generated and injected systematically (every other paragraph)
- [ ] Facts appear natural with NO visual highlighting
- [ ] Facts match selected humor mode appropriately
- [ ] Disabling prank reloads and cleans pages completely
- [ ] Multiple tabs work independently

### Performance (Improved)
- [ ] First visit: Facts inject within 3-5 seconds
- [ ] Cached visits: Facts inject within 1-2 seconds  
- [ ] Console shows cache performance stats
- [ ] No duplicate facts in same paragraph
- [ ] Maximum 50 facts per page respected
- [ ] Only paragraphs 100+ characters get facts

### Humor Modes
- [ ] Goofy mode: Family-friendly, silly content
- [ ] Outrageous mode: PG-13 humor with innuendo
- [ ] Obscene mode: Adult content with explicit language
- [ ] Utter Misinfo mode: Facts completely opposite to reality
- [ ] Evil mode: Dark conspiracies and sinister undertones
- [ ] Mode selection persists across browser sessions

### Edge Cases
- [ ] Very short Wikipedia articles (few qualifying paragraphs)
- [ ] Wikipedia disambiguation pages
- [ ] Wikipedia list pages ("List of...")
- [ ] Articles with lots of references/citations
- [ ] Non-English Wikipedia sites
- [ ] Network connectivity issues
- [ ] Browser restart preserves both prank state AND humor mode
- [ ] Pages with paragraphs under 100 characters (should be skipped)

### Advanced Testing
- [ ] Duplicate prevention: Same paragraph never gets multiple facts
- [ ] Cache expiration: Facts regenerate after 24 hours
- [ ] API rate limiting: Graceful handling with retries
- [ ] Cross-session persistence: Settings survive browser restart
- [ ] Multiple humor modes: Different content for different modes

## 🎯 Success Criteria

The extension is working correctly if:

1. **Prankster Experience**:
   - Can easily toggle prank on/off
   - Can select appropriate humor mode for target audience
   - Clear visual feedback on state and mode
   - Settings persist across sessions
   - Fast, responsive performance

2. **Target Experience**:
   - Facts appear seamlessly integrated (no highlighting)
   - Content matches expected humor level
   - Initially believable but obviously fake upon examination
   - Natural reading flow maintained
   - Complete cleanup when disabled

3. **Technical Performance**:
   - Lightning fast operation (1-5 seconds max)
   - Intelligent caching reduces API costs
   - Systematic fact placement (not random)
   - Handles errors gracefully
   - Clean reversion capability
   - No duplicate facts per paragraph

## 🔬 Advanced Testing

### Humor Mode Comparison Test
1. Enable prank with "Goofy" mode, visit Einstein page, note facts
2. Change to "Evil" mode, refresh page, verify facts are now sinister
3. Try "Utter Misinfo" mode, check that dates/locations are flipped
4. Compare content appropriateness across modes

### Cache Performance Test
1. Visit new Wikipedia page (watch console for "new API calls")
2. Refresh same page (should show "cached" facts, much faster)
3. Visit different page (mix of cached and new facts expected)
4. Check console for cache performance statistics

### Systematic Selection Test
1. Visit very long Wikipedia article
2. Count total paragraphs vs facts injected
3. Verify facts appear in every other qualifying paragraph
4. Confirm no paragraph gets multiple facts

### API Key Configuration Test
1. Verify background/background.js contains placeholder "Enter your OpenAI API key here"
2. Replace with valid API key
3. Test fact generation works
4. Confirm no hardcoded keys exposed in repository

## 🎉 Enjoy Testing!

The Wikipoodia Extension is now a highly optimized, feature-rich prank tool! With 5 humor modes, lightning-fast performance, and systematic fact injection, it delivers a premium pranking experience. Have fun testing all the modes and enjoy the hilarious fake facts it generates. Remember to use it responsibly and only on friends who would appreciate the humor! 😄 