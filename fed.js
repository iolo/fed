class FontEditor {
    constructor() {
        this.fontData = null;
        this.glyphs = [];
        this.currentGlyph = 0;
        this.selectedPixel = { x: 0, y: 0 };
        
        // Font parameters - will be detected/configurable
        this.offset = 0;
        this.width = 8;
        this.height = 16;
        
        this.initEventListeners();
        this.createEmptyFont();
        this.renderGlyphBrowser();
        this.renderGlyphEditor();
    }
    
    initEventListeners() {
        document.getElementById('open').onclick = () => document.getElementById('fileinput').click();
        document.getElementById('fileinput').onchange = (e) => this.loadFont(e.target.files[0]);
        
        document.getElementById('fontinfo').onclick = () => this.showFontInfo();
        document.getElementById('fontinfo-ok').onclick = () => this.saveFontInfo();
        document.getElementById('fontinfo-cancel').onclick = () => this.hideFontInfo();
        
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
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
    
    getGlyphBytes() {
        return Math.ceil(this.width / 8) * this.height;
    }
    
    loadFont(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.fontData = new Uint8Array(e.target.result);
            this.parseFontData();
            this.renderGlyphBrowser();
            this.renderGlyphEditor();
            this.updateCount();
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
        
        for (let i = 0; i < 256; i++) {
            const glyphDiv = document.createElement('div');
            glyphDiv.className = 'glyph';
            if (i === this.currentGlyph) glyphDiv.classList.add('selected');
            
            // Create mini canvas for glyph preview
            const canvas = document.createElement('canvas');
            const scale = Math.min(16 / this.width, 32 / this.height);
            canvas.width = this.width * scale;
            canvas.height = this.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            
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
            glyphDiv.onclick = () => this.selectGlyph(i);
            glyphDiv.ondblclick = () => this.selectGlyph(i);
            grid.appendChild(glyphDiv);
        }
    }
    
    renderGlyphEditor() {
        const editor = document.getElementById('glypheditor');
        editor.innerHTML = '';
        
        const pixelGrid = document.createElement('div');
        pixelGrid.className = 'pixel-grid';
        pixelGrid.style.gridTemplateColumns = `repeat(${this.width}, 20px)`;
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const pixel = document.createElement('div');
                pixel.className = 'pixel';
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
        this.renderGlyphBrowser();
        this.renderGlyphEditor();
    }
    
    togglePixel(x, y) {
        this.selectedPixel = { x, y };
        this.glyphs[this.currentGlyph][y][x] = 1 - this.glyphs[this.currentGlyph][y][x];
        this.renderGlyphEditor();
        this.updateGlyphInBrowser();
    }
    
    updateGlyphInBrowser() {
        const glyphElements = document.querySelectorAll('.glyph');
        const canvas = glyphElements[this.currentGlyph].querySelector('canvas');
        const ctx = canvas.getContext('2d');
        
        const scale = Math.min(16 / this.width, 32 / this.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.glyphs[this.currentGlyph][y][x]) {
                    ctx.fillRect(x * scale, y * scale, scale, scale);
                }
            }
        }
    }
    
    handleKeyboard(e) {
        if (document.querySelector('.modal').style.display === 'block') return;
        
        switch(e.key) {
            case 'ArrowUp':
                if (e.shiftKey) {
                    this.selectedPixel.y = Math.max(0, this.selectedPixel.y - 1);
                    this.renderGlyphEditor();
                } else {
                    this.selectGlyph(Math.max(0, this.currentGlyph - 16));
                }
                e.preventDefault();
                break;
            case 'ArrowDown':
                if (e.shiftKey) {
                    this.selectedPixel.y = Math.min(this.height - 1, this.selectedPixel.y + 1);
                    this.renderGlyphEditor();
                } else {
                    this.selectGlyph(Math.min(255, this.currentGlyph + 16));
                }
                e.preventDefault();
                break;
            case 'ArrowLeft':
                if (e.shiftKey) {
                    this.selectedPixel.x = Math.max(0, this.selectedPixel.x - 1);
                    this.renderGlyphEditor();
                } else {
                    this.selectGlyph(Math.max(0, this.currentGlyph - 1));
                }
                e.preventDefault();
                break;
            case 'ArrowRight':
                if (e.shiftKey) {
                    this.selectedPixel.x = Math.min(this.width - 1, this.selectedPixel.x + 1);
                    this.renderGlyphEditor();
                } else {
                    this.selectGlyph(Math.min(255, this.currentGlyph + 1));
                }
                e.preventDefault();
                break;
            case ' ':
                this.togglePixel(this.selectedPixel.x, this.selectedPixel.y);
                e.preventDefault();
                break;
            case 'Enter':
                // Could be used for "save glyph" later
                e.preventDefault();
                break;
        }
    }
    
    showFontInfo() {
        document.getElementById('offset').value = this.offset;
        document.getElementById('width').value = this.width;
        document.getElementById('height').value = this.height;
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
        
        if (newWidth !== this.width || newHeight !== this.height || newOffset !== this.offset) {
            this.width = newWidth;
            this.height = newHeight;
            this.offset = newOffset;
            
            if (this.fontData) {
                this.parseFontData();
                this.renderGlyphBrowser();
                this.renderGlyphEditor();
            } else {
                this.createEmptyFont();
                this.renderGlyphBrowser();
                this.renderGlyphEditor();
            }
            this.updateCount();
        }
        
        this.hideFontInfo();
    }
    
    updateCount() {
        const count = this.fontData ? Math.floor((this.fontData.length - this.offset) / this.getGlyphBytes()) : 0;
        document.getElementById('count').textContent = count;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new FontEditor();
});