# **Task List: Wikipoodia Chrome Extension MVP**

## **Project Overview**
This task list guides the development of the Wikipoodia Chrome Extension from initial setup to a fully testable MVP. Each phase builds upon the previous one, ensuring a systematic approach to creating a functional prank extension that injects AI-generated fake facts into Wikipedia articles.

---

## **Phase 1: Project Foundation & Setup**

### **Task 1.1: Project Structure Setup**
**Priority**: Critical  
**Estimated Time**: 30 minutes

**Deliverables**:
- [ ] Create project root directory: `wikipoodia-extension/`
- [ ] Create folder structure according to architecture:
  ```
  wikipoodia-extension/
  ├── manifest.json
  ├── icons/
  ├── popup/
  ├── content/
  ├── background/
  ├── utils/
  └── styles/
  ```
- [ ] Initialize README.md with basic project description

**Acceptance Criteria**:
- All folders exist and are properly organized
- README contains project description and setup instructions

### **Task 1.2: Extension Icons Creation**
**Priority**: Medium  
**Estimated Time**: 45 minutes

**Deliverables**:
- [ ] Create or source extension icons in required sizes:
  - [ ] `icons/icon-16.png` (16x16px)
  - [ ] `icons/icon-48.png` (48x48px)  
  - [ ] `icons/icon-128.png` (128x128px)

**Acceptance Criteria**:
- Icons are properly sized and recognizable
- Icons represent the extension's playful/prank nature
- All three sizes are consistent in design

### **Task 1.3: Manifest V3 Configuration**
**Priority**: Critical  
**Estimated Time**: 45 minutes

**Deliverables**:
- [ ] Create `manifest.json` with complete configuration
- [ ] Include all required permissions:
  - [ ] `activeTab`
  - [ ] `scripting` 
  - [ ] `storage`
- [ ] Configure host permissions:
  - [ ] `*://*.wikipedia.org/*`
  - [ ] `https://api.openai.com/*`
- [ ] Set up content script injection for Wikipedia
- [ ] Configure background service worker
- [ ] Set popup action with icon references

**Acceptance Criteria**:
- Manifest follows Manifest V3 standards
- Extension loads successfully in Chrome developer mode
- No manifest validation errors

---

## **Phase 2: Core Extension Components**

### **Task 2.1: Basic Popup Interface**
**Priority**: Critical  
**Estimated Time**: 2 hours

**Deliverables**:
- [ ] Create `popup/popup.html`:
  - [ ] Clean, minimal layout
  - [ ] Toggle switch element
  - [ ] Status display area
  - [ ] Basic styling structure
- [ ] Create `popup/popup.css`:
  - [ ] Responsive design
  - [ ] Toggle switch styling
  - [ ] Status indicator styles
  - [ ] Modern, clean aesthetic
- [ ] Create `popup/popup.js` skeleton:
  - [ ] DOM element references
  - [ ] Event listener setup
  - [ ] Basic toggle functionality placeholder

**Acceptance Criteria**:
- Popup opens when extension icon is clicked
- Toggle switch is visually appealing and interactive
- Status display shows current state
- Responsive design works properly

### **Task 2.2: Chrome Storage Integration**
**Priority**: Critical  
**Estimated Time**: 1.5 hours

**Deliverables**:
- [ ] Create `utils/storage.js`:
  - [ ] Wrapper functions for `chrome.storage.sync`
  - [ ] Get/set prank enabled state
  - [ ] Cache management functions
  - [ ] Error handling for storage operations
- [ ] Create `utils/constants.js`:
  - [ ] Storage key definitions
  - [ ] API endpoint constants
  - [ ] Configuration values

**Acceptance Criteria**:
- Storage functions work reliably
- State persists across browser sessions
- Error handling prevents crashes
- Constants are properly organized

### **Task 2.3: Background Service Worker**
**Priority**: Medium  
**Estimated Time**: 1 hour

**Deliverables**:
- [ ] Create `background/background.js`:
  - [ ] Extension lifecycle management
  - [ ] Tab reload coordination
  - [ ] Error logging setup
  - [ ] Cross-tab state synchronization

**Acceptance Criteria**:
- Service worker registers successfully
- Tab management functions work properly
- Extension state is consistent across tabs

---

## **Phase 3: Content Script Foundation**

### **Task 3.1: Wikipedia Page Detection**
**Priority**: Critical  
**Estimated Time**: 1.5 hours

**Deliverables**:
- [ ] Create `content/content.js` foundation:
  - [ ] Wikipedia page detection logic
  - [ ] Page load event handling
  - [ ] Storage state checking
  - [ ] Basic error logging
- [ ] Implement content analysis:
  - [ ] Identify paragraph elements (`<p>`)
  - [ ] Filter article content vs navigation
  - [ ] Random paragraph selection (30% target)

**Acceptance Criteria**:
- Script only activates on Wikipedia pages
- Correctly identifies article paragraphs
- Skips navigation and sidebar content
- Random selection works as expected

### **Task 3.2: Context Extraction Logic**
**Priority**: High  
**Estimated Time**: 1 hour

**Deliverables**:
- [ ] Extract page context for AI prompting:
  - [ ] Page title parsing
  - [ ] Subject identification
  - [ ] First paragraph content extraction
  - [ ] Context cleaning and formatting

**Acceptance Criteria**:
- Accurately extracts page subject
- Handles edge cases (disambiguation pages, etc.)
- Context is suitable for AI prompting

---

## **Phase 4: OpenAI API Integration**

### **Task 4.1: API Client Implementation**
**Priority**: Critical  
**Estimated Time**: 2.5 hours

**Deliverables**:
- [ ] Create `utils/api.js`:
  - [ ] OpenAI API client configuration
  - [ ] Authentication with provided API key
  - [ ] Request formatting for chat completions
  - [ ] Response parsing and validation
  - [ ] Error handling and retry logic
- [ ] Implement fact generation:
  - [ ] Contextual prompt creation
  - [ ] API call execution
  - [ ] Response fact extraction
  - [ ] Fact quality validation

**Acceptance Criteria**:
- Successfully connects to OpenAI API
- Generates contextually relevant fake facts
- Handles API errors gracefully
- Facts are appropriately absurd but believable

### **Task 4.2: Caching System**
**Priority**: High  
**Estimated Time**: 1.5 hours

**Deliverables**:
- [ ] Implement session-based caching:
  - [ ] Cache generated facts per page
  - [ ] Cache expiration logic
  - [ ] Memory management
  - [ ] Cache cleanup on extension disable

**Acceptance Criteria**:
- Reduces API calls through effective caching
- Memory usage remains reasonable
- Cache invalidation works properly

---

## **Phase 5: Content Injection System**

### **Task 5.1: Fact Injection Logic**
**Priority**: Critical  
**Estimated Time**: 3 hours

**Deliverables**:
- [ ] Implement content modification:
  - [ ] Seamless fact insertion into paragraphs
  - [ ] Sentence boundary detection
  - [ ] Natural text flow preservation
  - [ ] Injection point optimization
- [ ] Content integration:
  - [ ] Multiple injection strategies
  - [ ] Text formatting consistency
  - [ ] Avoid obvious insertion points

**Acceptance Criteria**:
- Injected facts blend naturally with existing content
- No visual disruption to page layout
- Multiple facts per page work correctly
- Text flow remains natural

### **Task 5.2: Popup Control Integration**
**Priority**: Critical  
**Estimated Time**: 2 hours

**Deliverables**:
- [ ] Complete popup functionality:
  - [ ] Toggle state management
  - [ ] Real-time status updates
  - [ ] Success/error feedback
  - [ ] Storage synchronization
- [ ] State persistence:
  - [ ] Cross-session state saving
  - [ ] Immediate effect activation/deactivation
  - [ ] Tab-specific behavior

**Acceptance Criteria**:
- Toggle immediately affects Wikipedia browsing
- State persists across browser restarts
- Visual feedback is clear and immediate
- No lag between toggle and effect

---

## **Phase 6: Error Handling & Robustness**

### **Task 6.1: Comprehensive Error Handling**
**Priority**: High  
**Estimated Time**: 2 hours

**Deliverables**:
- [ ] API error handling:
  - [ ] Network failure recovery
  - [ ] Rate limiting handling
  - [ ] Invalid response management
  - [ ] Graceful degradation
- [ ] Content script error handling:
  - [ ] DOM manipulation errors
  - [ ] Storage access failures
  - [ ] Edge case handling

**Acceptance Criteria**:
- Extension never crashes from API issues
- Continues functioning even with network problems
- Logs errors appropriately without exposing sensitive data

### **Task 6.2: Page Cleanup & Reversion**
**Priority**: High  
**Estimated Time**: 1.5 hours

**Deliverables**:
- [ ] Implement clean reversion:
  - [ ] Page reload triggering on disable
  - [ ] Complete content restoration
  - [ ] No traces of modifications
- [ ] State cleanup:
  - [ ] Cache clearing on disable
  - [ ] Event listener removal
  - [ ] Memory cleanup

**Acceptance Criteria**:
- Disabling prank completely removes all modifications
- Page returns to original Wikipedia state
- No memory leaks or lingering effects

---

## **Phase 7: Testing & Quality Assurance**

### **Task 7.1: Manual Testing Suite**
**Priority**: Critical  
**Estimated Time**: 3 hours

**Deliverables**:
- [ ] Test core functionality:
  - [ ] Extension installation and loading
  - [ ] Popup toggle operation
  - [ ] Wikipedia fact injection
  - [ ] Content quality and believability
- [ ] Test edge cases:
  - [ ] Different Wikipedia page types
  - [ ] Network connectivity issues
  - [ ] API rate limiting
  - [ ] Multiple tabs simultaneously
- [ ] Cross-session testing:
  - [ ] State persistence
  - [ ] Browser restart behavior
  - [ ] Extension updates

**Acceptance Criteria**:
- All core features work reliably
- Edge cases are handled gracefully
- Extension performs consistently across sessions

### **Task 7.2: Performance Optimization**
**Priority**: Medium  
**Estimated Time**: 2 hours

**Deliverables**:
- [ ] Performance improvements:
  - [ ] Optimize DOM manipulation
  - [ ] Reduce memory footprint
  - [ ] Minimize API calls
  - [ ] Efficient caching strategies
- [ ] Load time optimization:
  - [ ] Asynchronous processing
  - [ ] Non-blocking operations
  - [ ] Progressive enhancement

**Acceptance Criteria**:
- No noticeable impact on Wikipedia page load times
- Memory usage remains reasonable
- Extension responds quickly to user interactions

---

## **Phase 8: MVP Polish & Final Testing**

### **Task 8.1: UI/UX Refinement**
**Priority**: Medium  
**Estimated Time**: 2 hours

**Deliverables**:
- [ ] Polish popup interface:
  - [ ] Improve visual design
  - [ ] Add helpful tooltips
  - [ ] Enhance user feedback
  - [ ] Responsive design improvements
- [ ] User experience optimization:
  - [ ] Clear status messaging
  - [ ] Intuitive toggle behavior
  - [ ] Error message clarity

**Acceptance Criteria**:
- Interface is intuitive and professional-looking
- User feedback is clear and helpful
- Design is consistent and polished

### **Task 8.2: Final Integration Testing**
**Priority**: Critical  
**Estimated Time**: 2 hours

**Deliverables**:
- [ ] End-to-end testing:
  - [ ] Complete user journey testing
  - [ ] Both persona workflows (prankster & target)
  - [ ] Real Wikipedia page testing
  - [ ] Chrome loading and functionality
- [ ] Documentation completion:
  - [ ] Installation instructions
  - [ ] Usage guidelines
  - [ ] Troubleshooting guide

**Acceptance Criteria**:
- Extension can be loaded in Chrome developer mode
- All features work as documented
- Both user personas can complete their journeys successfully
- Ready for manual testing by end users

---

## **Phase 9: MVP Delivery**

### **Task 9.1: Final Packaging**
**Priority**: Critical  
**Estimated Time**: 1 hour

**Deliverables**:
- [ ] Final code review and cleanup
- [ ] Remove development console logs
- [ ] Optimize file structure
- [ ] Create installation package
- [ ] Final testing checklist completion

**Acceptance Criteria**:
- Extension loads cleanly in Chrome
- No development artifacts remain
- All features work as specified
- Ready for user testing

### **Task 9.2: Documentation & Handoff**
**Priority**: High  
**Estimated Time**: 1 hour

**Deliverables**:
- [ ] Complete README with:
  - [ ] Installation instructions
  - [ ] Usage guide
  - [ ] Feature overview
  - [ ] Troubleshooting section
- [ ] Developer documentation:
  - [ ] Code structure explanation
  - [ ] API integration details
  - [ ] Future enhancement roadmap

**Acceptance Criteria**:
- Documentation is clear and complete
- Installation process is well-documented
- Future development path is outlined

---

## **Testing Milestones**

### **Milestone 1: Basic Extension Loading** (After Phase 2)
- [ ] Extension loads in Chrome developer mode
- [ ] Popup appears and functions
- [ ] No console errors

### **Milestone 2: Wikipedia Detection** (After Phase 3)
- [ ] Content script activates on Wikipedia pages only
- [ ] Paragraph detection works correctly
- [ ] No interference with normal browsing

### **Milestone 3: AI Integration** (After Phase 4)
- [ ] OpenAI API calls succeed
- [ ] Facts are generated contextually
- [ ] Caching reduces API usage

### **Milestone 4: Content Injection** (After Phase 5)
- [ ] Facts appear naturally in Wikipedia articles
- [ ] Toggle control works immediately
- [ ] Content can be reverted cleanly

### **Milestone 5: MVP Complete** (After Phase 8)
- [ ] Extension fully functional for testing
- [ ] Both user personas can complete their journeys
- [ ] Ready for real-world prank testing

---

## **Success Criteria for MVP**

1. **Functional Requirements**:
   - ✅ Extension loads in Chrome without errors
   - ✅ Toggle switch controls prank activation
   - ✅ AI generates contextually relevant fake facts
   - ✅ Facts inject seamlessly into Wikipedia articles
   - ✅ Disabling removes all modifications

2. **User Experience Requirements**:
   - ✅ Prankster can easily install and configure
   - ✅ Target experiences natural-seeming content
   - ✅ Facts are initially believable but ultimately absurd
   - ✅ Clean reversion when disabled

3. **Technical Requirements**:
   - ✅ Manifest V3 compliance
   - ✅ Proper error handling
   - ✅ Performance impact minimal
   - ✅ State persistence across sessions

4. **Testing Requirements**:
   - ✅ Manual testing complete
   - ✅ Edge cases handled
   - ✅ Cross-session functionality verified
   - ✅ Ready for user testing

---

**Total Estimated Development Time**: 30-35 hours  
**Target MVP Completion**: All phases complete with testing milestones achieved  
**Final Deliverable**: Fully functional Chrome extension ready for real-world testing 