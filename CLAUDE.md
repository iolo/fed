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
   - **Header**: Title + toolbar (📄 New, 📂 Open, 💾 Save, 📤 Export, ℹ️ Font Info, ❓ About)
   - **Main**: Split view with draggable splitter
     - Left: GlyphBrowser (grid of all glyphs)
     - Right: GlyphEditor (pixel-level editing)
   - **Footer**: Copyright and links
   - **Modals**: Font Info and Export PNG dialogs

### Key Features Implemented

1. **File Operations**:
   - New: Create empty font
   - Open: Load .fnt/.bin files via file input or drag-drop
   - Save: Export as binary .fnt file (Uint8Array download)
   - Export: Generate PNG font sheets with customizable layout

2. **Font Editing**:
   - Variable font dimensions (configurable width/height)
   - Pixel-perfect editing with visual feedback
   - Real-time glyph preview updates
   - Support for fonts with any width (multi-byte rows)

3. **Navigation**:
   - **Arrow keys**: Navigate between glyphs
   - **Shift+Arrow keys**: Move pixel cursor within glyph
   - **Space**: Toggle pixel on/off
   - **Mouse**: Click glyphs/pixels for selection

4. **Font Format Support**:
   - Flexible glyph dimensions (8x16, 16x16, etc.)
   - Big-endian bit packing
   - Configurable file offset
   - Auto-detection of glyph count based on file size

### Tested Font Formats

- `eng.fnt`: 256 glyphs, 8x16 pixels (16 bytes per glyph)
- `sans.fnt`: 360 glyphs, 16x16 pixels (32 bytes per glyph, Korean font)

### Design Principles

- Minimalistic UI with retro emoji touches
- Keyboard-first interface for efficient editing
- No external dependencies
- Cross-browser compatibility
- Responsive canvas-based rendering