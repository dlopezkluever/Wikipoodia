# **Enhancement Task List: Wikipedia Troll Extension - Advanced Features**

## **Overview**
This task list outlines the advanced enhancements to transform the Wikipedia Troll Extension from a basic MVP to a sophisticated pranking tool with multiple humor modes, intelligent context awareness, and maximum impact content injection.

---

## **Phase 6: Enhanced Content Injection (Priority 1)**

### **Task 6.1: Increased Fact Quantity**
**Priority**: Critical  
**Estimated Time**: 1.5 hours

**Objective**: Maximize prank impact with 50% paragraph coverage

**Deliverables**:
- [ ] Update paragraph selection algorithm:
  - [ ] Change from 30% random selection to 50% sequential selection
  - [ ] Start from top of article and work downward
  - [ ] Select every other paragraph (1st, 3rd, 5th, etc.)
  - [ ] Implement maximum cap of 50 facts per page
- [ ] Update configuration constants:
  - [ ] `FACT_INJECTION_PERCENTAGE: 0.5` (50% coverage)
  - [ ] `MAX_FACTS_PER_PAGE: 50` (hard limit)
  - [ ] `SELECTION_STRATEGY: 'sequential'` (top-down vs random)

**Acceptance Criteria**:
- Large pages (100+ paragraphs) inject exactly 50 facts
- Small pages (20 paragraphs) inject 10 facts (every other paragraph)
- Facts appear consistently from top to bottom of article
- No performance degradation on large pages
- Console shows "Selected X paragraphs for injection (capped at 50)"

---

## **Phase 7: Humor Mode System (Priority 2)**

### **Task 7.1: Popup UI Enhancement**
**Priority**: Critical  
**Estimated Time**: 2 hours

**Objective**: Add humor mode selector to extension popup

**Deliverables**:
- [ ] Update `popup/popup.html`:
  - [ ] Add humor mode section below toggle switch
  - [ ] Create radio button group with three options:
    - [ ] 🟢 "Goofy" (PG) - Family-friendly fun
    - [ ] 🟡 "Outrageous" (PG-13) - Embarrassing & bizarre  
    - [ ] 🔴 "Obscene" (R) - Adult humor & crude language
  - [ ] Add descriptive tooltips for each mode
- [ ] Update `popup/popup.css`:
  - [ ] Style humor mode selector section
  - [ ] Color-coded radio buttons (green/yellow/red)
  - [ ] Hover effects and visual feedback
  - [ ] Responsive layout for new controls

**Acceptance Criteria**:
- Popup displays humor mode options clearly
- Visual design matches existing popup style
- Mode descriptions are helpful but concise
- Interface remains clean and professional

### **Task 7.2: Humor Mode Storage & Logic**
**Priority**: Critical  
**Estimated Time**: 1.5 hours

**Objective**: Implement humor mode persistence and state management

**Deliverables**:
- [ ] Update `utils/constants.js`:
  - [ ] Add humor mode constants and definitions
  - [ ] Define content guidelines for each mode
  - [ ] Add storage keys for mode preference
- [ ] Update `utils/storage.js`:
  - [ ] Add get/set functions for humor mode
  - [ ] Implement cross-session persistence
  - [ ] Default to "Goofy" mode for new installations
- [ ] Update `popup/popup.js`:
  - [ ] Add event listeners for mode selection
  - [ ] Sync mode changes with storage
  - [ ] Provide user feedback on mode changes

**Acceptance Criteria**:
- Selected humor mode persists across browser restarts
- Mode changes take effect immediately
- Default mode is "Goofy" for safety
- Storage functions handle all three modes correctly

### **Task 7.3: AI Prompt Enhancement by Mode**
**Priority**: Critical  
**Estimated Time**: 2 hours

**Objective**: Implement mode-specific fact generation

**Deliverables**:
- [ ] Update `content/content.js` prompt generation:
  - [ ] **Goofy Mode Prompts**:
    - Family-friendly silly facts and harmless quirks
    - Whimsical scenarios and innocent humor
    - Safe for all audiences and workplace viewing
  - [ ] **Outrageous Mode Prompts**:
    - Embarrassing situations and bizarre behaviors
    - Ridiculous scenarios and absurd claims
    - PG-13 level humor with mild innuendo
  - [ ] **Obscene Mode Prompts**:
    - Adult humor with crude language and swear words
    - NSFW scenarios and bar-room humor
    - No content restrictions (sexuality, controversy, etc.)
- [ ] Implement mode-based prompt switching:
  - [ ] Read current mode from storage before each API call
  - [ ] Apply appropriate prompt template based on mode
  - [ ] Ensure generated content matches selected intensity

**Acceptance Criteria**:
- Each mode produces distinctly different humor styles
- Goofy mode remains completely family-friendly
- Outrageous mode escalates ridiculousness appropriately  
- Obscene mode includes adult content and crude language
- Mode changes affect new fact generation immediately

---

## **Phase 8: Enhanced Context Awareness (Priority 3)**

### **Task 8.1: Paragraph-Specific Context Extraction**
**Priority**: High  
**Estimated Time**: 2.5 hours

**Objective**: Generate facts specific to individual paragraph content

**Deliverables**:
- [ ] Enhance context extraction system:
  - [ ] Extract specific content from each target paragraph
  - [ ] Identify key topics, events, dates, and people mentioned
  - [ ] Create paragraph-specific context objects
  - [ ] Combine page-level and paragraph-level context
- [ ] Implement intelligent text analysis:
  - [ ] Parse paragraph for historical events and dates
  - [ ] Identify proper nouns (people, places, organizations)
  - [ ] Extract key themes and subject matter
  - [ ] Handle different paragraph types (biographical, geographical, etc.)

**Acceptance Criteria**:
- Facts relate specifically to paragraph content
- Context extraction works for various paragraph types
- Generated facts feel naturally connected to surrounding text
- Performance impact remains minimal

### **Task 8.2: Advanced AI Prompting**
**Priority**: High  
**Estimated Time**: 2 hours

**Objective**: Create contextually relevant facts for each paragraph

**Deliverables**:
- [ ] Develop enhanced prompt templates:
  - [ ] Include specific paragraph content in prompts
  - [ ] Reference nearby sentences and context
  - [ ] Maintain humor mode requirements
  - [ ] Balance relevance with absurdity
- [ ] Implement smart fact positioning:
  - [ ] Analyze paragraph structure and topic flow
  - [ ] Choose optimal injection points based on content
  - [ ] Ensure facts feel like natural extensions
  - [ ] Maintain Wikipedia writing style

**Example Transformations**:
- **Before**: "FDR loved tap dancing" (generic)
- **After**: In paragraph about New Deal → "FDR required all Works Progress Administration workers to perform a daily loyalty tap dance before receiving their government paychecks, believing it would boost both morale and national rhythm"

**Acceptance Criteria**:
- Facts reference specific events/people mentioned in paragraphs
- Generated content feels naturally connected to context
- Humor remains appropriate to selected mode
- Facts maintain believability despite absurdity

---

## **Phase 9: Wikipedia-Style Hyperlinks (Priority 4)**

### **Task 9.1: Link Detection System**
**Priority**: Medium  
**Estimated Time**: 3 hours

**Objective**: Automatically detect and link real Wikipedia entities

**Deliverables**:
- [ ] Implement entity recognition:
  - [ ] Parse generated facts for proper nouns
  - [ ] Identify potential Wikipedia page references
  - [ ] Validate existence of Wikipedia pages
  - [ ] Skip fictional or non-existent entities
- [ ] Create link generation system:
  - [ ] Format links in Wikipedia style
  - [ ] Ensure links open in same tab (maintain prank immersion)
  - [ ] Handle special characters and encoding
  - [ ] Match Wikipedia's link appearance exactly

**Acceptance Criteria**:
- Only real Wikipedia pages receive links
- Links appear identical to genuine Wikipedia links
- Fictional entities mentioned are left unlinked
- Link validation doesn't slow down fact injection

### **Task 9.2: Seamless Link Integration**
**Priority**: Medium  
**Estimated Time**: 2 hours

**Objective**: Integrate hyperlinks naturally into injected facts

**Deliverables**:
- [ ] Enhanced fact injection with links:
  - [ ] Insert properly formatted Wikipedia links
  - [ ] Maintain original paragraph styling
  - [ ] Preserve hover effects and link behavior
  - [ ] Handle multiple links per fact appropriately
- [ ] Link styling consistency:
  - [ ] Match Wikipedia's link colors and underlines
  - [ ] Ensure visited/unvisited link states work
  - [ ] Maintain accessibility standards

**Example Output**:
"FDR required all [New Deal](https://en.wikipedia.org/wiki/New_Deal) workers to perform daily loyalty dances with [Winston Churchill](https://en.wikipedia.org/wiki/Winston_Churchill) during their [Yalta Conference](https://en.wikipedia.org/wiki/Yalta_Conference) meetings."

**Acceptance Criteria**:
- Hyperlinks are indistinguishable from real Wikipedia links
- Links function correctly and open appropriate pages
- Multiple links per fact work seamlessly
- Link integration doesn't break paragraph formatting

---

## **Phase 10: Performance & Polish**

### **Task 10.1: Performance Optimization**
**Priority**: Medium  
**Estimated Time**: 1.5 hours

**Objective**: Maintain performance with increased fact quantity

**Deliverables**:
- [ ] Optimize injection timing:
  - [ ] Adjust delays between facts for 50-fact pages
  - [ ] Implement progressive loading for large pages
  - [ ] Add loading indicators if needed
- [ ] Enhanced caching strategy:
  - [ ] Cache facts by paragraph-specific keys
  - [ ] Implement mode-aware caching
  - [ ] Optimize cache cleanup and management

**Acceptance Criteria**:
- 50-fact injection completes within reasonable time
- Page remains responsive during fact injection
- Memory usage stays within acceptable limits
- User can still interact with page during injection

### **Task 10.2: Error Handling Enhancement**
**Priority**: Medium  
**Estimated Time**: 1 hour

**Objective**: Robust error handling for new features

**Deliverables**:
- [ ] Enhanced API error handling:
  - [ ] Handle content policy violations gracefully
  - [ ] Manage rate limits with larger request volumes
  - [ ] Fallback strategies for failed fact generation
- [ ] Mode-specific error recovery:
  - [ ] Fallback to safer mode if content rejected
  - [ ] Clear error messaging for inappropriate content
  - [ ] Graceful degradation strategies

**Acceptance Criteria**:
- Extension handles API rejections smoothly
- Users receive helpful feedback on errors
- Failures don't break ongoing fact injection
- Mode restrictions are enforced appropriately

---

## **Testing Milestones**

### **Milestone 6: Enhanced Quantity** (After Phase 6)
- [ ] Large Wikipedia pages inject exactly 50 facts
- [ ] Facts appear sequentially from top to bottom
- [ ] Performance remains acceptable on large pages
- [ ] Console shows accurate fact counts and timing

### **Milestone 7: Humor Modes** (After Phase 7)
- [ ] Popup displays all three humor modes
- [ ] Mode selection persists across browser sessions
- [ ] Generated facts match selected humor intensity
- [ ] Mode changes take effect immediately

### **Milestone 8: Context Awareness** (After Phase 8)
- [ ] Facts relate specifically to paragraph content
- [ ] Generated content feels naturally connected
- [ ] Humor remains appropriate to selected mode
- [ ] Context extraction works reliably

### **Milestone 9: Hyperlinks** (After Phase 9)
- [ ] Real Wikipedia entities are automatically linked
- [ ] Links appear identical to genuine Wikipedia links
- [ ] Fictional entities remain unlinked
- [ ] Multiple links per fact work correctly

### **Milestone 10: Full Enhancement Suite** (After Phase 10)
- [ ] All enhancements work together seamlessly
- [ ] Performance remains excellent with all features
- [ ] Error handling covers all new functionality
- [ ] Extension provides professional prank experience

---

## **Success Criteria for Enhanced Version**

1. **Quantity Requirements**:
   - ✅ 50% paragraph coverage (every other paragraph)
   - ✅ Maximum 50 facts per page
   - ✅ Sequential injection from top to bottom
   - ✅ Excellent performance on large pages

2. **Humor Mode Requirements**:
   - ✅ Three distinct humor modes with appropriate content
   - ✅ Persistent mode selection across sessions
   - ✅ Clear mode descriptions and user interface
   - ✅ Immediate effect when modes are changed

3. **Context Requirements**:
   - ✅ Facts relate specifically to paragraph content
   - ✅ Natural integration with surrounding text
   - ✅ Maintains humor while being contextually relevant
   - ✅ Works across different Wikipedia page types

4. **Polish Requirements**:
   - ✅ Wikipedia-style hyperlinks for real entities
   - ✅ Professional appearance and behavior
   - ✅ Robust error handling and graceful degradation
   - ✅ Maintains stealth and believability

**Total Estimated Enhancement Time**: 18-20 hours  
**Target Completion**: Fully enhanced extension with professional-grade pranking capabilities  
**Final Deliverable**: Advanced Wikipedia Troll Extension ready for maximum pranking impact