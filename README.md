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

- New
  - confirm if modified since saved
  - ask/confirm font info
- Open(File input; no upload)
  - confirm if modified since saved
  - ask/confirm font info
- Open from URL with query parameters
  - `url`: public url to download(GET) font data
  - `width`: pixel width
  - `height`: pixel height
  - `offset`: skip bytes from the beginning of file
  - `reversed`: reverse bits or not(for Apple II HGR fonts)
- Save(Download)
    - .fnt/.bin (without header)
- Export
    - .png with configurable options:
      - Glyphs per row (1-32)
      - Scale factor (1-8x)
      - Horizontal/vertical gaps
      - Background/foreground colors
- Glyph Browser
  - show all glyphs as grid with specfied zoom factor(default:2)
  - Arrow keys to select a glyph
  - ENTER key to edit a glyph(switch to editor mode)
  - INSERT key to insert a blank glyph before current
  - DEL key to delete a glyph
- Edit Glyph
  - show th current glyph in pixel grid with specified zoom(default: auto-fit)
  - Arrow keys to select pixel(current pixel should be highlighted)
  - ESC key to stop editing(switch to browser mode)
  - SPACE key to toggle pixel
- Show and edit Font Info

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
