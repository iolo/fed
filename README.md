fed
===

Bitmap Font Editor

## Tech Stack

- modern browser html/javascript/css
- no backend
- no dependencies

## Manifesto

- Keep it simple, minimalistic
- No eye candy(visual effect)

## Features

- New/Open/Save bitmap fonts (.fnt/.bin) with configurable font info
- Open fonts from URL using query params (`url`, `width`, `height`, `offset`, `reversed`)
- Export PNG font sheets (grid, scale, gaps, colors)
- Browse glyphs in a zoomable grid and edit pixels in a zoomable editor

## Keyboard Shortcuts

- Mode
  - Enter: start editing current glyph
  - Esc: stop editing, return to browser
- Browse mode (glyph browser)
  - Arrow keys / HJKL / WASD: move current glyph
  - Shift + Arrow keys: extend selection range
  - Shift + Click: range select with mouse
  - Ctrl/Cmd + Click: toggle selection
  - Insert / I: insert blank glyph before current
  - Delete / X: delete current glyph
  - Ctrl/Cmd + C: copy selected glyphs
  - Ctrl/Cmd + X: cut selected glyphs
  - Ctrl/Cmd + V: paste clipboard starting at current glyph
- Edit mode (glyph editor)
  - Arrow keys / HJKL / WASD: move pixel cursor
  - Space: toggle pixel
- Zoom
  - + / -: zoom active panel
  - Ctrl/Cmd + + / -: zoom both panels
  - 0: reset active panel zoom
  - Ctrl/Cmd + 0: reset both panels
  - F: auto-fit active panel
  - Ctrl/Cmd + F: auto-fit both panels

## User Interface

- Holygrail Layout(full viewport width and height)
  - Header: fixed height, full viewport width
    - Title
    - Toolbar
        - New
        - Open
        - Save
        - Export
        - Font Info
        - About
  - Main: full viewport Width, auto heigth(viewport height - header height - footer height)
    - GlyphBrowser: accept drag and drop file to Open File
    - Spilter: drag and drop to resize left(GlyphBrowser) and right(GlyphEditor)
    - GlyphEditor
  - Footer: fixed Height, full viewport width
    - Copyright
    - Links
- Avoid scrollbar except Glyph Browser and Glyph Editor
- Font Info(Modal)
  - offset (default=0; read/write)
  - width (default=8; read/write)
  - height (default=16; read/write)
  - count (read only)
    - (filesize - offset) / (ceil(width/8) * height)
  - reversed bits (checkbox; default=off; read/write)

```
Header:Title&Toolbar
[New|Open|Save|SaveAs|About]
---------------------------------
 GlyphBrowser   | GlyphEditor
[1]{2}[3][4][5] | [ ][ ][x][ ][ ]
[6][7][8][9]    | [ ][x][ ][x][ ]
                | [ ][ ][ ][x][ ]
                | [ ][ ][x][ ][ ]
                | [ ][x][ ][ ][ ]
                | [ ][x][x]{x}[ ]
---------------------------------
Footer:Links,Copyright
```

## Examples

Try these sample fonts:

- [English Font (8x16)](https://iolo.kr/fed/?url=https://raw.githubusercontent.com/iolo/fed/master/eng.fnt)
- [Korean Font (16x16)](https://iolo.kr/fed/?url=https://raw.githubusercontent.com/iolo/fed/master/kor.fnt&width=16&height=16)
- [Apple II Video ROM (7x8)](https://iolo.kr/fed/?url=https://raw.githubusercontent.com/iolo/fed/master/a2.fnt&width=8&height=8) - MSB is not used.
- [Apple IIe Enhanced Video ROM (7x8)](https://iolo.kr/fed/?url=https://raw.githubusercontent.com/iolo/fed/master/a2ee.fnt&width=8&height=8&reversed=1) - MSB is not used. Reversed bits
