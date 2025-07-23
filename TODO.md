# TODO.md

## ✅ COMPLETED - Documentation Updates

1. **Font Info Formula Error** - FIXED
   - ✅ Corrected README.md formula: `count = (filesize - offset) / (ceil(width/8) * height)`
   - Formula now matches actual implementation

2. **Default Font Dimensions** - STANDARDIZED  
   - ✅ Updated README.md to use 8x16 default (matching implementation and CLAUDE.md)
   - All documents now consistent

3. **Export Features Documentation** - UPDATED
   - ✅ Clarified Save as `.fnt/.bin (without header)` in README.md
   - ✅ Documented advanced PNG export options in README.md

4. **Keyboard Navigation** - CORRECTED
   - ✅ Removed incorrect "Shift+Arrow" reference from CLAUDE.md
   - ✅ Clarified arrow keys work in both browse and edit modes

5. **Advanced Export Options** - DOCUMENTED
   - ✅ Added PNG export configuration details to README.md
   - Now documents: scale, gaps, colors, glyphs per row options

## 🔄 REMAINING IMPLEMENTATION TASKS

6. **Confirm Dialog on Modified** - NOT IMPLEMENTED
   - README.md mentions "confirm if modified since saved" for New/Open
   - Could implement dirty state tracking and confirmation dialogs
   - Priority: Low (nice-to-have feature)

7. **Double Click Behavior** - REMOVED
   - ✅ Removed redundant "Double Click glyph to select" from README.md
   - Feature unnecessary with current Enter/Escape edit mode system

## 🎯 NEXT STEPS (Optional)

1. Implement unsaved changes confirmation dialogs
2. Add testing examples section to README.md
3. Consider architectural overview in user documentation
4. **URL Loading Feature** - Load fonts from URLs
   - Add URL input field or query parameter support
   - Try direct fetch first, fallback to CORS proxy (allorigins.win) if needed
   - Graceful error handling for CORS-blocked requests
   - Support for GitHub raw URLs, gists, etc.
5. **Mouse Drag Drawing** - Draw continuous pixels in glyph editor
   - Enable drawing by dragging mouse while button pressed
   - Improve mobile/touch device usability
   - Add mousedown/mousemove/mouseup event handlers to pixel elements
   - Track drawing state to toggle pixels continuously while dragging