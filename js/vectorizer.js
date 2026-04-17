// vectorizer.js — TTF font to label maker vector conversion

const GRID = 8; // 9×9 coordinate grid (values 0–8 per axis)

// Default vectors from original message.ino — original 5×5 scale (coords 0–4)
const DEFAULT_VECTORS_RAW = [
  [  0,  124,  140,   32,  112,  200,  200,  200,  200,  200,  200,  200,  200,  200], // A
  [  0,  104,  134,  132,    2,  142,  140,  100,  200,  200,  200,  200,  200,  200], // B
  [ 41,  130,  110,  101,  103,  114,  134,  143,  200,  200,  200,  200,  200,  200], // C
  [  0,  104,  134,  143,  141,  130,  100,  200,  200,  200,  200,  200,  200,  200], // D
  [ 40,  100,  104,  144,   22,  102,  200,  200,  200,  200,  200,  200,  200,  200], // E
  [  0,  104,  144,   22,  102,  200,  200,  200,  200,  200,  200,  200,  200,  200], // F
  [ 44,  104,  100,  140,  142,  122,  200,  200,  200,  200,  200,  200,  200,  200], // G
  [  0,  104,    2,  142,   44,  140,  200,  200,  200,  200,  200,  200,  200,  200], // H
  [  0,  104,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // I
  [  1,  110,  130,  141,  144,  200,  200,  200,  200,  200,  200,  200,  200,  200], // J
  [  0,  104,    2,  142,  140,   22,  144,  200,  200,  200,  200,  200,  200,  200], // K
  [ 40,  100,  104,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // L
  [  0,  104,  122,  144,  140,  200,  200,  200,  200,  200,  200,  200,  200,  200], // M
  [  0,  104,  140,  144,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // N
  [ 10,  101,  103,  114,  134,  143,  141,  130,  110,  200,  200,  200,  200,  200], // O
  [  0,  104,  144,  142,  102,  200,  200,  200,  200,  200,  200,  200,  200,  200], // P
  [  0,  104,  144,  142,  120,  100,   22,  140,  200,  200,  200,  200,  200,  200], // Q
  [  0,  104,  144,  142,  102,   22,  140,  200,  200,  200,  200,  200,  200,  200], // R
  [  0,  140,  142,  102,  104,  144,  200,  200,  200,  200,  200,  200,  200,  200], // S
  [ 20,  124,    4,  144,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // T
  [  4,  101,  110,  130,  141,  144,  200,  200,  200,  200,  200,  200,  200,  200], // U
  [  4,  120,  144,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // V
  [  4,  100,  122,  140,  144,  200,  200,  200,  200,  200,  200,  200,  200,  200], // W
  [  0,  144,    4,  140,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // X
  [  4,  122,  144,   22,  120,  200,  200,  200,  200,  200,  200,  200,  200,  200], // Y
  [  4,  144,  100,  140,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // Z
  [  0,  104,  144,  140,  100,  144,  200,  200,  200,  200,  200,  200,  200,  200], // 0
  [  0,  140,   20,  124,  104,  200,  200,  200,  200,  200,  200,  200,  200,  200], // 1
  [  4,  144,  142,  102,  100,  140,  200,  200,  200,  200,  200,  200,  200,  200], // 2
  [  0,  140,  144,  104,   12,  142,  200,  200,  200,  200,  200,  200,  200,  200], // 3
  [ 20,  123,   42,  102,  104,  200,  200,  200,  200,  200,  200,  200,  200,  200], // 4
  [  0,  140,  142,  102,  104,  144,  200,  200,  200,  200,  200,  200,  200,  200], // 5
  [  2,  142,  140,  100,  104,  144,  200,  200,  200,  200,  200,  200,  200,  200], // 6
  [  0,  144,  104,   12,  132,  200,  200,  200,  200,  200,  200,  200,  200,  200], // 7
  [  0,  140,  144,  104,  100,    2,  142,  200,  200,  200,  200,  200,  200,  200], // 8
  [  0,  140,  144,  104,  102,  142,  200,  200,  200,  200,  200,  200,  200,  200], // 9
  [200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // (blank)
  [200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // (blank)
  [  0,  144,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // /
  [  0,  102,  124,  142,  140,   42,  102,    4,  103,   44,  143,  200,  200,  200], // Ä
  [  0,  102,  142,  140,  100,    2,   14,  113,   34,  133,  200,  200,  200,  200], // Ö
  [  4,  100,  140,  144,   14,  113,   34,  133,  200,  200,  200,  200,  200,  200], // Ü
  [  0,  111,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // ,
  [  2,  142,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // -
  [  0,  222,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // .
  [  0,  222,    1,  104,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // !
  [ 20,  222,   21,  122,  142,  144,  104,  200,  200,  200,  200,  200,  200,  200], // ?
  [  0,  104,  134,  133,  122,  142,  140,  110,  200,  200,  200,  200,  200,  200], // ß
  [ 23,  124,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // '
  [ 42,  120,  100,  101,  123,  124,  104,  103,  130,  140,  200,  200,  200,  200], // &
  [  2,  142,   20,  124,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // +
  [ 21,  222,   23,  222,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // :
  [ 10,  121,   22,  222,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // ;
  [ 14,  113,   33,  134,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // "
  [ 10,  114,   34,  130,   41,  101,    3,  143,  200,  200,  200,  200,  200,  200], // #
  [ 34,  124,  120,  130,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // (
  [ 10,  120,  124,  114,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // )
  [  1,  141,   43,  103,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // =
  [ 31,  133,  113,  111,  141,  144,  104,  100,  140,  200,  200,  200,  200,  200], // @
  [  2,  142,   20,  124,    4,  140,    0,  144,  200,  200,  200,  200,  200,  200], // *
  [  0,  140,  144,  104,  100,   12,  113,   33,  132,   31,  111,  200,  200,  200], // } smiley
  [  0,  140,  144,  104,  100,   13,  222,   33,  222,   32,  131,  111,  112,  132], // ~ open mouth smiley
  [ 20,  142,  143,  134,  123,  114,  103,  102,  120,  200,  200,  200,  200,  200], // $ heart
];

// Scale a single vector value from 5×5 (0–4) to 9×9 (0–8) by doubling coordinates
function _scale5to9(v) {
  if (v === 200 || v === 222) return v;
  const draw = v > 99;
  const code = draw ? v - 100 : v;
  return (draw ? 100 : 0) + (Math.floor(code / 10) * 2) * 10 + (code % 10) * 2;
}

// Default vectors scaled to 9×9 grid — used when no custom font is loaded
const DEFAULT_VECTORS = DEFAULT_VECTORS_RAW.map(char => char.map(_scale5to9));

// Which array index each char maps to (for display/editing labels)
const CHAR_LABELS = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  '0','1','2','3','4','5','6','7','8','9',
  '(spc1)','(spc2)','/',
  'Ä','Ö','Ü',
  ',','-','.',
  '!','?','ß',"'",'&','+',':',';','"','#','(',')','=','@','*',
  '} 😊','~ 😮','$ ♥'
];

// Character index → glyph character (shared by conversion, tile rendering, and editor)
const CHAR_MAP = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  '0','1','2','3','4','5','6','7','8','9',
  null, null, '/',
  'Ä','Ö','Ü',
  ',','-','.','!','?','ß',"'",'&','+',':',';','"','#','(',')','=','@','*',
  '}','~','$'
];

// ── Rasterize → skeleton → trace pipeline ────────────────────────────────────
// Renders each glyph to a bitmap, thins it to a 1-px skeleton via Zhang-Suen,
// then traces paths through the skeleton snapped to the 9×9 grid.

function _zhangSuen(binary, w, h) {
  const g = Uint8Array.from(binary);
  let changed = true;
  while (changed) {
    changed = false;
    for (let pass = 0; pass < 2; pass++) {
      const toRemove = [];
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          if (!g[y * w + x]) continue;
          const p2 = g[(y-1)*w + x],   p3 = g[(y-1)*w + x+1];
          const p4 = g[y*w   + x+1],   p5 = g[(y+1)*w + x+1];
          const p6 = g[(y+1)*w + x],   p7 = g[(y+1)*w + x-1];
          const p8 = g[y*w   + x-1],   p9 = g[(y-1)*w + x-1];
          const B = p2+p3+p4+p5+p6+p7+p8+p9;
          if (B < 2 || B > 6) continue;
          const seq = [p2,p3,p4,p5,p6,p7,p8,p9,p2];
          let A = 0;
          for (let k = 0; k < 8; k++) if (!seq[k] && seq[k+1]) A++;
          if (A !== 1) continue;
          if (pass === 0) {
            if (p2*p4*p6 !== 0) continue;
            if (p4*p6*p8 !== 0) continue;
          } else {
            if (p2*p4*p8 !== 0) continue;
            if (p2*p6*p8 !== 0) continue;
          }
          toRemove.push(y * w + x);
        }
      }
      if (toRemove.length) { changed = true; toRemove.forEach(i => g[i] = 0); }
    }
  }
  return g;
}

function _convertGlyphRaster(font, ch) {
  try {
    const glyph = font.charToGlyph(ch);
    const bb = glyph.getBoundingBox();
    if (!bb || bb.x1 === bb.x2 || bb.y1 === bb.y2) return null;

    // 1. Render glyph white-on-black at (GRID+1)*8 pixels
    const SIZE = (GRID + 1) * 8; // 72px for GRID=8
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = '#fff';
    const cW = bb.x2 - bb.x1, cH = bb.y2 - bb.y1;
    const scale = (SIZE * 0.85) / Math.max(cW, cH);
    const ox = (SIZE - cW * scale) / 2 - bb.x1 * scale;
    const oy = (SIZE - cH * scale) / 2 + bb.y2 * scale;
    ctx.fill(new Path2D(glyph.getPath(ox, oy, scale * font.unitsPerEm).toSVG()));

    // 2. Binary image
    const imgData = ctx.getImageData(0, 0, SIZE, SIZE).data;
    const binary = new Uint8Array(SIZE * SIZE);
    for (let i = 0; i < SIZE * SIZE; i++) binary[i] = imgData[i * 4] > 128 ? 1 : 0;

    // 3. Zhang-Suen skeleton
    const skel = _zhangSuen(binary, SIZE, SIZE);

    // 4. Snap skeleton pixels to GRID×GRID (canvas y=0 is top → grid gy=GRID)
    const CELL = SIZE / GRID;
    const gridSet = new Set();
    for (let py = 0; py < SIZE; py++) {
      for (let px = 0; px < SIZE; px++) {
        if (!skel[py * SIZE + px]) continue;
        const gx = Math.min(GRID, Math.round(px / CELL));
        const gy = Math.min(GRID, GRID - Math.round(py / CELL));
        gridSet.add(`${gx},${gy}`);
      }
    }
    if (gridSet.size === 0) return null;

    // 5. Build points and 8-directional adjacency
    const points = [...gridSet].map(k => {
      const [gx, gy] = k.split(',').map(Number);
      return { gx, gy, visited: false };
    });
    const keyToIdx = {};
    points.forEach((p, i) => { keyToIdx[`${p.gx},${p.gy}`] = i; });
    const adj = points.map(p => {
      const nbrs = [];
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const k = `${p.gx+dx},${p.gy+dy}`;
          if (k in keyToIdx) nbrs.push(keyToIdx[k]);
        }
      return nbrs;
    });

    // 6. Trace paths via Warnsdorff DFS (minimise dead-ends)
    const entries = [];
    const MAX = 13;

    const unvisited = i => adj[i].filter(j => !points[j].visited);

    function findStart() {
      for (let i = 0; i < points.length; i++)
        if (!points[i].visited && unvisited(i).length <= 1) return i;
      for (let i = 0; i < points.length; i++)
        if (!points[i].visited) return i;
      return -1;
    }

    while (entries.length < MAX) {
      const si = findStart();
      if (si < 0) break;
      points[si].visited = true;
      entries.push(points[si].gx * 10 + points[si].gy); // move
      let cur = si;
      while (entries.length < MAX) {
        const nbrs = unvisited(cur);
        if (!nbrs.length) break;
        nbrs.sort((a, b) => unvisited(a).length - unvisited(b).length);
        const next = nbrs[0];
        points[next].visited = true;
        entries.push(100 + points[next].gx * 10 + points[next].gy); // draw
        cur = next;
      }
    }

    if (!entries.length) return null;
    while (entries.length < 14) entries.push(200);
    return entries.slice(0, 14);
  } catch (e) {
    return null;
  }
}

// Convert all convertible characters from a loaded opentype font.
function convertFont(font) {
  const out = DEFAULT_VECTORS.map(v => [...v]);
  for (let idx = 0; idx < CHAR_MAP.length; idx++) {
    const ch = CHAR_MAP[idx];
    if (!ch) continue;
    try {
      const vec = _convertGlyphRaster(font, ch);
      if (vec && vec[0] !== 200) out[idx] = vec;
    } catch (e) {
      console.warn('convertFont failed for', ch, ':', e);
    }
  }
  return out;
}

// Render the actual TTF glyph onto a canvas tile (image-based display)
function renderGlyphToCanvas(font, charIndex, canvas) {
  const size = canvas.width;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, size, size);
  const ch = CHAR_MAP[charIndex];
  if (!ch) return;
  try {
    const glyph = font.charToGlyph(ch);
    const bb = glyph.getBoundingBox();
    if (!bb || bb.x1 === bb.x2 || bb.y1 === bb.y2) return;
    const cW = bb.x2 - bb.x1, cH = bb.y2 - bb.y1;
    const scale = (size * 0.8) / Math.max(cW, cH);
    const ox = (size - cW * scale) / 2 - bb.x1 * scale;
    const oy = (size - cH * scale) / 2 + bb.y2 * scale;
    ctx.fillStyle = '#ffffff';
    ctx.fill(new Path2D(glyph.getPath(ox, oy, scale * font.unitsPerEm).toSVG()));
  } catch (e) {}
}

// Render vector strokes onto a canvas (fallback when no font loaded, or preview)
function renderVectorToCanvas(vectors, canvas, opts = {}) {
  const { bgColor = '#1a1a2e', strokeColor = '#00d4ff', dotColor = '#ff6b6b', size = canvas.width } = opts;
  const ctx = canvas.getContext('2d');
  const cell = size / GRID;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  const toX = gx => gx * cell;
  const toY = gy => (GRID - gy) * cell;

  let cx = 0, cy = 0;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = Math.max(1.5, size / 50);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const v of vectors) {
    if (v === 200) break;
    if (v === 222) {
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(toX(cx), toY(cy), ctx.lineWidth * 1.2, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    let draw = false, code = v;
    if (code > 99) { draw = true; code -= 100; }
    const gx = Math.floor(code / 10);
    const gy = code % 10;
    if (draw) {
      ctx.beginPath();
      ctx.moveTo(toX(cx), toY(cy));
      ctx.lineTo(toX(gx), toY(gy));
      ctx.stroke();
    }
    cx = gx; cy = gy;
  }
}

window.Vectorizer = { DEFAULT_VECTORS, CHAR_LABELS, CHAR_MAP, GRID, convertFont, renderGlyphToCanvas, renderVectorToCanvas };
