# Extension Icons

## Icon Requirements

The Chrome extension requires PNG icons in the following sizes:
- `icon-16.png` - 16x16 pixels (toolbar icon)
- `icon-48.png` - 48x48 pixels (extension management page)
- `icon-128.png` - 128x128 pixels (Chrome Web Store)

## Current Status

A base SVG icon (`icon.svg`) has been created with a playful design that represents the extension's prank nature:
- Blue background representing trust/Wikipedia
- White book representing Wikipedia pages
- Golden mischievous character with crown representing the troll/prank element
- Sparkle effects for added whimsy

## Converting to PNG

To create the required PNG files from the SVG:

### Option 1: Online Converter
1. Use an online SVG to PNG converter like https://convertio.co/svg-png/
2. Upload `icon.svg`
3. Set output sizes to 16x16, 48x48, and 128x128 pixels
4. Download and rename files accordingly

### Option 2: Command Line (if you have Inkscape installed)
```bash
inkscape icon.svg --export-png=icon-16.png --export-width=16 --export-height=16
inkscape icon.svg --export-png=icon-48.png --export-width=48 --export-height=48
inkscape icon.svg --export-png=icon-128.png --export-width=128 --export-height=128
```

### Option 3: Design Software
Open `icon.svg` in any design software that supports SVG (Figma, Adobe Illustrator, etc.) and export as PNG in the required sizes.

## Design Notes

The icon design balances:
- **Trustworthiness**: Blue background and clean book design
- **Playfulness**: Mischievous character and sparkles
- **Recognition**: Clear Wikipedia book reference
- **Scalability**: Simple shapes that work at small sizes 