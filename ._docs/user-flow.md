# **User Flow Document: Wikipoodia Chrome Extension**

## **Overview**

This document outlines the user journeys and interaction flows for the Wikipoodia Chrome Extension, covering both the Prankster (installer) and Unsuspecting Friend (target) personas. The flows detail how users navigate through different features and how the application components interconnect.

---

## **1. Primary User Flows**

### **1.1 Prankster Journey - Initial Setup Flow**

**Objective:** Install and configure the extension for pranking

```
Start → Extension Installation → First Launch → Configuration → Deployment
```

#### **Step-by-Step Flow:**

1. **Extension Discovery & Installation**
   - Prankster discovers extension (Chrome Web Store or sideloading)
   - Clicks "Add to Chrome"
   - Grants required permissions:
     - `activeTab` - access to current tab information
     - `scripting` - inject content scripts
     - `storage` - save prank settings
     - `host_permissions` - Wikipedia domains + OpenAI API access
   - Extension installs successfully

2. **First Launch & Setup**
   - Extension icon appears in Chrome toolbar
   - Prankster clicks extension icon → `popup.html` opens
   - **Initial State:** Prank toggle is OFF by default
   - Status displays: "Prank: Off"
   - Clear instructions visible (optional onboarding)

3. **Configuration**
   - Prankster enables prank via toggle switch
   - State changes to "Prank: On"
   - Settings saved via `chrome.storage.sync`
   - **Success feedback:** Visual confirmation of enabled state

4. **Deployment**
   - Prankster leaves friend's computer
   - Extension runs silently in background
   - Ready to activate on Wikipedia visits

---

### **1.2 Unsuspecting Friend Journey - Prank Experience Flow**

**Objective:** Experience the prank while browsing Wikipedia normally

```
Wikipedia Visit → Content Loading → AI Fact Injection → Discovery → Reaction
```

#### **Step-by-Step Flow:**

1. **Normal Wikipedia Browsing**
   - Friend opens browser and navigates to any Wikipedia page
   - Page begins normal loading process
   - **Trigger:** `content.js` activates on Wikipedia domains

2. **Background Processing**
   - Content script checks prank status via `chrome.storage.sync`
   - **Decision Point:** 
     - If prank OFF → Normal Wikipedia experience
     - If prank ON → Continue to injection process

3. **Content Analysis & Injection**
   - Extension identifies paragraph elements (`<p>`)
   - Randomly selects ~30% of paragraphs for modification
   - Extracts page context (title/subject) for AI prompting
   - **AI Processing:**
     - Calls OpenAI API with contextual prompt
     - Generates absurdly relevant fake facts
     - Caches results for session performance
   - Seamlessly injects facts into selected paragraphs

4. **Discovery & Reaction**
   - Friend reads modified content
   - **Initial Response:** Facts seem plausible at first glance
   - **Recognition:** Gradually realizes absurdity of information
   - **Emotional Journey:** Confusion → Suspicion → Realization → Laughter

---

### **1.3 Prankster Journey - Management Flow**

**Objective:** Monitor and control the prank after deployment

```
Status Check → Toggle Control → Reversion (if needed)
```

#### **Step-by-Step Flow:**

1. **Status Monitoring**
   - Prankster can check extension status anytime
   - Clicks extension icon → Current state displayed
   - Visual confirmation of prank activity

2. **Toggle Control**
   - **Enable Prank:**
     - Switch toggle to ON
     - State persists across browser sessions
     - Immediate activation on Wikipedia pages
   - **Disable Prank:**
     - Switch toggle to OFF
     - Triggers page reload on active Wikipedia tabs
     - All injected content reverted to original

3. **Reversion Process**
   - When disabled: Automatic page refresh
   - Clean state restoration
   - No trace of modified content remains

---

## **2. Feature Interconnection Map**

### **2.1 Core Component Relationships**

```
Extension Popup (UI) ←→ Background Storage ←→ Content Script ←→ OpenAI API
        ↓                       ↓                    ↓              ↓
   Toggle Control         State Persistence    Content Injection   Fact Generation
```

### **2.2 Data Flow Architecture**

1. **Settings Flow:**
   - Popup UI → `chrome.storage.sync` → Content Script
   - Bidirectional state synchronization

2. **Content Modification Flow:**
   - Wikipedia Page Load → Content Script Activation → Storage Check → Conditional Processing

3. **AI Integration Flow:**
   - Page Context Extraction → OpenAI API Call → Fact Generation → Caching → Content Injection

---

## **3. Alternative User Flows**

### **3.1 Error Handling Flows**

#### **API Failure Flow:**
```
Content Injection Attempt → OpenAI API Call → Failure Response → Graceful Degradation → Skip Injection
```

#### **Permission Denial Flow:**
```
Extension Installation → Permission Request → User Denial → Limited Functionality Warning → Manual Permission Grant
```

### **3.2 Discovery Flow (Prank Revealed)**

```
Suspicious Content → Manual Investigation → Extension Discovery → Confrontation → Shared Laughter
```

#### **Step-by-Step:**
1. Friend notices particularly absurd "fact"
2. Searches for verification online
3. Discovers information doesn't exist
4. Investigates browser extensions
5. Finds Wikipoodia extension
6. Confronts prankster
7. Shared amusement and explanation

---

## **4. Technical User Flow Considerations**

### **4.1 Performance Optimization Points**

- **Caching Strategy:** Generated facts cached per page session
- **Limited Injection:** Only 30% of paragraphs modified
- **Asynchronous Processing:** Non-blocking API calls

### **4.2 Security & Privacy Flows**

- **API Key Management:** Secure handling in development environment
- **Data Persistence:** Local storage only, no external data transmission
- **Content Isolation:** Extension operates within browser sandbox

### **4.3 State Management Flows**

- **Cross-Session Persistence:** Settings survive browser restarts
- **Tab-Specific Behavior:** Each tab processed independently
- **State Synchronization:** Consistent state across all browser instances

---

## **5. User Experience Principles**

### **5.1 For Pranksters:**
- **Simplicity:** One-click toggle operation
- **Clarity:** Clear status indication
- **Control:** Easy enable/disable functionality
- **Stealth:** Minimal visible footprint once deployed

### **5.2 For Targets:**
- **Seamlessness:** Injected content feels natural
- **Believability:** Initial plausibility before absurdity
- **Surprise:** Unexpected and delightful discovery
- **Reversibility:** Clean restoration when disabled

---

## **6. Future Enhancement Flows**

### **6.1 Advanced Configuration Flow**
```
Popup → Advanced Settings → Category Selection → Custom Prompts → Apply Settings
```

### **6.2 Targeted Prank Flow**
```
Page Selection → Subject Specification → Custom Fact Types → Deployment
```

### **6.3 Analytics Flow**
```
Prank Activity → Usage Tracking → Success Metrics → Feedback Collection
```

---

This user flow document serves as the foundation for designing the extension's architecture, ensuring smooth user experiences for both pranksters and their unsuspecting friends while maintaining the core entertainment value of the application. 