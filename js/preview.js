// preview.js — Label preview canvas renderer

class LabelPreview {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.vectorData = Vectorizer.DEFAULT_VECTORS.map(v => [...v]);
  }

  setVectorData(data) {
    this.vectorData = data.map(v => [...v]);
  }

  // Map a character to its vector array index (mirrors plotCharacter in message.ino)
  _charToIndex(c) {
    const code = c.charCodeAt(0);
    if (code > 64 && code < 91)  return code - 65;       // A-Z
    if (code > 96 && code < 123) return code - 97;       // a-z (same as uppercase)
    if (code > 47 && code < 58)  return code - 22;       // 0-9
    if (code === 32)  return 36;   // space (blank)
    if (code === 44)  return 42;   // ,
    if (code === 45)  return 43;   // -
    if (code === 46)  return 44;   // .
    if (code === 33)  return 45;   // !
    if (code === 63)  return 46;   // ?
    if (code === 39)  return 48;   // '
    if (code === 38)  return 49;   // &
    if (code === 43)  return 50;   // +
    if (code === 58)  return 51;   // :
    if (code === 59)  return 52;   // ;
    if (code === 34)  return 53;   // "
    if (code === 35)  return 54;   // #
    if (code === 40)  return 55;   // (
    if (code === 41)  return 56;   // )
    if (code === 61)  return 57;   // =
    if (code === 64)  return 58;   // @
    if (code === 42)  return 59;   // *
    if (code === 125) return 60;   // }
    if (code === 126) return 61;   // ~
    if (code === 36)  return 62;   // $
    if (code === 47)  return 38;   // /
    return 38; // default: /
  }

  render(text) {
    const canvas = this.canvas;
    const ctx = this.ctx;
    const W = canvas.width, H = canvas.height;

    ctx.fillStyle = '#f5f0e8'; // tape color
    ctx.fillRect(0, 0, W, H);

    // Tape edge lines
    ctx.strokeStyle = '#d4c8b0';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(W, 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, H-8); ctx.lineTo(W, H-8); ctx.stroke();

    if (!text || !text.trim()) {
      ctx.fillStyle = '#aaa';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Type text above to preview your label', W/2, H/2);
      return;
    }

    const CELL = Math.floor((H - 28) / 4); // cell size in pixels based on canvas height
    const CHAR_W = CELL * 5;               // each character occupies 5 cells width
    const totalW = text.length * CHAR_W + CELL;
    const startX = Math.max(16, (W - totalW) / 2);
    const baseY = 14; // top margin

    ctx.strokeStyle = '#222';
    ctx.lineWidth = Math.max(1.5, CELL / 8);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const toCanvasX = (gx, offsetX) => offsetX + gx * CELL;
    const toCanvasY = (gy) => baseY + (4 - gy) * CELL;

    let xOffset = startX;

    for (const ch of text) {
      const idx = this._charToIndex(ch);
      const vec = this.vectorData[idx] || Vectorizer.DEFAULT_VECTORS[idx];

      let cx = 0, cy = 0;

      for (const v of vec) {
        if (v === 200) break;
        if (v === 222) {
          ctx.fillStyle = '#222';
          ctx.beginPath();
          ctx.arc(toCanvasX(cx, xOffset), toCanvasY(cy), ctx.lineWidth * 1.2, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }
        let draw = false, code = v;
        if (code > 99) { draw = true; code -= 100; }
        const gx = Math.floor(code / 10);
        const gy = code % 10;

        if (draw) {
          ctx.beginPath();
          ctx.moveTo(toCanvasX(cx, xOffset), toCanvasY(cy));
          ctx.lineTo(toCanvasX(gx, xOffset), toCanvasY(gy));
          ctx.stroke();
        }
        cx = gx; cy = gy;
      }

      xOffset += CHAR_W;
    }
  }
}

window.LabelPreview = LabelPreview;
