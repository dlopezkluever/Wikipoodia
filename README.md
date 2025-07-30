# Wikipoodia Chrome Extension

A humorous Chrome extension that injects AI-generated fake facts into Wikipedia articles for harmless pranking purposes.

## Features

- **AI-Powered Fact Generation**: Uses OpenAI's GPT-3.5-turbo to create contextually relevant but absurdly funny fake facts
- **Seamless Integration**: Facts blend naturally into Wikipedia articles
- **Simple Toggle Control**: Easy on/off switch via extension popup
- **Smart Targeting**: Randomly selects ~30% of paragraphs for modification
- **Clean Reversion**: Complete removal of all modifications when disabled

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The Wikipoodia icon will appear in your Chrome toolbar

## Usage

### For Pranksters:
1. Click the extension icon in Chrome toolbar
2. Toggle the prank "On" 
3. Leave your friend's computer
4. Watch the magic happen when they browse Wikipedia!

### To Disable:
1. Click the extension icon
2. Toggle the prank "Off"
3. All modified pages will automatically reload to their original state

## How It Works

1. **Detection**: Extension activates only on Wikipedia pages
2. **Analysis**: Identifies article paragraphs and extracts page context
3. **Generation**: Sends context to OpenAI API to generate absurd but relevant facts
4. **Injection**: Seamlessly inserts facts into selected paragraphs
5. **Caching**: Stores generated facts for better performance

## Technical Details

- **Manifest V3**: Compliant with latest Chrome extension standards
- **OpenAI Integration**: Real-time fact generation via GPT-3.5-turbo
- **Storage**: Uses Chrome's sync storage for settings persistence
- **Performance**: Minimal impact on page load times

## Development

This extension is built with:
- HTML5, CSS3 (with Tailwind CSS), JavaScript (ES6+)
- Chrome Extension APIs (Manifest V3)
- OpenAI API integration

## Privacy & Security

- No user data collection or tracking
- API calls only to OpenAI for fact generation
- Local storage only for extension settings
- Operates within Chrome's security sandbox

## Disclaimer

This extension is intended for harmless pranking among friends. Please use responsibly and with consent. Always respect others' privacy and computer usage.

## License

This project is for educational and entertainment purposes. 