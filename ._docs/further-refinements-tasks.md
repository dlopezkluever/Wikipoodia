# Further Refinements Tasks

## Task 1: Add Two New Humor Modes

### Overview
Add "Utter Misinfo" and "Evil" as 4th and 5th humor modes alongside existing Goofy, Outrageous, and Obscene modes.

### Implementation Details

#### A. Utter Misinfo
- **Purpose**: Flip all facts to their complete opposite
- **Examples**: 
  - England → France (geographic flipping)
  - Republican → Democrat (political flipping)
  - Any factual information gets reversed
- **Technical Approach**: 
  - Use AI to read Wikipedia content and generate opposite facts
  - Maintain existing functionality - don't break current system
  - Simple content reversal, not overly complex logic

#### B. Evil
- **Purpose**: Make all facts dark, sinister, and malicious
- **Content Intensity**: Very dark content including:
  - Secret meetings
  - Hidden agendas  
  - Conspiracies
  - Criminal activities
  - Evil schemes
  - Mischievous undertones
- **Tone**: Paint people/events in an evil, villainous light

#### Technical Requirements
- **UI Integration**: Same selection pattern as existing humor modes
- **User Experience**: Click one mode to select it as current active mode
- **Backend**: Extend existing humor mode system in both content script and background script
- **Prompt Engineering**: Create new system prompts for each mode that generate appropriate content


## Implementation Summary

1. **Phase 1**: Add new humor modes (Utter Misinfo + Evil)
   - Extend constants and configuration
   - Update background script prompts
   - Test functionality with existing UI


## Success Criteria

### Functional Requirements
- ✅ 5 total humor modes working (Goofy, Outrageous, Obscene, Utter Misinfo, Evil)
- ✅ Utter Misinfo generates factually opposite content
- ✅ Evil mode generates dark, sinister content
- ✅ No regression in existing functionality

