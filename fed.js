class FontEditor {
    constructor() {
        this.fontData = null;
        this.glyphs = [];
        this.currentGlyph = 0;
        this.selectedPixel = { x: 0, y: 0 };
        
        // Font parameters
        this.offset = 0;
        this.width = 8;
        this.height = 16;
        this.glyphBytes = 16; // 1 byte * 16 rows for 8x16
        
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
        const totalGlyphs = Math.floor((this.fontData.length - this.offset) / this.glyphBytes);
        
        for (let g = 0; g < Math.min(256, totalGlyphs); g++) {
            const glyph = [];
            const glyphOffset = this.offset + g * this.glyphBytes;
            
            for (let row = 0; row < this.height; row++) {
                const pixelRow = [];
                const byte = this.fontData[glyphOffset + row] || 0;
                
                // Convert 1 byte to 8 pixels (big-endian)
                for (let col = 0; col < 8; col++) {
                    pixelRow.push((byte & (0x80 >> col)) ? 1 : 0);
                }
                glyph.push(pixelRow);
            }
            this.glyphs.push(glyph);
        }
        
        // Fill remaining with empty glyphs if needed
        while (this.glyphs.length < 256) {
            this.glyphs.push(Array(this.height).fill().map(() => Array(this.width).fill(0)));
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
            canvas.width = 16;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            
            // Draw glyph
            ctx.fillStyle = '#000';
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    if (this.glyphs[i] && this.glyphs[i][y] && this.glyphs[i][y][x]) {
                        ctx.fillRect(x * 2, y * 2, 2, 2);
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
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.glyphs[this.currentGlyph][y][x]) {
                    ctx.fillRect(x * 2, y * 2, 2, 2);
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
        // For now, just close the modal
        // TODO: Implement parameter changes
        this.hideFontInfo();
    }
    
    updateCount() {
        const count = this.fontData ? Math.floor((this.fontData.length - this.offset) / this.glyphBytes) : 0;
        document.getElementById('count').textContent = count;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new FontEditor();
});