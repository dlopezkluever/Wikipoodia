# Wikipoodia Chrome Extension

A hilarious Chrome extension that injects AI-generated fake facts into Wikipedia articles for harmless pranking. Transform any Wikipedia page into a comedy goldmine!

## 🚀 Quick Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Wikipoodia
```

### 2. Add Your AI API Key
1. Open `background/background.js`
2. Find line 24 with `API_KEY: 'Enter your OpenAI API key here'`
3. Replace with your actual API key:
   ```javascript
   API_KEY: 'sk-your-actual-openai-key-here'
   ```

**Alternative AI Providers:**
- For **Google Gemini**: Update `OPENAI_ENDPOINT` and modify the API call structure
- For **Claude**: Update endpoint and adapt the request format
- For **Local AI**: Point to your local endpoint (e.g., `http://localhost:11434` for Ollama)

### 3. Install in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `Wiki-Troll` folder you just cloned
5. The extension icon will appear in your Chrome toolbar! 🎉

## 🎯 How to Use

### Start the Prank
1. **Click the extension icon** in Chrome toolbar
2. **Toggle the switch to "ON"**
3. **Select a humor mode** (see modes below)
4. **Navigate to any Wikipedia page**
5. **Watch the magic happen!** Fake facts will be injected automatically

### Stop the Prank
1. **Click the extension icon**
2. **Toggle the switch to "OFF"**
3. **All Wikipedia tabs will reload** to their original state

## 🎭 Humor Modes

Choose your level of chaos:

### 🟢 **Goofy Mode**
- **Family-friendly and workplace-safe**
- Silly, whimsical scenarios with innocent humor
- Perfect for pranking parents, teachers, or conservative friends
- Example: *"Einstein secretly trained circus elephants to solve math problems using peanuts as calculators."*

### 🟡 **Outrageous Mode** 
- **PG-13 level humor with innuendo**
- Embarrassing, bizarre, and ridiculously absurd scenarios
- Great for college friends and people who enjoy crude humor
- Example: *"Napoleon was known to practice his battle strategies while naked in a bathtub filled with French cheese."*

### 🔴 **Obscene Mode**
- **Adult humor with explicit content**
- NSFW scenarios, crude language, and shocking situations
- Only for close friends who appreciate raunchy comedy
- ⚠️ **Warning**: Contains explicit language and sexual references

### 🔄 **Utter Misinformation Mode**
- **Complete opposite of reality**
- Flips every fact to its reverse (dates, locations, political affiliations)
- Turns historical truth upside down
- Example: *"The American Civil War was actually fought in Canada between 1823-1824."*

### 🖤 **Evil Mode**
- **Dark, sinister, and villainous facts**
- Paints everyone as having secret evil agendas and conspiracies
- Adds malicious undertones to innocent activities
- Example: *"Mother Teresa secretly ran an underground fight club for orphans to fund her charitable operations."*

## ⚡ How It Works

1. **🔍 Page Detection**: Automatically activates on Wikipedia pages
2. **📝 Content Analysis**: Identifies suitable paragraphs (100+ characters)
3. **🎯 Smart Selection**: Chooses every other qualifying paragraph (up to 50 max)
4. **🤖 AI Generation**: Sends context to AI to create relevant fake facts
5. **💉 Seamless Injection**: Inserts facts naturally into paragraphs
6. **⚡ Performance**: Uses intelligent caching for lightning-fast injection
7. **🔗 Format Preservation**: Keeps all hyperlinks, citations, and formatting intact

## 🛠️ Technical Features

- **✅ Manifest V3 Compliant**: Latest Chrome extension standards
- **🚀 Lightning Fast**: 100ms delays for cached facts, 500ms for new ones
- **🧠 Smart Caching**: Remembers generated facts for 24 hours
- **🎯 Duplicate Prevention**: Never injects the same fact twice
- **🔗 Format Safe**: Preserves all Wikipedia links and formatting
- **📱 Cross-Tab Sync**: Settings work across all browser tabs
- **🔒 Privacy First**: No data collection or user tracking

## 🎮 Pro Tips

- **Test First**: Try "Goofy" mode on yourself before pranking others
- **Know Your Audience**: Match the humor mode to your target's sense of humor
- **Timing**: Works best when the victim is casually browsing Wikipedia
- **Clean Up**: Always toggle off when you're done pranking
- **Be Sneaky**: The extension works silently with no visual indicators

## 🔧 Troubleshooting

**Extension not working?**
- Check that your API key is valid and has credits
- Ensure Developer mode is enabled in Chrome
- Reload the extension in `chrome://extensions/`

**Facts not appearing?**
- Make sure the prank is toggled "ON"
- Try refreshing the Wikipedia page
- Check browser console for error messages

**Too slow?**
- First-time use is slower (building cache)
- Subsequent visits are much faster
- Check your internet connection

## ⚠️ Important Notes

- **🎭 For Fun Only**: This is for harmless pranking among friends
- **🤝 Get Consent**: Don't use this maliciously or without permission
- **📚 Educational**: Helps people think critically about information
- **🔒 Private**: No data is collected or stored remotely
- **💰 API Costs**: You'll pay for OpenAI API usage (usually pennies per session)

## 🛡️ Privacy & Security

- **No tracking**: We don't collect any user data
- **Local storage**: Settings stored only in your browser
- **API only**: External calls only to your chosen AI provider
- **Sandbox safe**: Operates within Chrome's security constraints

## 📝 License 

This project is for educational and entertainment purposes. Use responsibly!

## ⚡ About

This is a LopezKlu CLASSIC. To check out more of my work go to Lopezklu.vercel.app, lopezklu.myportfolio.com, or here on Github github.com/dlopekluever. Contact me: lopezklu@yahoo.com 

MVP built in 3 hours as part of an Gauntlet AI X AMP 3-Hour Hackathon.
---

**Ready to become the ultimate Wikipedia prankster? Get started now! 🎯** 