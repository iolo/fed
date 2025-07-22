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
- Open(File input; no upload)
  - confirm if modified since saved
- Save(Download)
- Export
    - .bin(no header)
    - .png
- Glyph Browser
  - show all glyphs as grid with specfied zoom factor(default:2)
  - Arrow keys to select a glyph
  - ENTER key to edit a glyph
  - DEL key to delete a glyph
  - Double Click glyph to select
- Edit Glyph
  - show th current glyph in pixel grid with specified zoom(default: auto-fit)
  - Arrow keys to select pixel(current pixel should be highlighted)
  - ENTER key to save and stop editing
  - SPACE key to toggle pixel
  - ESC key to stop editing
    - When changes, confirm cancel, save  or discard chanes
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
  - height (default=8; read/write)
  - count (read only)
    - (filesize - offset) / (((width/8) + 1) * height)
     
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

