# AGENTS.md

## Project overview
fed is a client-side bitmap font editor built with plain HTML/CSS/JS. There is no build system or backend; everything runs in the browser.

## Key files
- `index.html` - Main UI layout and modals
- `fed.css` - Styles and responsive layout rules
- `fed.js` - Application logic (FontEditor class)
- `gallery.html` - Font gallery that reads `fonts.json`
- `fonts.json` - Font metadata and URLs for the gallery

## Development workflow
- Open `index.html` directly in a browser for the editor.
- For `gallery.html`, use a simple local HTTP server so `fonts.json` loads without file:// restrictions.
- There are no automated tests; validate changes manually in a browser.

## Implementation notes
- Keep the UI minimal and retro-styled; avoid adding dependencies.
- Font data is parsed from raw bytes; changes to width/height/offset affect parsing and glyph count.
- The editor should remain usable on small screens (portrait mode rules live in `fed.css`).
