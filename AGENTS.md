# AGENTS.md

## Project overview
fed is a client-side bitmap font editor built with plain HTML/CSS/JS. There is no build system or backend; everything runs in the browser.

## Development commands
- Development: open `index.html` directly in a browser or run a simple HTTP server.
- Testing: manual testing in the browser (load .fnt files, edit pixels, export).
- Deployment: static file hosting.

## Key files
- `index.html` - Main UI layout and modals
- `fed.css` - Styles and responsive layout rules
- `fed.js` - Application logic (FontEditor class)
- `gallery.html` - Font gallery that reads `fonts.json`
- `fonts.json` - Font metadata and URLs for the gallery

## Architecture
### Core components
- `fed.js`: FontEditor class that manages font data, rendering, input, and file I/O.
- `index.html`/`fed.css`: Holy-grail layout with header, split main view, and footer. Portrait mode switches to vertical split.
- Modals: Font Info, Export PNG, About.

### Key features
1. File operations
   - New: create empty font
   - Open: load .fnt/.bin via file input or drag-drop
   - Open from URL: `?url=...&width=8&height=16&offset=0&reversed=1`
   - Save: export binary .fnt file
   - Export: generate PNG font sheets with configurable layout
2. Font editing
   - Configurable width/height
   - Pixel editing with immediate preview updates
   - Supports any width (multi-byte rows)
3. Navigation
   - Arrow keys / HJKL / WASD: navigate glyphs (browse mode) or move pixel cursor (edit mode)
   - Up/Down use actual grid columns for row jumps
   - Space: toggle pixel
   - Insert / I: insert blank glyph before current (browse mode)
   - Delete / X: delete current glyph (browse mode, keeps at least one)
4. Zoom controls
   - +/-: zoom active panel
   - Ctrl++/Ctrl+-: zoom both panels
   - 0: reset current panel zoom
   - Ctrl+0: reset both panels
   - F: auto-fit current panel
   - Ctrl+F: auto-fit both panels
   - Range: 0.5x to 4.0x in 0.25x steps
5. Font format support
   - Big-endian bit packing
   - Configurable file offset
   - Glyph count derived from file size

## Tested font formats
- `eng.fnt`: 256 glyphs, 8x16 pixels (16 bytes per glyph)
- `kor.fnt`: 360 glyphs, 16x16 pixels (32 bytes per glyph)

## Font gallery
- `gallery.html` reads `fonts.json` and links directly into the editor with correct parameters.
- Uses the same retro styling as the main editor.

## Implementation notes
- Keep the UI minimal and retro-styled; avoid dependencies.
- Font data is parsed from raw bytes; changes to width/height/offset affect parsing and glyph count.
- For `gallery.html`, use a local HTTP server so `fonts.json` loads without file:// restrictions.
