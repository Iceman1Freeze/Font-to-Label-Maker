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

// Chars we attempt to auto-convert from the TTF (others use defaults)
const AUTO_CONVERT_INDICES = [
  0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25, // A-Z
  26,27,28,29,30,31,32,33,34,35, // 0-9
  38, // /
  42,43,44,45,46, // , - . ! ?
  48,49,50,51,52,53,54,55,56,57,58,59, // ' & + : ; " # ( ) = @ *
];

// Render size for thinning (higher = better quality skeleton)
const RENDER_SIZE = 40;

function zhangSuenThinning(pixels, w, h) {
  const img = new Uint8Array(pixels);

  const get = (x, y) => (x < 0 || x >= w || y < 0 || y >= h) ? 0 : (img[y * w + x] ? 1 : 0);

  function neighbors(x, y) {
    return [
      get(x, y-1),   // P2 N
      get(x+1, y-1), // P3 NE
      get(x+1, y),   // P4 E
      get(x+1, y+1), // P5 SE
      get(x, y+1),   // P6 S
      get(x-1, y+1), // P7 SW
      get(x-1, y),   // P8 W
      get(x-1, y-1)  // P9 NW
    ];
  }

  function B(n) { return n.reduce((a, v) => a + v, 0); }
  function A(n) {
    let c = 0;
    for (let i = 0; i < 8; i++) if (n[i] === 0 && n[(i+1) % 8] === 1) c++;
    return c;
  }

  let changed = true;
  while (changed) {
    changed = false;
    const del1 = [], del2 = [];

    for (let y = 1; y < h-1; y++) {
      for (let x = 1; x < w-1; x++) {
        if (!img[y*w+x]) continue;
        const n = neighbors(x, y);
        const b = B(n), a = A(n);
        // n[0]=P2, n[2]=P4, n[4]=P6, n[6]=P8
        if (b >= 2 && b <= 6 && a === 1 && n[0]*n[2]*n[4] === 0 && n[2]*n[4]*n[6] === 0)
          del1.push(y*w+x);
      }
    }
    for (const i of del1) { img[i] = 0; changed = true; }

    for (let y = 1; y < h-1; y++) {
      for (let x = 1; x < w-1; x++) {
        if (!img[y*w+x]) continue;
        const n = neighbors(x, y);
        const b = B(n), a = A(n);
        if (b >= 2 && b <= 6 && a === 1 && n[0]*n[2]*n[6] === 0 && n[0]*n[4]*n[6] === 0)
          del2.push(y*w+x);
      }
    }
    for (const i of del2) { img[i] = 0; changed = true; }
  }
  return img;
}

function tracePaths(skeleton, w, h) {
  const get = (x, y) => (x < 0 || x >= w || y < 0 || y >= h) ? 0 : skeleton[y*w+x];
  const visited = new Uint8Array(w * h);

  function neighborCount(x, y) {
    let c = 0;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++)
        if ((dx || dy) && get(x+dx, y+dy)) c++;
    return c;
  }

  // Collect all skeleton pixels; identify endpoints (1 neighbor)
  const allPixels = [];
  const endpoints = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (skeleton[y*w+x]) {
        allPixels.push([x, y]);
        if (neighborCount(x, y) === 1) endpoints.push([x, y]);
      }
    }
  }
  if (!allPixels.length) return [];
  if (!endpoints.length) endpoints.push(allPixels[0]);

  const paths = [];

  function traceFrom(sx, sy) {
    if (visited[sy*w+sx]) return;
    const path = [[sx, sy]];
    visited[sy*w+sx] = 1;
    let cx = sx, cy = sy;

    while (true) {
      let found = false;
      // Prefer straight paths (check cardinal directions first, then diagonals)
      const dirs = [[0,-1],[0,1],[-1,0],[1,0],[-1,-1],[1,-1],[-1,1],[1,1]];
      for (const [dx, dy] of dirs) {
        const nx = cx+dx, ny = cy+dy;
        if (get(nx, ny) && !visited[ny*w+nx]) {
          visited[ny*w+nx] = 1;
          path.push([nx, ny]);
          cx = nx; cy = ny;
          found = true;
          break;
        }
      }
      if (!found) break;
    }
    if (path.length > 0) paths.push(path);
  }

  for (const [x, y] of endpoints) traceFrom(x, y);
  // Catch any unvisited pixels (disconnected strokes)
  for (const [x, y] of allPixels) traceFrom(x, y);

  return paths;
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

function pixelToGrid(px, py, size) {
  return {
    x: Math.min(4, Math.max(0, Math.round(px / (size-1) * 4))),
    y: Math.min(4, Math.max(0, 4 - Math.round(py / (size-1) * 4))) // flip Y
  };
}

function encodePathsToVector(paths, size) {
  const entries = [];

  for (const path of paths) {
    if (!path.length) continue;

    // Simplify path with Douglas-Peucker (epsilon = 1 pixel)
    const simplified = douglasPeucker(path, 1.0);

    // Map to 0-4 grid
    const gridPts = simplified.map(([px, py]) => pixelToGrid(px, py, size));

    // Deduplicate consecutive identical points
    const deduped = [gridPts[0]];
    for (let i = 1; i < gridPts.length; i++) {
      const prev = deduped[deduped.length-1];
      if (gridPts[i].x !== prev.x || gridPts[i].y !== prev.y)
        deduped.push(gridPts[i]);
    }

    if (!deduped.length) continue;

    // First point = move (no draw)
    entries.push(deduped[0].x * 10 + deduped[0].y);

    for (let i = 1; i < deduped.length; i++) {
      entries.push(100 + deduped[i].x * 10 + deduped[i].y);
    }
  }

  // Trim to 14, pad with 200
  while (entries.length < 14) entries.push(200);
  return entries.slice(0, 14);
}

function renderGlyphToPixels(font, char, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  try {
    const glyph = font.charToGlyph(char);
    if (!glyph) return null;
    const bb = glyph.getBoundingBox();
    if (!bb || bb.x1 === bb.x2 || bb.y1 === bb.y2) return null;

    const charW = bb.x2 - bb.x1;
    const charH = bb.y2 - bb.y1;
    const scale = (size * 0.85) / Math.max(charW, charH);
    const ox = (size - charW * scale) / 2 - bb.x1 * scale;
    const oy = (size - charH * scale) / 2 + bb.y2 * scale;

    ctx.fillStyle = 'black';
    const path = glyph.getPath(ox, oy, scale * font.unitsPerEm);
    const p2d = new Path2D(path.toSVG());
    ctx.fill(p2d);
  } catch (e) {
    return null;
  }

  const imageData = ctx.getImageData(0, 0, size, size);
  const pixels = new Uint8Array(size * size);
  for (let i = 0; i < size * size; i++) {
    pixels[i] = imageData.data[i * 4 + 3] > 64 ? 1 : 0;
  }
  return { pixels, canvas };
}

// Convert all convertible characters from a loaded opentype font
// Returns array of 63 vector arrays (indices matching DEFAULT_VECTORS)
function convertFont(font) {
  const result = DEFAULT_VECTORS.map(v => [...v]);

  const charForIndex = [
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    '0','1','2','3','4','5','6','7','8','9',
    null, null, // blanks [36,37]
    '/',        // [38]
    null, null, null, // Ä Ö Ü [39-41] — keep defaults, most fonts don't have these or they don't thin well
    ',','-','.','!','?', // [42-46]
    null,       // ß [47] — keep default
    "'",        // [48]
    '&','+',':',';','"','#','(',')',  // [49-56]
    '=','@','*', // [57-59]
    null, null, null, // smiley icons [60-62] — keep defaults
  ];

  for (let idx = 0; idx < charForIndex.length; idx++) {
    const ch = charForIndex[idx];
    if (!ch) continue;

    try {
      const rendered = renderGlyphToPixels(font, ch, RENDER_SIZE);
      if (!rendered) continue;

      const thinned = zhangSuenThinning(rendered.pixels, RENDER_SIZE, RENDER_SIZE);
      const paths = tracePaths(thinned, RENDER_SIZE, RENDER_SIZE);
      if (paths.length === 0) continue;

      const vec = encodePathsToVector(paths, RENDER_SIZE);

      // Sanity check: must have at least one non-200 value
      if (vec[0] !== 200) {
        result[idx] = vec;
      }
    } catch (e) {
      // Fall back to default on any error
    }
  }

  return result;
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

window.Vectorizer = { DEFAULT_VECTORS, CHAR_LABELS, convertFont, renderVectorToCanvas, pixelToGrid, RENDER_SIZE };
