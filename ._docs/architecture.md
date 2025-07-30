# **Architecture Document: Wikipoodia Chrome Extension**

## **Overview**

This document defines the technical architecture, project structure, and technology stack for the Wikipoodia Chrome Extension. The extension follows Chrome Extension Manifest V3 standards and uses modern web technologies to deliver a seamless pranking experience.

---

## **1. Technology Stack**

### **1.1 Core Technologies**
- **HTML5**: Structure for extension popup and any additional UI components
- **CSS3 + Tailwind CSS**: Styling framework for modern, responsive UI design
- **JavaScript (ES6+)**: Core functionality, API integration, and DOM manipulation
- **Chrome Extension APIs**: Manifest V3 compliant extension capabilities

### **1.2 External Dependencies**
- **OpenAI API**: AI-powered fact generation (`gpt-3.5-turbo` model)
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Chrome Extension APIs**: Storage, Scripting, ActiveTab, Host Permissions

### **1.3 Development Environment**
- **Target Platform**: Chrome Browser (Manifest V3)
- **API Integration**: Client-side fetch requests to OpenAI API
- **Storage**: Chrome's native `chrome.storage.sync` API
- **Permissions**: Minimum required permissions for security

---

## **2. Project Structure**

### **2.1 File Organization**

```
wikipoodia-extension/
├── manifest.json                 # Extension configuration (Manifest V3)
├── icons/                        # Extension icons (16x16, 48x48, 128x128)
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── popup/                        # Extension popup interface
│   ├── popup.html               # Popup UI structure
│   ├── popup.css               # Popup styling (Tailwind-based)
│   └── popup.js                # Popup functionality & toggle logic
├── content/                      # Content script for Wikipedia injection
│   └── content.js              # Main content script for fact injection
├── background/                   # Service worker for extension management
│   └── background.js           # Background script for tab management
├── utils/                        # Shared utilities and helpers
│   ├── api.js                  # OpenAI API integration utilities
│   ├── storage.js              # Chrome storage wrapper functions
│   └── constants.js            # Application constants and configuration
├── styles/                       # Additional CSS resources
│   └── tailwind.css            # Tailwind CSS build output
└── README.md                     # Installation and usage instructions
```

### **2.2 Key Configuration Files**

#### **manifest.json** (Manifest V3)
```json
{
  "manifest_version": 3,
  "name": "Wikipoodia",
  "version": "1.0.0",
  "description": "Inject hilarious fake facts into Wikipedia articles",
  "permissions": [
    "activeTab",
    "scripting", 
    "storage"
  ],
  "host_permissions": [
    "*://*.wikipedia.org/*",
    "https://api.openai.com/*"
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["*://*.wikipedia.org/*"],
      "js": ["content/content.js"],
      "run_at": "document_idle"
    }
  ],
  "background": {
    "service_worker": "background/background.js"
  }
}
```

---

## **3. Component Architecture**

### **3.1 Core Components**

#### **A. Extension Popup (`popup/`)**
**Responsibility**: User interface for prank control

- **popup.html**: Clean, minimal UI with toggle switch
- **popup.css**: Tailwind-based responsive styling
- **popup.js**: Toggle logic, state management, user feedback

**Key Features**:
- Toggle switch for prank enable/disable
- Visual status indicator ("Prank: On/Off")
- State persistence across browser sessions
- Success/error feedback mechanisms

#### **B. Content Script (`content/`)**
**Responsibility**: Wikipedia page modification and AI integration

- **content.js**: Main injection logic, AI API calls, DOM manipulation

**Key Features**:
- Wikipedia page detection and analysis
- Paragraph element identification and selection (30% random)
- Context extraction for AI prompting
- OpenAI API integration for fact generation
- Seamless content injection into existing paragraphs
- Fact caching for performance optimization

#### **C. Background Service Worker (`background/`)**
**Responsibility**: Extension lifecycle and tab management

- **background.js**: Extension state management, tab reload coordination

**Key Features**:
- Extension installation/update handling
- Tab reload triggering when prank disabled
- Cross-tab state synchronization
- Error logging and recovery

#### **D. Utility Modules (`utils/`)**
**Responsibility**: Shared functionality and API integrations

- **api.js**: OpenAI API wrapper functions
- **storage.js**: Chrome storage abstraction layer
- **constants.js**: Configuration constants and API endpoints

---

### **3.2 Data Flow Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Popup UI      │◄──►│  Chrome Storage │◄──►│  Content Script │
│   (popup.js)    │    │ (storage.sync)  │    │  (content.js)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▼
         │                       │              ┌─────────────────┐
         │                       │              │   OpenAI API    │
         │                       │              │ (Fact Generator)│
         │                       │              └─────────────────┘
         ▼                       ▼                       ▲
┌─────────────────┐    ┌─────────────────┐              │
│ Background SW   │    │   Wikipedia     │              │
│ (background.js) │    │     Page        │◄─────────────┘
└─────────────────┘    └─────────────────┘
```

---

## **4. Technical Implementation Details**

### **4.1 Chrome Extension APIs Usage**

#### **Permissions Required**:
- `activeTab`: Access current tab information for context
- `scripting`: Inject content scripts into Wikipedia pages
- `storage`: Persist prank enable/disable state
- `host_permissions`: Wikipedia domains + OpenAI API access

#### **Storage Strategy**:
```javascript
// State persistence using chrome.storage.sync
const STORAGE_KEYS = {
  PRANK_ENABLED: 'prankEnabled',
  CACHE_PREFIX: 'factCache_',
  LAST_CLEANUP: 'lastCacheCleanup'
};
```

### **4.2 Content Script Implementation**

#### **Page Modification Strategy**:
1. **Element Selection**: Target `<p>` tags within article content
2. **Random Sampling**: Select ~30% of paragraphs to avoid overwhelming
3. **Context Extraction**: Parse page title and first paragraph for AI context
4. **Injection Points**: Insert facts between sentences or as additional sentences

#### **AI Integration Flow**:
```javascript
// Simplified content script flow
async function injectFakeFacts() {
  const isEnabled = await checkPrankStatus();
  if (!isEnabled) return;
  
  const paragraphs = selectRandomParagraphs();
  const pageContext = extractPageContext();
  
  for (const paragraph of paragraphs) {
    const fact = await generateFact(pageContext);
    injectFactIntoParagraph(paragraph, fact);
  }
}
```

### **4.3 API Integration Architecture**

#### **OpenAI API Integration**:
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Authentication**: Bearer token with API key (`YOUR_OPENAI_API_KEY_HERE`) in request headers
- **Request Format**: JSON with messages array for contextual prompts
- **Response Handling**: Extract generated facts from choices array, error handling
- **Caching Strategy**: Session-based caching to minimize API calls

#### **Error Handling Strategy**:
- API call failures: Graceful degradation (skip injection)
- Network issues: Retry logic with exponential backoff
- Rate limiting: Respect API limits with request queuing
- Malformed responses: Validation and fallback mechanisms

---

## **5. Performance Optimization**

### **5.1 Content Script Optimization**
- **Asynchronous Processing**: Non-blocking API calls
- **Limited DOM Manipulation**: Target only 30% of paragraphs
- **Efficient Caching**: In-memory cache for generated facts
- **Debounced Execution**: Prevent multiple simultaneous injections

### **5.2 Memory Management**
- **Cache Expiration**: Clear cached facts after session ends
- **DOM References**: Minimal DOM node retention
- **Event Listener Cleanup**: Proper cleanup on extension disable

### **5.3 Network Optimization**
- **Batch API Requests**: Group multiple fact generations when possible
- **Request Compression**: Minimize payload size
- **Connection Reuse**: Leverage HTTP/2 connection pooling

---

## **6. Security Considerations**

### **6.1 API Security**
- **API Key Protection**: Secure handling in development environment
- **Request Validation**: Sanitize all API request data
- **Response Validation**: Verify API response format and content
- **Rate Limiting**: Respect API usage limits

### **6.2 Content Security**
- **Content Sanitization**: Escape injected HTML content
- **XSS Prevention**: No direct HTML injection, text-only modifications
- **Permission Minimization**: Request only necessary permissions
- **Sandbox Isolation**: Extension operates within Chrome's security sandbox

### **6.3 Privacy Protection**
- **Local Storage Only**: No external data transmission except API calls
- **No User Tracking**: No analytics or user behavior tracking
- **Minimal Data Collection**: Only store necessary configuration data

---

## **7. Development Workflow**

### **7.1 Build Process**
1. **CSS Compilation**: Build Tailwind CSS for production
2. **JavaScript Bundling**: Concatenate and minify JS modules if needed
3. **Asset Optimization**: Compress icons and images
4. **Manifest Validation**: Ensure Manifest V3 compliance

### **7.2 Testing Strategy**
- **Unit Testing**: Individual component functionality
- **Integration Testing**: Chrome extension API interactions
- **Manual Testing**: Real Wikipedia page testing
- **Cross-browser Compatibility**: Chrome version compatibility testing

### **7.3 Deployment Process**
- **Development**: Local unpacked extension loading
- **Staging**: Internal testing with limited Wikipedia pages
- **Production**: Chrome Web Store submission (future consideration)

---

## **8. Future Architecture Considerations**

### **8.1 Scalability Enhancements**
- **Background Processing**: Move heavy computations to service worker
- **Advanced Caching**: Implement persistent cache with TTL
- **API Optimization**: Implement request batching and intelligent caching

### **8.2 Feature Extensions**
- **Settings Panel**: Advanced configuration UI
- **Multiple AI Providers**: Support for alternative AI APIs
- **Custom Prompts**: User-defined fact generation prompts
- **Analytics Dashboard**: Usage statistics and prank effectiveness metrics

### **8.3 Distribution Architecture**
- **API Key Management**: User-provided API key input system
- **Proxy Server**: Server-side API key management for security
- **Auto-updates**: Chrome Web Store automatic update mechanism

---

This architecture document provides the foundation for building a robust, performant, and secure Wikipoodia Chrome Extension that delivers an entertaining user experience while maintaining technical excellence and security standards. 