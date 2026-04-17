// vectorizer.js — TTF font to label maker vector conversion

// Default vectors from original message.ino (63 characters, 14 values each)
// Encoding: ones=Y(0-4), tens=X(0-4), hundreds=draw(1)/move(0), 200=end, 222=dot
const DEFAULT_VECTORS = [
  [  0,  124,  140,   32,  112,  200,  200,  200,  200,  200,  200,  200,  200,  200], // A  [0]
  [  0,  104,  134,  132,    2,  142,  140,  100,  200,  200,  200,  200,  200,  200], // B  [1]
  [ 41,  130,  110,  101,  103,  114,  134,  143,  200,  200,  200,  200,  200,  200], // C  [2]
  [  0,  104,  134,  143,  141,  130,  100,  200,  200,  200,  200,  200,  200,  200], // D  [3]
  [ 40,  100,  104,  144,   22,  102,  200,  200,  200,  200,  200,  200,  200,  200], // E  [4]
  [  0,  104,  144,   22,  102,  200,  200,  200,  200,  200,  200,  200,  200,  200], // F  [5]
  [ 44,  104,  100,  140,  142,  122,  200,  200,  200,  200,  200,  200,  200,  200], // G  [6]
  [  0,  104,    2,  142,   44,  140,  200,  200,  200,  200,  200,  200,  200,  200], // H  [7]
  [  0,  104,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // I  [8]
  [  1,  110,  130,  141,  144,  200,  200,  200,  200,  200,  200,  200,  200,  200], // J  [9]
  [  0,  104,    2,  142,  140,   22,  144,  200,  200,  200,  200,  200,  200,  200], // K  [10]
  [ 40,  100,  104,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // L  [11]
  [  0,  104,  122,  144,  140,  200,  200,  200,  200,  200,  200,  200,  200,  200], // M  [12]
  [  0,  104,  140,  144,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // N  [13]
  [ 10,  101,  103,  114,  134,  143,  141,  130,  110,  200,  200,  200,  200,  200], // O  [14]
  [  0,  104,  144,  142,  102,  200,  200,  200,  200,  200,  200,  200,  200,  200], // P  [15]
  [  0,  104,  144,  142,  120,  100,   22,  140,  200,  200,  200,  200,  200,  200], // Q  [16]
  [  0,  104,  144,  142,  102,   22,  140,  200,  200,  200,  200,  200,  200,  200], // R  [17]
  [  0,  140,  142,  102,  104,  144,  200,  200,  200,  200,  200,  200,  200,  200], // S  [18]
  [ 20,  124,    4,  144,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // T  [19]
  [  4,  101,  110,  130,  141,  144,  200,  200,  200,  200,  200,  200,  200,  200], // U  [20]
  [  4,  120,  144,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // V  [21]
  [  4,  100,  122,  140,  144,  200,  200,  200,  200,  200,  200,  200,  200,  200], // W  [22]
  [  0,  144,    4,  140,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // X  [23]
  [  4,  122,  144,   22,  120,  200,  200,  200,  200,  200,  200,  200,  200,  200], // Y  [24]
  [  4,  144,  100,  140,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // Z  [25]
  [  0,  104,  144,  140,  100,  144,  200,  200,  200,  200,  200,  200,  200,  200], // 0  [26]
  [  0,  140,   20,  124,  104,  200,  200,  200,  200,  200,  200,  200,  200,  200], // 1  [27]
  [  4,  144,  142,  102,  100,  140,  200,  200,  200,  200,  200,  200,  200,  200], // 2  [28]
  [  0,  140,  144,  104,   12,  142,  200,  200,  200,  200,  200,  200,  200,  200], // 3  [29]
  [ 20,  123,   42,  102,  104,  200,  200,  200,  200,  200,  200,  200,  200,  200], // 4  [30]
  [  0,  140,  142,  102,  104,  144,  200,  200,  200,  200,  200,  200,  200,  200], // 5  [31]
  [  2,  142,  140,  100,  104,  144,  200,  200,  200,  200,  200,  200,  200,  200], // 6  [32]
  [  0,  144,  104,   12,  132,  200,  200,  200,  200,  200,  200,  200,  200,  200], // 7  [33]
  [  0,  140,  144,  104,  100,    2,  142,  200,  200,  200,  200,  200,  200,  200], // 8  [34]
  [  0,  140,  144,  104,  102,  142,  200,  200,  200,  200,  200,  200,  200,  200], // 9  [35]
  [200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // (blank) [36]
  [200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // (blank) [37]
  [  0,  144,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // /  [38]
  [  0,  102,  124,  142,  140,   42,  102,    4,  103,   44,  143,  200,  200,  200], // Ä  [39]
  [  0,  102,  142,  140,  100,    2,   14,  113,   34,  133,  200,  200,  200,  200], // Ö  [40]
  [  4,  100,  140,  144,   14,  113,   34,  133,  200,  200,  200,  200,  200,  200], // Ü  [41]
  [  0,  111,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // ,  [42]
  [  2,  142,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // -  [43]
  [  0,  222,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // .  [44]
  [  0,  222,    1,  104,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // !  [45]
  [ 20,  222,   21,  122,  142,  144,  104,  200,  200,  200,  200,  200,  200,  200], // ?  [46]
  [  0,  104,  134,  133,  122,  142,  140,  110,  200,  200,  200,  200,  200,  200], // ß  [47]
  [ 23,  124,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // '  [48]
  [ 42,  120,  100,  101,  123,  124,  104,  103,  130,  140,  200,  200,  200,  200], // &  [49]
  [  2,  142,   20,  124,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // +  [50]
  [ 21,  222,   23,  222,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // :  [51]
  [ 10,  121,   22,  222,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // ;  [52]
  [ 14,  113,   33,  134,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // "  [53]
  [ 10,  114,   34,  130,   41,  101,    3,  143,  200,  200,  200,  200,  200,  200], // #  [54]
  [ 34,  124,  120,  130,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // (  [55]
  [ 10,  120,  124,  114,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // )  [56]
  [  1,  141,   43,  103,  200,  200,  200,  200,  200,  200,  200,  200,  200,  200], // =  [57]
  [ 31,  133,  113,  111,  141,  144,  104,  100,  140,  200,  200,  200,  200,  200], // @  [58]
  [  2,  142,   20,  124,    4,  140,    0,  144,  200,  200,  200,  200,  200,  200], // *  [59]
  [  0,  140,  144,  104,  100,   12,  113,   33,  132,   31,  111,  200,  200,  200], // } smiley [60]
  [  0,  140,  144,  104,  100,   13,  222,   33,  222,   32,  131,  111,  112,  132], // ~ open mouth smiley [61]
  [ 20,  142,  143,  134,  123,  114,  103,  102,  120,  200,  200,  200,  200,  200], // $ heart [62]
];

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

// Character index → glyph lookup (shared by conversion, tile rendering, and editor)
const CHAR_MAP = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  '0','1','2','3','4','5','6','7','8','9',
  null, null, '/',
  'Ä','Ö','Ü',
  ',','-','.','!','?','ß',"'",'&','+',':',';','"','#','(',')','=','@','*',
  '}','~','$'
];

// ── Outline-based conversion pipeline ────────────────────────────────────────
// Samples the font's actual bezier curves directly — no rasterization/thinning.

function sampleCubic(x0,y0, x1,y1, x2,y2, x3,y3, n) {
  const pts = [];
  for (let i = 1; i <= n; i++) {
    const t = i/n, u = 1-t;
    pts.push([
      u*u*u*x0 + 3*u*u*t*x1 + 3*u*t*t*x2 + t*t*t*x3,
      u*u*u*y0 + 3*u*u*t*y1 + 3*u*t*t*y2 + t*t*t*y3
    ]);
  }
  return pts;
}

function sampleQuad(x0,y0, x1,y1, x2,y2, n) {
  const pts = [];
  for (let i = 1; i <= n; i++) {
    const t = i/n, u = 1-t;
    pts.push([u*u*x0 + 2*u*t*x1 + t*t*x2, u*u*y0 + 2*u*t*y1 + t*t*y2]);
  }
  return pts;
}

// Returns {contours, bb} where contours are arrays of [x,y] in font units.
function getGlyphContours(font, char) {
  try {
    const glyph = font.charToGlyph(char);
    if (!glyph || !glyph.path) return null;
    const bb = glyph.getBoundingBox();
    if (!bb || bb.x1 === bb.x2 || bb.y1 === bb.y2) return null;

    const contours = [];
    let cur = null, cx = 0, cy = 0;

    for (const cmd of glyph.path.commands) {
      switch (cmd.type) {
        case 'M':
          if (cur && cur.length > 1) contours.push(cur);
          cur = [[cmd.x, cmd.y]]; cx = cmd.x; cy = cmd.y; break;
        case 'L':
          if (cur) cur.push([cmd.x, cmd.y]);
          cx = cmd.x; cy = cmd.y; break;
        case 'C':
          if (cur) cur.push(...sampleCubic(cx,cy, cmd.x1,cmd.y1, cmd.x2,cmd.y2, cmd.x,cmd.y, 8));
          cx = cmd.x; cy = cmd.y; break;
        case 'Q':
          if (cur) cur.push(...sampleQuad(cx,cy, cmd.x1,cmd.y1, cmd.x,cmd.y, 8));
          cx = cmd.x; cy = cmd.y; break;
        case 'Z':
          if (cur && cur.length > 1) { cur.push(cur[0]); contours.push(cur); }
          cur = null; cx = 0; cy = 0; break;
      }
    }
    if (cur && cur.length > 1) contours.push(cur);

    return contours.length > 0 ? { contours, bb } : null;
  } catch (e) {
    return null;
  }
}

function douglasPeucker(pts, eps) {
  if (pts.length < 3) return pts;
  let maxD = 0, maxI = 0;
  const [x1, y1] = pts[0], [x2, y2] = pts[pts.length-1];
  const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx+dy*dy);
  for (let i = 1; i < pts.length-1; i++) {
    const d = len > 0
      ? Math.abs(dy*pts[i][0] - dx*pts[i][1] + x2*y1 - y2*x1) / len
      : Math.hypot(pts[i][0]-x1, pts[i][1]-y1);
    if (d > maxD) { maxD = d; maxI = i; }
  }
  if (maxD > eps) {
    const l = douglasPeucker(pts.slice(0, maxI+1), eps);
    const r = douglasPeucker(pts.slice(maxI), eps);
    return l.slice(0,-1).concat(r);
  }
  return [pts[0], pts[pts.length-1]];
}

// Converts font-unit contours to a 14-entry vector array (5×5 grid).
function encodeContoursToVector(contours, bb) {
  const GRID = 4;
  const bW = bb.x2 - bb.x1;
  const bH = bb.y2 - bb.y1;
  const span = Math.max(bW, bH);

  function norm(x, y) {
    return {
      x: Math.min(GRID, Math.max(0, Math.round((x - bb.x1) / span * GRID))),
      y: Math.min(GRID, Math.max(0, Math.round((bb.y2 - y) / span * GRID))) // flip Y
    };
  }

  // Longest contour first (outer outline)
  const sorted = [...contours].sort((a, b) => b.length - a.length);
  const entries = [];

  for (const contour of sorted) {
    if (entries.length >= 13) break;

    const simplified = douglasPeucker(contour, span / 16);
    const gridPts = simplified.map(([x, y]) => norm(x, y));

    const deduped = [gridPts[0]];
    for (let i = 1; i < gridPts.length; i++) {
      const p = gridPts[i], q = deduped[deduped.length-1];
      if (p.x !== q.x || p.y !== q.y) deduped.push(p);
    }
    if (deduped.length < 2) continue;

    const room = 14 - entries.length;
    if (room < 2) break;
    const pts = deduped.slice(0, room);

    entries.push(pts[0].x * 10 + pts[0].y);
    for (let i = 1; i < pts.length; i++) entries.push(100 + pts[i].x * 10 + pts[i].y);
  }

  while (entries.length < 14) entries.push(200);
  return entries.slice(0, 14);
}

// Convert all convertible characters from a loaded opentype font.
// Returns array of 63 vector arrays (indices matching DEFAULT_VECTORS).
function convertFont(font) {
  const out = DEFAULT_VECTORS.map(v => [...v]);

  for (let idx = 0; idx < CHAR_MAP.length; idx++) {
    const ch = CHAR_MAP[idx];
    if (!ch) continue;
    try {
      const glyphData = getGlyphContours(font, ch);
      if (!glyphData) continue;
      const vec = encodeContoursToVector(glyphData.contours, glyphData.bb);
      if (vec[0] !== 200) out[idx] = vec;
    } catch (e) {
      console.warn('convertFont failed for', ch, ':', e);
    }
  }

  return out;
}

// Render the actual TTF glyph onto a canvas tile (image-based, not vector strokes)
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
    const charW = bb.x2 - bb.x1, charH = bb.y2 - bb.y1;
    const scale = (size * 0.8) / Math.max(charW, charH);
    const ox = (size - charW * scale) / 2 - bb.x1 * scale;
    const oy = (size - charH * scale) / 2 + bb.y2 * scale;
    ctx.fillStyle = '#ffffff';
    const path = glyph.getPath(ox, oy, scale * font.unitsPerEm);
    ctx.fill(new Path2D(path.toSVG()));
  } catch (e) {}
}

// Render a single glyph preview onto a canvas (for character grid display)
// Draws the vector strokes, not the TTF outline
function renderVectorToCanvas(vectors, canvas, opts = {}) {
  const { bgColor = '#1a1a2e', strokeColor = '#00d4ff', dotColor = '#ff6b6b', size = canvas.width } = opts;
  const ctx = canvas.getContext('2d');
  const cell = size / 4;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  const toCanvasX = gx => gx * cell;
  const toCanvasY = gy => (4 - gy) * cell; // flip Y: grid y=0 is bottom

  let cx = 0, cy = 0;
  let penDown = false;

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = Math.max(1.5, size / 50);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const v of vectors) {
    if (v === 200) break;

    if (v === 222) {
      // Plot single dot
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(toCanvasX(cx), toCanvasY(cy), ctx.lineWidth * 1.2, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    let draw = false, code = v;
    if (code > 99) { draw = true; code -= 100; }
    const gx = Math.floor(code / 10);
    const gy = code % 10;
    const px = toCanvasX(gx), py = toCanvasY(gy);

    if (draw) {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(cx), toCanvasY(cy));
      ctx.lineTo(px, py);
      ctx.stroke();
    }
    cx = gx; cy = gy;
  }
}

window.Vectorizer = { DEFAULT_VECTORS, CHAR_LABELS, CHAR_MAP, convertFont, renderGlyphToCanvas, renderVectorToCanvas };
