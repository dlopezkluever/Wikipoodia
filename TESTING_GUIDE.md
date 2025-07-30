# Wikipedia Troll Extension - Testing Guide

## 🚀 Quick Start Testing

### 1. Load the Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select your `Wiki-Troll` project folder
5. The extension should load with the Wikipedia Troll icon in your toolbar

### 2. Basic Functionality Test
1. **Click the extension icon** → Popup should open with toggle switch
2. **Toggle the prank ON** → Status should show "On" in green
3. **Visit any Wikipedia article** (e.g., https://en.wikipedia.org/wiki/Albert_Einstein)
4. **Wait 3-5 seconds** → AI-generated fake facts should appear naturally in the text
5. **Toggle the prank OFF** → Page should automatically reload, removing all modifications

## 🔍 Detailed Testing Scenarios

### Test 1: Wikipedia Page Detection
**What to test**: Extension only activates on Wikipedia pages
- ✅ **Should work**: Any `*.wikipedia.org/wiki/[article]` page
- ❌ **Should NOT work**: 
  - Google.com
  - Wikipedia homepage (wikipedia.org)
  - Wikipedia special pages (wikipedia.org/wiki/Special:*)

### Test 2: Content Injection Quality
**What to test**: Facts appear natural and believable
1. Visit different types of Wikipedia pages:
   - **Person**: Albert Einstein, Marie Curie, Leonardo da Vinci
   - **Place**: New York City, Mount Everest, Paris
   - **Concept**: Artificial Intelligence, Democracy, Physics
2. Check that facts are:
   - Written in Wikipedia style
   - Initially believable but ultimately absurd
   - Integrated seamlessly into existing paragraphs

### Test 3: Popup Interface
**What to test**: User interface functionality
- Toggle switch changes color and position
- Status text updates ("On" vs "Off")
- Status display background changes color
- Success messages appear briefly after toggle
- Extension remembers state after browser restart

### Test 4: Performance & Caching
**What to test**: System efficiency
1. Visit the same Wikipedia page twice with prank enabled
2. Second visit should be faster (facts loaded from cache)
3. Check browser console for "Using cached fact" messages
4. Multiple tabs should work independently

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

// View all injected facts
WikipediaTrollDebug.getInjectedFacts()

// Highlight modified paragraphs with red borders
WikipediaTrollDebug.toggleDebugBorders()

// Reprocess the current page
WikipediaTrollDebug.reprocess()
```

### Common Issues & Solutions

#### Issue: "Extension not loading"
- **Check**: PNG icon files exist in icons/ folder
- **Fix**: Ensure icon-16.png, icon-48.png, icon-128.png are present

#### Issue: "No facts appearing"
- **Check**: Console for error messages
- **Check**: OpenAI API key is valid in utils/constants.js
- **Check**: Prank is enabled in popup

#### Issue: "API errors"
- **Check**: Network connection
- **Check**: OpenAI API quota/billing
- **Wait**: Extension has retry logic with exponential backoff

#### Issue: "Facts not natural looking"
- **Check**: Page type detection working correctly
- **Note**: AI responses may vary - refresh page to regenerate

### Expected Console Output
When working correctly, you should see:
```
Wikipedia Troll content script loaded on: https://en.wikipedia.org/wiki/...
Wikipedia page detected, initializing...
Processing Wikipedia page...
Prank status: ENABLED
Page context extracted: {title: "...", subject: "...", pageType: "person"}
Selected 3 paragraphs for injection
Starting fact injection process...
Injecting fact 1/3...
Successfully injected fact 1: "Einstein was known to solve complex equations while juggling..."
```

## 📊 Testing Checklist

### Core Functionality
- [ ] Extension loads in Chrome without errors
- [ ] Popup opens and displays correctly
- [ ] Toggle switch works and persists state
- [ ] Wikipedia pages are detected correctly
- [ ] Non-Wikipedia pages are ignored
- [ ] Facts are generated and injected
- [ ] Facts appear natural in the text
- [ ] Disabling prank reloads and cleans pages
- [ ] Multiple tabs work independently

### Edge Cases
- [ ] Very short Wikipedia articles
- [ ] Wikipedia disambiguation pages
- [ ] Wikipedia list pages ("List of...")
- [ ] Articles with lots of references/citations
- [ ] Non-English Wikipedia sites
- [ ] Network connectivity issues
- [ ] Browser restart preserves settings

### Performance
- [ ] Page load times not noticeably affected
- [ ] Caching reduces API calls on repeat visits
- [ ] Memory usage reasonable
- [ ] No crashes or freezing

## 🎯 Success Criteria

The extension is working correctly if:

1. **Prankster Experience**:
   - Can easily toggle prank on/off
   - Clear visual feedback on state
   - Settings persist across sessions

2. **Target Experience**:
   - Facts appear seamlessly integrated
   - Initially believable but obviously fake
   - Natural reading flow maintained
   - Complete cleanup when disabled

3. **Technical Performance**:
   - Fast, responsive operation
   - Handles errors gracefully
   - Minimal resource usage
   - Clean reversion capability

## 🔬 Advanced Testing

### API Rate Limiting Test
1. Enable prank and visit 10+ different Wikipedia pages quickly
2. Should handle rate limits gracefully with retry logic
3. Check console for retry attempt messages

### Cache Expiration Test
1. Enable prank, visit a page, note the facts
2. Wait 24+ hours (or manually clear cache)
3. Revisit same page - should generate new facts

### Cross-Session Test
1. Enable prank, close browser completely
2. Reopen browser, extension should remember "On" state
3. Visit Wikipedia - should still inject facts

## 🎉 Enjoy Testing!

The Wikipedia Troll Extension is now a fully functional prank tool! Have fun testing it and enjoy the hilarious fake facts it generates. Remember to use it responsibly and only on friends who would appreciate the humor! 😄 