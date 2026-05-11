// vectorizer.js — TTF font to label maker vector conversion

const GRID = 8; // 9×9 coordinate grid (values 0–8 per axis)

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

function _scale5to9(v) {
  if (v === 200 || v === 222) return v;
  const draw = v > 99;
  const code = draw ? v - 100 : v;
  return (draw ? 100 : 0) + (Math.floor(code / 10) * 2) * 10 + (code % 10) * 2;
}

const DEFAULT_VECTORS = DEFAULT_VECTORS_RAW.map(char => char.map(_scale5to9));

const CHAR_LABELS = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  '0','1','2','3','4','5','6','7','8','9',
  '(spc1)','(spc2)','/',
  'Ä','Ö','Ü',
  ',','-','.',
  '!','?','ß',"'",'&','+',':',';','"','#','(',')','=','@','*',
  '} 😊','~ 😮','$ ♥'
];

const CHAR_MAP = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  '0','1','2','3','4','5','6','7','8','9',
  null, null, '/',
  'Ä','Ö','Ü',
  ',','-','.','!','?','ß',"'",'&','+',':',';','"','#','(',')','=','@','*',
  '}','~','$'
];

// ── Outline tracing pipeline ──────────────────────────────────────────────────

function _extractContours(commands) {
  const contours = [];
  let cur = [];
  for (const cmd of commands) {
    if (cmd.type === 'M' && cur.length) { contours.push(cur); cur = []; }
    cur.push(cmd);
    if (cmd.type === 'Z') { contours.push(cur); cur = []; }
  }
  if (cur.length) contours.push(cur);
  return contours;
}

function _sampleContour(cmds) {
  const pts = [];
  let cx = 0, cy = 0, sx = 0, sy = 0;
  for (const cmd of cmds) {
    if (cmd.type === 'M') {
      cx = sx = cmd.x; cy = sy = cmd.y;
      pts.push({ x: cx, y: cy });
    } else if (cmd.type === 'L') {
      cx = cmd.x; cy = cmd.y;
      pts.push({ x: cx, y: cy });
    } else if (cmd.type === 'C') {
      for (let ti = 1; ti <= 8; ti++) {
        const t = ti / 8, u = 1 - t;
        pts.push({
          x: u*u*u*cx + 3*u*u*t*cmd.x1 + 3*u*t*t*cmd.x2 + t*t*t*cmd.x,
          y: u*u*u*cy + 3*u*u*t*cmd.y1 + 3*u*t*t*cmd.y2 + t*t*t*cmd.y
        });
      }
      cx = cmd.x; cy = cmd.y;
    } else if (cmd.type === 'Q') {
      for (let ti = 1; ti <= 8; ti++) {
        const t = ti / 8, u = 1 - t;
        pts.push({
          x: u*u*cx + 2*u*t*cmd.x1 + t*t*cmd.x,
          y: u*u*cy + 2*u*t*cmd.y1 + t*t*cmd.y
        });
      }
      cx = cmd.x; cy = cmd.y;
    } else if (cmd.type === 'Z') {
      pts.push({ x: sx, y: sy });
    }
  }
  return pts;
}

// Shoelace signed area in grid coords (gy increases upward).
// Negative = outer filled contour (CW in screen); positive = inner hole (CCW in screen).
function _signedArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length - 1; i++)
    a += pts[i].gx * pts[i + 1].gy - pts[i + 1].gx * pts[i].gy;
  return a / 2;
}

// Attach direction-change angle to each interior snapped point.
function _attachAngles(pts) {
  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1], cur = pts[i], next = pts[i + 1];
    const a1 = Math.atan2(cur.gy - prev.gy, cur.gx - prev.gx);
    const a2 = Math.atan2(next.gy - cur.gy, next.gx - cur.gx);
    let diff = Math.abs(a2 - a1);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    pts[i].angle = diff;
  }
}

// Angle-weighted RDP: effective_distance = geom * (1 + angle/π).
// A 90° corner at distance d resists removal 1.5× harder than a non-corner at d.
// A corner sitting on the simplification line (geom≈0) is still removed.
function _rdpSimplify(pts, epsilon) {
  if (pts.length <= 2) return pts;
  const { gx: x1, gy: y1 } = pts[0];
  const { gx: x2, gy: y2 } = pts[pts.length - 1];
  const lineLen = Math.hypot(x2 - x1, y2 - y1);
  let maxDist = 0, maxIdx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const { gx: px, gy: py, angle = 0 } = pts[i];
    const geom = lineLen < 1e-9
      ? Math.hypot(px - x1, py - y1)
      : Math.abs((y2 - y1) * px - (x2 - x1) * py + x2 * y1 - y2 * x1) / lineLen;
    const d = geom * (1 + angle / Math.PI);
    if (d > maxDist) { maxDist = d; maxIdx = i; }
  }
  if (maxDist <= epsilon) return [pts[0], pts[pts.length - 1]];
  return [
    ..._rdpSimplify(pts.slice(0, maxIdx + 1), epsilon).slice(0, -1),
    ..._rdpSimplify(pts.slice(maxIdx), epsilon)
  ];
}

function _rdpToCount(pts, n) {
  if (pts.length <= n) return pts;
  let lo = 0, hi = GRID * 2;
  for (let iter = 0; iter < 28; iter++) {
    const mid = (lo + hi) / 2;
    const len = _rdpSimplify(pts, mid).length;
    if (len === n) { lo = hi = mid; break; }
    if (len > n) lo = mid; else hi = mid;
  }
  return _rdpSimplify(pts, (lo + hi) / 2);
}

function _snapPath(pts, CELL) {
  const result = [];
  let lastKey = null;
  for (const pt of pts) {
    const gx = Math.min(GRID, Math.max(0, Math.round(pt.x / CELL)));
    const gy = Math.min(GRID, Math.max(0, GRID - Math.round(pt.y / CELL)));
    const key = `${gx},${gy}`;
    if (key !== lastKey) { result.push({ gx, gy }); lastKey = key; }
  }
  return result;
}

function _convertGlyphOutline(font, ch) {
  try {
    const glyph = font.charToGlyph(ch);
    const bb = glyph.getBoundingBox();
    if (!bb || bb.x1 === bb.x2 || bb.y1 === bb.y2) return null;

    const SIZE = (GRID + 1) * 8;
    const CELL = SIZE / GRID;
    const cW = bb.x2 - bb.x1, cH = bb.y2 - bb.y1;
    const scale = (SIZE * 0.85) / Math.max(cW, cH);
    const ox = (SIZE - cW * scale) / 2 - bb.x1 * scale;
    const oy = (SIZE - cH * scale) / 2 + bb.y2 * scale;

    const path = glyph.getPath(ox, oy, scale * font.unitsPerEm);
    const allContours = _extractContours(path.commands)
      .map(cmds => {
        const pts = _snapPath(_sampleContour(cmds), CELL);
        _attachAngles(pts);
        return pts;
      })
      .filter(pts => pts.length >= 3);

    if (!allContours.length) return null;

    // Keep only outer (filled) contours — negative signed area in our grid coords.
    // This drops inner counter/holes (A, B, D, O, etc.) so all budget goes to outer shape.
    // Falls back to all contours if winding detection yields nothing (unusual fonts).
    const outerContours = allContours.filter(pts => _signedArea(pts) < 0);
    const contours = outerContours.length ? outerContours : allContours;

    // Sort descending by point count; drop any that can't get min 3 pts
    contours.sort((a, b) => b.length - a.length);
    const MAX = 13;
    while (contours.length > 0 && contours.length * 3 > MAX) contours.pop();
    if (!contours.length) return null;

    // Proportional allocation, minimum 3 per contour
    const totalLen = contours.reduce((s, c) => s + c.length, 0);
    const allocs = contours.map(c => Math.max(3, Math.floor(MAX * c.length / totalLen)));
    let sum = allocs.reduce((s, a) => s + a, 0);
    for (let i = allocs.length - 1; i >= 0 && sum > MAX; i--) {
      const cut = Math.min(sum - MAX, allocs[i] - 3);
      allocs[i] -= cut; sum -= cut;
    }

    const entries = [];
    for (let ci = 0; ci < contours.length && entries.length < MAX; ci++) {
      const pts = contours[ci];
      const n = allocs[ci];

      const sub = _rdpToCount(pts, n);

      const deduped = [sub[0]];
      for (let j = 1; j < sub.length; j++) {
        const p = sub[j], q = deduped[deduped.length - 1];
        if (p.gx !== q.gx || p.gy !== q.gy) deduped.push(p);
      }
      if (deduped.length < 2) continue;

      entries.push(deduped[0].gx * 10 + deduped[0].gy);
      for (let j = 1; j < deduped.length && entries.length < MAX; j++)
        entries.push(100 + deduped[j].gx * 10 + deduped[j].gy);
      const first = deduped[0], last = deduped[deduped.length - 1];
      if ((first.gx !== last.gx || first.gy !== last.gy) && entries.length < MAX)
        entries.push(100 + first.gx * 10 + first.gy);
    }

    if (!entries.length) return null;
    while (entries.length < 14) entries.push(200);
    return entries.slice(0, 14);
  } catch (e) {
    return null;
  }
}

function convertFont(font) {
  const out = DEFAULT_VECTORS.map(v => [...v]);
  for (let idx = 0; idx < CHAR_MAP.length; idx++) {
    const ch = CHAR_MAP[idx];
    if (!ch) continue;
    try {
      const vec = _convertGlyphOutline(font, ch);
      if (vec && vec[0] !== 200) out[idx] = vec;
    } catch (e) {
      console.warn('convertFont failed for', ch, ':', e);
    }
  }
  return out;
}

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
    const tilePath = glyph.getPath(ox, oy, scale * font.unitsPerEm);
    tilePath.fill = '#ffffff';
    tilePath.draw(ctx);
  } catch (e) {}
}

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
