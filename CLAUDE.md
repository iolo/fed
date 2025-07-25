# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**fed** is a bitmap font editor built with modern browser technologies (HTML/JavaScript/CSS). It's a client-side only application with no backend or external dependencies, designed for retro computing font editing.

## Development Commands

Since this is a pure HTML/JS/CSS project with no build system:
- **Development**: Open `index.html` directly in a browser or use a simple HTTP server
- **Testing**: Manual testing in browser (load .fnt files, edit pixels, export)
- **Deployment**: Static file hosting (copy files to web server)

## File Structure

- `index.html` - Main HTML structure with Holy Grail layout
- `fed.css` - Minimalistic styling for layout and components  
- `fed.js` - Complete application logic (FontEditor class)

## Architecture

### Core Components

1. **FontEditor Class** (`fed.js`): Main application controller
   - Font data management and parsing
   - Glyph rendering and editing logic
   - File I/O operations
   - Keyboard and mouse event handling

2. **Layout** (`index.html`/`fed.css`):
   - **Header**: Title + responsive toolbar (📄 New, 📂 Open, 💾 Save, 📤 Export, ℹ️ Font Info, ❓ About)
     - Adaptive: Shows emoji + text on large screens, emoji-only on small screens
   - **Main**: Split view with draggable splitter
     - Desktop: Left/Right split (GlyphBrowser | GlyphEditor) 
     - Mobile Portrait: Top/Bottom split (GlyphBrowser / GlyphEditor)
   - **Footer**: Copyright and links
   - **Modals**: Font Info and Export PNG dialogs

### Key Features Implemented

1. **File Operations**:
   - New: Create empty font
   - Open: Load .fnt/.bin files via file input or drag-drop
   - Open from URL: Load fonts from URLs with query parameters (`?url=...&width=8&height=16&offset=0`)
   - Save: Export as binary .fnt file (Uint8Array download)
   - Export: Generate PNG font sheets with customizable layout

2. **Font Editing**:
   - Variable font dimensions (configurable width/height)
   - Pixel-perfect editing with visual feedback
   - Real-time glyph preview updates
   - Support for fonts with any width (multi-byte rows)

3. **Navigation**:
   - **Arrow keys / HJKL (vim) / WASD (FPS)**: Navigate between glyphs (browse mode) or move pixel cursor (edit mode)
   - **Up/Down keys**: Smart row navigation - moves by actual grid columns (responsive)
   - **Space**: Toggle pixel on/off
   - **Mouse**: Click glyphs/pixels for selection

4. **Zoom Controls**:
   - **+/-**: Zoom in/out current panel (browser in browse mode, editor in edit mode)
   - **Ctrl++/Ctrl+-**: Zoom both panels simultaneously
   - **0**: Reset current panel zoom to 100%
   - **Ctrl+0**: Reset both panels zoom to 100%
   - **F**: Auto-fit current panel (maintains aspect ratio)
   - **Ctrl+F**: Auto-fit both panels
   - **Range**: 0.5x to 4.0x zoom with 0.25x increments

5. **Font Format Support**:
   - Flexible glyph dimensions (8x16, 16x16, etc.)
   - Big-endian bit packing
   - Configurable file offset
   - Auto-detection of glyph count based on file size

### Tested Font Formats

- `eng.fnt`: 256 glyphs, 8x16 pixels (16 bytes per glyph)
- `kor.fnt`: 360 glyphs, 16x16 pixels (32 bytes per glyph, Korean font)

### Design Principles

- Minimalistic UI with retro emoji touches
- Keyboard-first interface for efficient editing
- No external dependencies
- Cross-browser compatibility
- Responsive canvas-based rendering
- Mobile-friendly with portrait orientation support
- Adaptive toolbar for small displays
