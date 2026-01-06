class FontEditor {
    constructor() {
        this.fontData = null;
        this.glyphs = [];
        this.currentGlyph = 0;
        this.selectedPixel = { x: 0, y: 0 };
        this.editMode = false; // false = browse, true = edit
        this.selectedGlyphs = new Set([0]);
        this.selectionAnchor = 0;
        this.clipboardGlyphs = [];

        // Font parameters - will be detected/configurable
        this.offset = 0;
        this.width = 8;
        this.height = 16;
        this.reversedBits = false;

        // UI sizing constants
        this.BASE_PIXEL_SIZE = 20;
        this.BASE_GLYPH_SIZE = 20;
        this.BORDER_SIZE = 1;
        this.GAP_SIZE = 2;
        this.PADDING_SIZE = 40;

        // Zoom parameters
        this.browserZoom = 1.0;
        this.editorZoom = 1.0;
        this.minZoom = 0.5;
        this.maxZoom = 4.0;
        this.zoomStep = 0.25;

        this.initEventListeners();
        this.loadFromURL() || this.createEmptyFont();
        this.renderGlyphBrowser();
        this.renderGlyphEditor();
        this.updateActivePanel();
    }

    initEventListeners() {
        document.getElementById('new').onclick = () => this.newFont();
        document.getElementById('open').onclick = () => document.getElementById('fileinput').click();
        document.getElementById('fileinput').onchange = (e) => this.loadFont(e.target.files[0]);
        document.getElementById('save').onclick = () => this.saveFont();
        document.getElementById('export').onclick = () => this.showExportDialog();
        document.getElementById('about').onclick = () => this.showAbout();

        document.getElementById('fontinfo').onclick = () => this.showFontInfo();
        document.getElementById('fontinfo-ok').onclick = () => this.saveFontInfo();
        document.getElementById('fontinfo-cancel').onclick = () => this.hideFontInfo();

        document.getElementById('export-ok').onclick = () => this.exportPNG();
        document.getElementById('export-cancel').onclick = () => this.hideExportDialog();

        document.getElementById('about-close').onclick = () => this.hideAbout();

        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Splitter functionality
        this.initSplitter();

        // Prevent default drag behavior
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            if (e.dataTransfer.files[0]) {
                this.loadFont(e.dataTransfer.files[0]);
            }
        });
    }

    createEmptyFont() {
        this.glyphs = Array(256).fill().map(() => Array(this.height).fill().map(() => Array(this.width).fill(0)));
    }

    createEmptyGlyph() {
        return Array(this.height).fill().map(() => Array(this.width).fill(0));
    }

    cloneGlyph(glyph) {
        return glyph.map((row) => row.slice());
    }

    getSelectedGlyphIndices() {
        if (!this.selectedGlyphs || this.selectedGlyphs.size === 0) {
            return [this.currentGlyph];
        }
        return Array.from(this.selectedGlyphs).sort((a, b) => a - b);
    }

    setSelectionRange(anchor, target) {
        const start = Math.min(anchor, target);
        const end = Math.max(anchor, target);
        this.selectedGlyphs = new Set();
        for (let i = start; i <= end; i++) {
            this.selectedGlyphs.add(i);
        }
    }

    getGlyphBytes() {
        return Math.ceil(this.width / 8) * this.height;
    }

    loadFont(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.fontData = new Uint8Array(e.target.result);
            this.reversedBits = false;
            this.parseFontData();
            this.showFontInfo();
            //this.renderGlyphBrowser();
            //this.renderGlyphEditor();
            //this.updateCount();
        };
        reader.readAsArrayBuffer(file);
    }

    parseFontData() {
        this.glyphs = [];
        const glyphBytes = this.getGlyphBytes();
        const totalGlyphs = Math.floor((this.fontData.length - this.offset) / glyphBytes);
        const bytesPerRow = Math.ceil(this.width / 8);

        for (let g = 0; g < totalGlyphs; g++) {
            const glyph = [];
            const glyphOffset = this.offset + g * glyphBytes;

            for (let row = 0; row < this.height; row++) {
                const pixelRow = [];

                // Read bytes for this row
                for (let byteIdx = 0; byteIdx < bytesPerRow; byteIdx++) {
                    const byte = this.fontData[glyphOffset + row * bytesPerRow + byteIdx] || 0;
                    const startBit = byteIdx * 8;
                    const endBit = Math.min(startBit + 8, this.width);

                    // Convert byte to pixels (big-endian)
                    for (let bit = startBit; bit < endBit; bit++) {
                        const bitPos = bit - startBit;
                        pixelRow.push((byte & (0x80 >> bitPos)) ? 1 : 0);
                    }
                }
                glyph.push(pixelRow);
            }
            this.glyphs.push(glyph);
        }
    }

    renderGlyphBrowser() {
        const browser = document.getElementById('glyphbrowser');
        browser.innerHTML = '<div class="glyph-grid"></div>';
        const grid = browser.querySelector('.glyph-grid');

        for (let i = 0; i < this.glyphs.length; i++) {
            const glyphDiv = document.createElement('div');
            glyphDiv.className = 'glyph';
            if (this.selectedGlyphs.has(i)) glyphDiv.classList.add('selected');

            // Create mini canvas for glyph preview with zoom
            const canvas = document.createElement('canvas');
            const baseScale = Math.min(16 / this.width, 32 / this.height);
            const scale = baseScale * this.browserZoom;
            canvas.width = this.width * scale;
            canvas.height = this.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;

            // Update glyph div size based on zoom
            const glyphSize = Math.max(this.BASE_GLYPH_SIZE, Math.min(this.width * scale, this.height * scale));
            glyphDiv.style.width = glyphSize + 'px';
            glyphDiv.style.height = Math.max(glyphSize, this.height * scale) + 'px';

            // Draw glyph
            ctx.fillStyle = '#000';
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    if (this.glyphs[i] && this.glyphs[i][y] && this.glyphs[i][y][x]) {
                        ctx.fillRect(x * scale, y * scale, scale, scale);
                    }
                }
            }

            glyphDiv.appendChild(canvas);
            glyphDiv.onclick = (e) => {
                if (!this.editMode && e.shiftKey) {
                    this.moveGlyphSelection(i, true);
                } else if (!this.editMode && (e.ctrlKey || e.metaKey)) {
                    this.toggleGlyphSelection(i);
                } else {
                    this.selectGlyph(i);
                }
            };
            glyphDiv.ondblclick = (e) => {
                if (!this.editMode && e.shiftKey) {
                    this.moveGlyphSelection(i, true);
                } else if (!this.editMode && (e.ctrlKey || e.metaKey)) {
                    this.toggleGlyphSelection(i);
                } else {
                    this.selectGlyph(i);
                }
            };
            grid.appendChild(glyphDiv);
        }

        // Update grid template to accommodate zoom
        const glyphSize = Math.max(this.BASE_GLYPH_SIZE * this.browserZoom, this.BASE_GLYPH_SIZE);
        grid.style.gridTemplateColumns = `repeat(auto-fill, ${glyphSize}px)`;
    }

    renderGlyphEditor() {
        const editor = document.getElementById('glypheditor');
        editor.innerHTML = '';

        const pixelGrid = document.createElement('div');
        pixelGrid.className = 'pixel-grid';
        const pixelSize = Math.round(this.BASE_PIXEL_SIZE * this.editorZoom);
        pixelGrid.style.gridTemplateColumns = `repeat(${this.width}, ${pixelSize}px)`;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const pixel = document.createElement('div');
                pixel.className = 'pixel';
                pixel.style.width = pixelSize + 'px';
                pixel.style.height = pixelSize + 'px';
                if (this.glyphs[this.currentGlyph][y][x]) pixel.classList.add('on');
                if (x === this.selectedPixel.x && y === this.selectedPixel.y) pixel.classList.add('selected');

                pixel.onclick = () => this.togglePixel(x, y);
                pixelGrid.appendChild(pixel);
            }
        }

        editor.appendChild(pixelGrid);
    }

    selectGlyph(index) {
        this.currentGlyph = index;
        this.selectionAnchor = index;
        this.selectedGlyphs = new Set([index]);
        this.renderGlyphBrowser();
        this.renderGlyphEditor();
    }

    togglePixel(x, y) {
        this.selectedPixel = { x, y };
        this.glyphs[this.currentGlyph][y][x] = 1 - this.glyphs[this.currentGlyph][y][x];
        this.renderGlyphEditor();
        this.updateGlyphInBrowser(this.currentGlyph);
    }

    updateGlyphInBrowser(index) {
        const glyphElements = document.querySelectorAll('.glyph');
        const canvas = glyphElements[index].querySelector('canvas');
        const ctx = canvas.getContext('2d');

        const baseScale = Math.min(16 / this.width, 32 / this.height);
        const scale = baseScale * this.browserZoom;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.glyphs[index][y][x]) {
                    ctx.fillRect(x * scale, y * scale, scale, scale);
                }
            }
        }
    }

    updateGlyphsInBrowser(indices) {
        indices.forEach((index) => this.updateGlyphInBrowser(index));
    }

    moveGlyphSelection(target, extend) {
        const clamped = Math.max(0, Math.min(this.glyphs.length - 1, target));
        if (extend) {
            if (this.selectionAnchor === null || this.selectionAnchor === undefined) {
                this.selectionAnchor = this.currentGlyph;
            }
            this.currentGlyph = clamped;
            this.setSelectionRange(this.selectionAnchor, clamped);
            this.renderGlyphBrowser();
            this.renderGlyphEditor();
        } else {
            this.selectGlyph(clamped);
        }
    }

    toggleGlyphSelection(index) {
        if (this.selectedGlyphs.has(index)) {
            this.selectedGlyphs.delete(index);
        } else {
            this.selectedGlyphs.add(index);
        }

        if (this.selectedGlyphs.size === 0) {
            this.selectedGlyphs.add(index);
        }

        this.currentGlyph = index;
        if (!this.selectedGlyphs.has(this.selectionAnchor)) {
            this.selectionAnchor = index;
        }

        this.renderGlyphBrowser();
        this.renderGlyphEditor();
    }

    zoomBrowser(delta) {
        this.browserZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.browserZoom + delta));
        this.renderGlyphBrowser();
    }

    zoomEditor(delta) {
        this.editorZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.editorZoom + delta));
        this.renderGlyphEditor();
    }

    autoFitBrowser() {
        const browser = document.getElementById('glyphbrowser');
        const rect = browser.getBoundingClientRect();
        const availableWidth = rect.width - this.PADDING_SIZE;
        const availableHeight = rect.height - this.PADDING_SIZE;

        // Calculate ideal glyph size based on available space
        const minGlyphWithGap = this.BASE_GLYPH_SIZE + this.GAP_SIZE;
        const cols = Math.floor(availableWidth / minGlyphWithGap);
        const rows = Math.ceil(this.glyphs.length / cols);
        const maxGlyphWidth = Math.floor(availableWidth / cols) - this.GAP_SIZE;
        const maxGlyphHeight = Math.floor(availableHeight / rows) - this.GAP_SIZE;

        const baseScale = Math.min(16 / this.width, 32 / this.height);
        const maxZoomWidth = maxGlyphWidth / (this.width * baseScale);
        const maxZoomHeight = maxGlyphHeight / (this.height * baseScale);

        this.browserZoom = Math.max(this.minZoom, Math.min(this.maxZoom, Math.min(maxZoomWidth, maxZoomHeight)));
        this.renderGlyphBrowser();
    }

    autoFitEditor() {
        const editor = document.getElementById('glypheditor');
        const rect = editor.getBoundingClientRect();
        const availableWidth = rect.width - this.PADDING_SIZE;
        const availableHeight = rect.height - this.PADDING_SIZE;

        // Calculate max zoom that fits the glyph in the available space
        const pixelWithBorder = this.BASE_PIXEL_SIZE + this.BORDER_SIZE;
        const maxZoomWidth = availableWidth / (this.width * pixelWithBorder);
        const maxZoomHeight = availableHeight / (this.height * pixelWithBorder);

        this.editorZoom = Math.max(this.minZoom, Math.min(this.maxZoom, Math.min(maxZoomWidth, maxZoomHeight)));
        this.renderGlyphEditor();
    }

    getGridColumns() {
        const grid = document.querySelector('.glyph-grid');
        if (!grid) return 16; // fallback
        const gridStyle = getComputedStyle(grid);
        const columns = gridStyle.gridTemplateColumns.split(' ').length;
        return columns > 0 ? columns : 16; // fallback to 16 if calculation fails
    }

    handleKeyboard(e) {
        const modals = document.querySelectorAll('.modal');
        const isModalOpen = Array.from(modals).some((modal) => modal.style.display === 'block');
        if (isModalOpen) return;

        if (!this.editMode && (e.ctrlKey || e.metaKey)) {
            const key = e.key.toLowerCase();
            if (key === 'c') {
                const indices = this.getSelectedGlyphIndices();
                this.clipboardGlyphs = indices.map((i) => this.cloneGlyph(this.glyphs[i]));
                this.selectedGlyphs = new Set([this.currentGlyph]);
                this.selectionAnchor = this.currentGlyph;
                this.renderGlyphBrowser();
                e.preventDefault();
                return;
            }
            if (key === 'x') {
                const indices = this.getSelectedGlyphIndices();
                this.clipboardGlyphs = indices.map((i) => this.cloneGlyph(this.glyphs[i]));
                indices.forEach((i) => {
                    this.glyphs[i] = this.createEmptyGlyph();
                });
                this.selectedGlyphs = new Set([this.currentGlyph]);
                this.selectionAnchor = this.currentGlyph;
                this.renderGlyphEditor();
                this.updateGlyphsInBrowser(indices);
                this.renderGlyphBrowser();
                e.preventDefault();
                return;
            }
            if (key === 'v' && this.clipboardGlyphs.length > 0) {
                this.selectedGlyphs = new Set([this.currentGlyph]);
                this.selectionAnchor = this.currentGlyph;

                const indices = [];
                for (let i = 0; i < this.clipboardGlyphs.length; i++) {
                    const index = this.currentGlyph + i;
                    if (index >= this.glyphs.length) break;
                    this.glyphs[index] = this.cloneGlyph(this.clipboardGlyphs[i]);
                    indices.push(index);
                }

                this.renderGlyphEditor();
                this.updateGlyphsInBrowser(indices);
                e.preventDefault();
                return;
            }
        }

        switch(e.key) {
            case 'ArrowUp':
            case 'k':
            case 'K':
            case 'w':
            case 'W':
                if (this.editMode) {
                    this.selectedPixel.y = Math.max(0, this.selectedPixel.y - 1);
                    this.renderGlyphEditor();
                } else {
                    const cols = this.getGridColumns();
                    this.moveGlyphSelection(this.currentGlyph - cols, e.shiftKey);
                }
                e.preventDefault();
                break;
            case 'ArrowDown':
            case 'j':
            case 'J':
            case 's':
            case 'S':
                if (this.editMode) {
                    this.selectedPixel.y = Math.min(this.height - 1, this.selectedPixel.y + 1);
                    this.renderGlyphEditor();
                } else {
                    const cols = this.getGridColumns();
                    this.moveGlyphSelection(this.currentGlyph + cols, e.shiftKey);
                }
                e.preventDefault();
                break;
            case 'ArrowLeft':
            case 'h':
            case 'H':
            case 'a':
            case 'A':
                if (this.editMode) {
                    this.selectedPixel.x = Math.max(0, this.selectedPixel.x - 1);
                    this.renderGlyphEditor();
                } else {
                    this.moveGlyphSelection(this.currentGlyph - 1, e.shiftKey);
                }
                e.preventDefault();
                break;
            case 'ArrowRight':
            case 'l':
            case 'L':
            case 'd':
            case 'D':
                if (this.editMode) {
                    this.selectedPixel.x = Math.min(this.width - 1, this.selectedPixel.x + 1);
                    this.renderGlyphEditor();
                } else {
                    this.moveGlyphSelection(this.currentGlyph + 1, e.shiftKey);
                }
                e.preventDefault();
                break;
            case ' ':
                if (this.editMode) {
                    this.togglePixel(this.selectedPixel.x, this.selectedPixel.y);
                }
                e.preventDefault();
                break;
            case 'Enter':
                this.editMode = true;
                this.renderGlyphEditor();
                this.updateActivePanel();
                e.preventDefault();
                break;
            case 'Escape':
                this.editMode = false;
                this.renderGlyphEditor();
                this.updateActivePanel();
                e.preventDefault();
                break;
            case 'Delete':
            case 'x':
            case 'X':
                if (!this.editMode) {
                    if (this.glyphs.length > 1) {
                        this.glyphs.splice(this.currentGlyph, 1);
                        if (this.currentGlyph >= this.glyphs.length) {
                            this.currentGlyph = this.glyphs.length - 1;
                        }
                    } else {
                        // Keep at least one glyph by clearing it.
                        for (let y = 0; y < this.height; y++) {
                            for (let x = 0; x < this.width; x++) {
                                this.glyphs[this.currentGlyph][y][x] = 0;
                            }
                        }
                    }
                    this.selectedGlyphs = new Set([this.currentGlyph]);
                    this.selectionAnchor = this.currentGlyph;
                    this.renderGlyphEditor();
                    this.renderGlyphBrowser();
                    this.updateCount();
                }
                e.preventDefault();
                break;
            case 'Insert':
            case 'i':
            case 'I':
                if (!this.editMode) {
                    this.glyphs.splice(this.currentGlyph, 0, this.createEmptyGlyph());
                    this.selectedGlyphs = new Set([this.currentGlyph]);
                    this.selectionAnchor = this.currentGlyph;
                    this.renderGlyphBrowser();
                    this.renderGlyphEditor();
                    this.updateCount();
                }
                e.preventDefault();
                break;
            case '=':
            case '+':
                if (e.ctrlKey || e.metaKey) {
                    // Zoom both browser and editor
                    this.zoomBrowser(this.zoomStep);
                    this.zoomEditor(this.zoomStep);
                } else {
                    // Zoom current active panel based on mode
                    if (this.editMode) {
                        this.zoomEditor(this.zoomStep);
                    } else {
                        this.zoomBrowser(this.zoomStep);
                    }
                }
                e.preventDefault();
                break;
            case '-':
            case '_':
                if (e.ctrlKey || e.metaKey) {
                    // Zoom both browser and editor
                    this.zoomBrowser(-this.zoomStep);
                    this.zoomEditor(-this.zoomStep);
                } else {
                    // Zoom current active panel based on mode
                    if (this.editMode) {
                        this.zoomEditor(-this.zoomStep);
                    } else {
                        this.zoomBrowser(-this.zoomStep);
                    }
                }
                e.preventDefault();
                break;
            case '0':
                if (e.ctrlKey || e.metaKey) {
                    // Reset both panels zoom to 1.0
                    this.browserZoom = 1.0;
                    this.editorZoom = 1.0;
                    this.renderGlyphBrowser();
                    this.renderGlyphEditor();
                } else {
                    // Reset current active panel zoom based on mode
                    if (this.editMode) {
                        this.editorZoom = 1.0;
                        this.renderGlyphEditor();
                    } else {
                        this.browserZoom = 1.0;
                        this.renderGlyphBrowser();
                    }
                }
                e.preventDefault();
                break;
            case 'f':
            case 'F':
                if (e.ctrlKey || e.metaKey) {
                    // Auto-fit both panels
                    this.autoFitBrowser();
                    this.autoFitEditor();
                } else {
                    // Auto-fit current active panel based on mode
                    if (this.editMode) {
                        this.autoFitEditor();
                    } else {
                        this.autoFitBrowser();
                    }
                }
                e.preventDefault();
                break;
        }
    }

    showFontInfo() {
        document.getElementById('offset').value = this.offset;
        document.getElementById('width').value = this.width;
        document.getElementById('height').value = this.height;
        document.getElementById('reversed-bits').checked = this.reversedBits;
        this.updateCount();
        document.getElementById('fontinfo-modal').style.display = 'block';
    }

    hideFontInfo() {
        document.getElementById('fontinfo-modal').style.display = 'none';
    }

    saveFontInfo() {
        const newWidth = parseInt(document.getElementById('width').value);
        const newHeight = parseInt(document.getElementById('height').value);
        const newOffset = parseInt(document.getElementById('offset').value);
        const newReversedBits = document.getElementById('reversed-bits').checked;
        const dimensionsChanged = newWidth !== this.width || newHeight !== this.height || newOffset !== this.offset;
        const reversedChanged = newReversedBits !== this.reversedBits;

        if (dimensionsChanged || reversedChanged) {
            this.width = newWidth;
            this.height = newHeight;
            this.offset = newOffset;
            if (reversedChanged) {
                if (this.fontData) {
                    this.reverseBitsInFontData();
                } else {
                    this.reverseBitsInGlyphs();
                }
                this.reversedBits = newReversedBits;
            }

            if (this.fontData) {
                this.parseFontData();
            } else if (dimensionsChanged) {
                this.createEmptyFont();
            }
        }

        this.renderGlyphBrowser();
        this.renderGlyphEditor();
        this.updateCount();
        this.hideFontInfo();
    }

    reverseBitsInGlyphs() {
        const bytesPerRow = Math.ceil(this.width / 8);
        for (let g = 0; g < this.glyphs.length; g++) {
            for (let row = 0; row < this.height; row++) {
                for (let byteIdx = 0; byteIdx < bytesPerRow; byteIdx++) {
                    const startBit = byteIdx * 8;
                    let byte = 0;
                    for (let bitPos = 0; bitPos < 8; bitPos++) {
                        const x = startBit + bitPos;
                        if (x < this.width && this.glyphs[g][row][x]) {
                            byte |= (0x80 >> bitPos);
                        }
                    }
                    const reversed = this.reverseByte(byte);
                    for (let bitPos = 0; bitPos < 8; bitPos++) {
                        const x = startBit + bitPos;
                        if (x < this.width) {
                            this.glyphs[g][row][x] = (reversed & (0x80 >> bitPos)) ? 1 : 0;
                        }
                    }
                }
            }
        }
    }

    reverseBitsInFontData() {
        for (let i = 0; i < this.fontData.length; i++) {
            this.fontData[i] = this.reverseByte(this.fontData[i]);
        }
    }

    reverseByte(byte) {
        let result = 0;
        for (let i = 0; i < 8; i++) {
            result = (result << 1) | (byte & 1);
            byte >>= 1;
        }
        return result & 0xff;
    }

    saveFont() {
        // Convert glyphs back to Uint8Array
        const glyphBytes = this.getGlyphBytes();
        const totalBytes = this.glyphs.length * glyphBytes;
        const fontData = new Uint8Array(totalBytes);
        const bytesPerRow = Math.ceil(this.width / 8);

        for (let g = 0; g < this.glyphs.length; g++) {
            const glyphOffset = g * glyphBytes;

            for (let row = 0; row < this.height; row++) {
                for (let byteIdx = 0; byteIdx < bytesPerRow; byteIdx++) {
                    let byte = 0;
                    const startBit = byteIdx * 8;
                    const endBit = Math.min(startBit + 8, this.width);

                    // Pack pixels into byte (big-endian)
                    for (let bit = startBit; bit < endBit; bit++) {
                        const bitPos = bit - startBit;
                        if (this.glyphs[g][row][bit]) {
                            byte |= (0x80 >> bitPos);
                        }
                    }

                    fontData[glyphOffset + row * bytesPerRow + byteIdx] = byte;
                }
            }
        }

        // Create download
        const blob = new Blob([fontData], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'font.fnt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showExportDialog() {
        document.getElementById('export-modal').style.display = 'block';
    }

    hideExportDialog() {
        document.getElementById('export-modal').style.display = 'none';
    }

    exportPNG() {
        const glyphsPerRow = parseInt(document.getElementById('glyphs-per-row').value);
        const scale = parseInt(document.getElementById('export-scale').value);
        const hGap = parseInt(document.getElementById('h-gap').value);
        const vGap = parseInt(document.getElementById('v-gap').value);
        const bgColor = document.getElementById('bg-color').value;
        const fgColor = document.getElementById('fg-color').value;

        const totalGlyphs = this.glyphs.length;
        const rows = Math.ceil(totalGlyphs / glyphsPerRow);

        // Calculate canvas size
        const glyphWidth = this.width * scale;
        const glyphHeight = this.height * scale;
        const canvasWidth = glyphsPerRow * glyphWidth + (glyphsPerRow - 1) * hGap;
        const canvasHeight = rows * glyphHeight + (rows - 1) * vGap;

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        // Fill background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw glyphs
        ctx.fillStyle = fgColor;
        for (let i = 0; i < totalGlyphs; i++) {
            const row = Math.floor(i / glyphsPerRow);
            const col = i % glyphsPerRow;

            const x = col * (glyphWidth + hGap);
            const y = row * (glyphHeight + vGap);

            // Draw each pixel of the glyph
            for (let py = 0; py < this.height; py++) {
                for (let px = 0; px < this.width; px++) {
                    if (this.glyphs[i][py][px]) {
                        ctx.fillRect(
                            x + px * scale,
                            y + py * scale,
                            scale,
                            scale
                        );
                    }
                }
            }
        }

        // Download PNG
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'font.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');

        this.hideExportDialog();
    }

    newFont() {
        this.fontData = null;
        this.currentGlyph = 0;
        this.selectedPixel = { x: 0, y: 0 };
        this.reversedBits = false;
        this.selectedGlyphs = new Set([0]);
        this.selectionAnchor = 0;
        this.createEmptyFont();
        this.showFontInfo();
        //this.renderGlyphBrowser();
        //this.renderGlyphEditor();
        //this.updateCount();
    }

    showAbout() {
        document.getElementById('about-modal').style.display = 'block';
    }

    hideAbout() {
        document.getElementById('about-modal').style.display = 'none';
    }

    updateActivePanel() {
        const browser = document.getElementById('glyphbrowser');
        const editor = document.getElementById('glypheditor');

        if (this.editMode) {
            browser.classList.remove('active');
            editor.classList.add('active');
        } else {
            browser.classList.add('active');
            editor.classList.remove('active');
        }
    }

    initSplitter() {
        const splitter = document.getElementById('splitter');
        const browser = document.getElementById('glyphbrowser');
        let isResizing = false;

        splitter.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', () => {
                isResizing = false;
                document.removeEventListener('mousemove', handleMouseMove);
            });
            e.preventDefault();
        });

        function handleMouseMove(e) {
            if (!isResizing) return;
            const rect = document.querySelector('main').getBoundingClientRect();
            const newWidth = e.clientX - rect.left;
            if (newWidth > 200 && newWidth < rect.width - 200) {
                browser.style.width = newWidth + 'px';
            }
        }
    }

    updateCount() {
        const count = this.glyphs ? this.glyphs.length : 0;
        document.getElementById('count').textContent = count;
    }

    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        const url = params.get('url');

        if (!url) return false;

        // Parse optional parameters
        const width = params.get('width');
        const height = params.get('height');
        const offset = params.get('offset');
        const reversed = params.get('reversed');

        if (width) this.width = parseInt(width);
        if (height) this.height = parseInt(height);
        if (offset) this.offset = parseInt(offset);
        if (reversed) {
            this.reversedBits = reversed === '1' || reversed.toLowerCase() === 'true';
        }

        // Try to load from URL
        this.loadFontFromURL(url);
        return true;
    }

    async loadFontFromURL(url) {
        try {
            // Try direct fetch first
            let response;
            try {
                response = await fetch(url);
            } catch (corsError) {
                // Fallback to CORS proxy
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
                response = await fetch(proxyUrl);
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            this.fontData = new Uint8Array(arrayBuffer);
            if (this.reversedBits) {
                this.reverseBitsInFontData();
            }
            this.parseFontData();
            this.renderGlyphBrowser();
            this.renderGlyphEditor();
            this.updateCount();

        } catch (error) {
            console.error('Failed to load font from URL:', error);
            alert(`Failed to load font from URL: ${error.message}\n\nPlease check the URL or try downloading the file and opening it locally.`);
            // Fallback to empty font
            this.createEmptyFont();
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new FontEditor();
});
