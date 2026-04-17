// editor.js — Interactive 5×5 grid vector editor

class VectorEditor {
  constructor(editorCanvas, glyphCanvas) {
    this.canvas = editorCanvas;
    this.glyphCanvas = glyphCanvas;
    this.ctx = editorCanvas.getContext('2d');
    this.glyphCtx = glyphCanvas.getContext('2d');

    this.charIndex = 0;
    this.vectors = [...Vectorizer.DEFAULT_VECTORS[0]];
    this.autoVectors = [...Vectorizer.DEFAULT_VECTORS[0]];
    this.defaultVectors = [...Vectorizer.DEFAULT_VECTORS[0]];
    this.font = null;

    this.drawMode = true; // true=draw, false=move
    this.selectedPoint = -1;
    this.history = [];
    this.onChange = null;

    this._setupEvents();
  }

  setCharacter(charIndex, vectors, autoVectors, font) {
    this.charIndex = charIndex;
    this.vectors = [...vectors];
    this.autoVectors = [...autoVectors];
    this.defaultVectors = [...Vectorizer.DEFAULT_VECTORS[charIndex]];
    this.font = font;
    this.selectedPoint = -1;
    this.history = [];
    this._renderGlyphBackground();
    this.render();
  }

  getVectors() { return [...this.vectors]; }

  undo() {
    if (!this.history.length) return;
    this.vectors = this.history.pop();
    this.selectedPoint = -1;
    this.render();
    if (this.onChange) this.onChange(this.vectors);
  }

  resetToAuto() {
    this._saveHistory();
    this.vectors = [...this.autoVectors];
    this.selectedPoint = -1;
    this.render();
    if (this.onChange) this.onChange(this.vectors);
  }

  resetToDefault() {
    this._saveHistory();
    this.vectors = [...this.defaultVectors];
    this.selectedPoint = -1;
    this.render();
    if (this.onChange) this.onChange(this.vectors);
  }

  _saveHistory() {
    this.history.push([...this.vectors]);
    if (this.history.length > 50) this.history.shift();
  }

  // Parse vectors into point objects for editing
  _parsePoints() {
    const points = [];
    for (let i = 0; i < 14; i++) {
      const v = this.vectors[i];
      if (v === 200) break;
      if (v === 222) {
        points.push({ type: 'dot', x: points.length ? points[points.length-1].x : 0, y: points.length ? points[points.length-1].y : 0, vecIdx: i });
        continue;
      }
      let draw = false, code = v;
      if (code > 99) { draw = true; code -= 100; }
      points.push({ type: draw ? 'draw' : 'move', x: Math.floor(code / 10), y: code % 10, vecIdx: i });
    }
    return points;
  }

  _encodePoints(points) {
    const vec = [];
    for (const p of points) {
      if (p.type === 'dot') {
        vec.push(222);
      } else {
        const base = p.x * 10 + p.y;
        vec.push(p.type === 'draw' ? 100 + base : base);
      }
    }
    while (vec.length < 14) vec.push(200);
    this.vectors = vec.slice(0, 14);
  }

  _gridFromCanvas(cx, cy) {
    const size = this.canvas.width;
    const cell = size / Vectorizer.GRID;
    return {
      x: Math.min(Vectorizer.GRID, Math.max(0, Math.round(cx / cell))),
      y: Math.min(Vectorizer.GRID, Math.max(0, Vectorizer.GRID - Math.round(cy / cell)))
    };
  }

  _canvasFromGrid(gx, gy) {
    const size = this.canvas.width;
    const cell = size / Vectorizer.GRID;
    return { cx: gx * cell, cy: (Vectorizer.GRID - gy) * cell };
  }

  _hitTest(cx, cy) {
    const points = this._parsePoints();
    const hitR = this.canvas.width / (Vectorizer.GRID * 2); // hit radius = half a cell
    for (let i = 0; i < points.length; i++) {
      const { cx: px, cy: py } = this._canvasFromGrid(points[i].x, points[i].y);
      if (Math.hypot(cx - px, cy - py) < hitR) return i;
    }
    return -1;
  }

  _setupEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { cx: (clientX - rect.left) * scaleX, cy: (clientY - rect.top) * scaleY };
    };

    this.canvas.addEventListener('click', (e) => {
      const { cx, cy } = getPos(e);
      const hit = this._hitTest(cx, cy);
      const grid = this._gridFromCanvas(cx, cy);
      const points = this._parsePoints();

      if (this.selectedPoint >= 0) {
        // Move selected point to clicked grid cell
        this._saveHistory();
        points[this.selectedPoint].x = grid.x;
        points[this.selectedPoint].y = grid.y;
        this._encodePoints(points);
        this.selectedPoint = -1;
        this.render();
        if (this.onChange) this.onChange(this.vectors);
      } else if (hit >= 0) {
        // Select existing point
        this.selectedPoint = hit;
        this.render();
      } else {
        // Add new point
        const activeCount = points.length;
        if (activeCount >= 13) return; // max 13 points + 1 sentinel
        this._saveHistory();
        points.push({ type: this.drawMode ? 'draw' : 'move', x: grid.x, y: grid.y, vecIdx: -1 });
        this._encodePoints(points);
        this.render();
        if (this.onChange) this.onChange(this.vectors);
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const { cx, cy } = getPos(e);
      const hit = this._hitTest(cx, cy);
      if (hit >= 0) {
        this._saveHistory();
        const points = this._parsePoints();
        points.splice(hit, 1);
        this._encodePoints(points);
        this.selectedPoint = -1;
        this.render();
        if (this.onChange) this.onChange(this.vectors);
      }
    });

    // Touch support for mobile
    this.canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.canvas.dispatchEvent(new MouseEvent('click', {
        clientX: e.changedTouches[0].clientX,
        clientY: e.changedTouches[0].clientY
      }));
    }, { passive: false });
  }

  _renderGlyphBackground() {
    const size = this.glyphCanvas.width;
    this.glyphCtx.clearRect(0, 0, size, size);
    if (!this.font) return;

    const ch = Vectorizer.CHAR_MAP[this.charIndex];
    if (!ch) return;

    try {
      const glyph = this.font.charToGlyph(ch);
      const bb = glyph.getBoundingBox();
      if (!bb || bb.x1 === bb.x2 || bb.y1 === bb.y2) return;
      const charW = bb.x2 - bb.x1, charH = bb.y2 - bb.y1;
      const scale = (size * 0.9) / Math.max(charW, charH);
      const ox = (size - charW * scale) / 2 - bb.x1 * scale;
      const oy = (size - charH * scale) / 2 + bb.y2 * scale;

      this.glyphCtx.globalAlpha = 0.15;
      this.glyphCtx.fillStyle = '#00d4ff';
      const path = glyph.getPath(ox, oy, scale * this.font.unitsPerEm);
      const p2d = new Path2D(path.toSVG());
      this.glyphCtx.fill(p2d);
      this.glyphCtx.globalAlpha = 1.0;
    } catch (e) {}
  }

  render() {
    const size = this.canvas.width;
    const G = Vectorizer.GRID;
    const cell = size / G;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, size, size);

    // Draw glyph reference behind
    ctx.drawImage(this.glyphCanvas, 0, 0);

    // Grid dots
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (let gx = 0; gx <= G; gx++) {
      for (let gy = 0; gy <= G; gy++) {
        const { cx, cy } = this._canvasFromGrid(gx, gy);
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Grid lines (faint)
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx <= G; gx++) {
      ctx.beginPath();
      ctx.moveTo(gx * cell, 0);
      ctx.lineTo(gx * cell, size);
      ctx.stroke();
    }
    for (let gy = 0; gy <= G; gy++) {
      ctx.beginPath();
      ctx.moveTo(0, gy * cell);
      ctx.lineTo(size, gy * cell);
      ctx.stroke();
    }

    const points = this._parsePoints();

    // Draw strokes
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      const prev = points[i-1];
      if (p.type === 'draw') {
        const { cx: x1, cy: y1 } = this._canvasFromGrid(prev.x, prev.y);
        const { cx: x2, cy: y2 } = this._canvasFromGrid(p.x, p.y);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      } else if (p.type === 'move') {
        const { cx: x1, cy: y1 } = this._canvasFromGrid(prev.x, prev.y);
        const { cx: x2, cy: y2 } = this._canvasFromGrid(p.x, p.y);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw points
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const { cx, cy } = this._canvasFromGrid(p.x, p.y);
      const isSelected = i === this.selectedPoint;
      const r = size / 22;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);

      if (p.type === 'dot') {
        ctx.fillStyle = isSelected ? '#fff' : '#ff6b6b';
      } else if (p.type === 'draw') {
        ctx.fillStyle = isSelected ? '#fff' : '#00d4ff';
      } else {
        ctx.fillStyle = isSelected ? '#fff' : 'rgba(255,255,255,0.5)';
      }
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Index label
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.font = `bold ${Math.round(r * 1.2)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i), cx, cy);
    }
  }
}

window.VectorEditor = VectorEditor;
