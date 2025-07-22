# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a bitmap font editor built with modern browser technologies (HTML/JavaScript/CSS). It's a client-side only application with no backend or external dependencies.

## Development Commands

Since this is a pure HTML/JS/CSS project with no build system:
- **Development**: Open `index.html` directly in a browser or use a simple HTTP server
- **Testing**: Manual testing in browser
- **Deployment**: Static file hosting (copy files to web server)

## Architecture

### Core Components
Based on the project specification, the application follows these architectural patterns:

1. **Holy Grail Layout**: Full viewport layout with fixed header/footer and flexible main content
   - Header: Title and toolbar (New, Open, Save, Export, Font Info, About)
   - Main: Split between GlyphBrowser (left) and GlyphEditor (right) with draggable splitter
   - Footer: Copyright and links

2. **Main Features**:
   - **GlyphBrowser**: Grid view of all glyphs with keyboard navigation (arrows, ENTER, DEL)
   - **GlyphEditor**: Pixel-level editing with keyboard controls (arrows, SPACE, ENTER, ESC)
   - **File Operations**: New, Open (file input), Save (download), Export (.bin, .png)
   - **Font Info Modal**: Configure offset, width, height parameters

### Design Principles
- Minimalistic approach with no visual effects
- Keyboard-driven interface for efficient editing
- No scrollbars except in GlyphBrowser and GlyphEditor
- Drag and drop file opening support

### Font Format
- Default: 8x8 pixel glyphs
- Configurable width/height
- Binary format with configurable offset
- Count calculation: (filesize - offset) / (((width/8) + 1) * height)

## File Structure
Currently only contains README.md - implementation files will be created as HTML/JS/CSS files following the specification.