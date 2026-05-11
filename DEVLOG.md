# Font-to-Label-Maker — Dev Log

Live site: https://iceman1freeze.github.io/Font-to-Label-Maker/
Repo: https://github.com/Iceman1Freeze/Font-to-Label-Maker

---

## Current Version: V.023

---

## What This Project Does

A GitHub Pages website where users upload a `.ttf` font file, auto-convert it to Arduino vector format, optionally edit individual characters on an interactive grid, preview the label output, then download a ready-to-flash `message.ino` for the Crunchlabs Hack Pack label maker.

---

## Vector Format (from original message.ino)

```
const uint8_t vector[63][14]
- ones digit   = Y coordinate (0–8 on the 9×9 grid)
- tens digit   = X coordinate (0–8 on the 9×9 grid)
- hundreds     = 1 → draw, 0 → move
- 200          = end-of-character sentinel
- 222          = plot a single dot
```

63 characters total. 14 entries max per character (13 data + 1 sentinel).

**Grid**: 9×9 (GRID=8, values 0–8 per axis). Original firmware used 5×5 (0–4); the
DEFAULT_VECTORS in vectorizer.js double each coordinate via `_scale5to9()` to fit the
expanded grid. Firmware motor scaling was updated to match.

---

## File Structure

```
index.html                   — 5-step single-page UI
css/style.css                — dark theme
js/app.js                    — wires all modules together
js/vectorizer.js             — TTF → vector conversion engine
js/editor.js                 — interactive 9×9 grid editor (VectorEditor class)
js/preview.js                — label canvas renderer (LabelPreview class)
js/codegen.js                — .ino file generator + download (CodeGen namespace)
assets/message_template.ino  — original firmware with {{VECTOR_ARRAY}} placeholder
CustomFont.ttf               — example test font (user-provided)
DEVLOG.md                    — this file
```

---

## Session History

### Session 1 — Initial Build
- Planned and built the entire site from scratch
- Created all JS modules, CSS, HTML, and template .ino
- Pushed to GitHub and enabled GitHub Pages
- Fixed: repo was private → made public before Pages could be enabled
- Fixed: git push rejected (remote had README) → pull --allow-unrelated-histories

### Session 2 — Bug Fixes & Improvements (V.011 → V.012)

**Bug: Font upload showed green status but characters didn't change**
- Root cause 1: `new Path2D(path.toSVG())` was silently failing across some browsers
- Fix: switched to `glyph.draw(ctx, ...)` — the official opentype.js canvas API
- Root cause 2: `RENDER_SIZE = 40` was too small for reliable Zhang-Suen thinning
- Fix: bumped to `RENDER_SIZE = 64`

**Bigger fix: Replaced entire thinning pipeline with outline sampling (V.012)**
- Old approach: rasterize glyph → Zhang-Suen thinning → DFS path tracing → grid snap
  - Problem: thinning produced garbage skeletons (M looked like H, etc.)
- New approach: read font's actual bezier path commands → sample curves → Douglas-Peucker simplification → normalize to 0–4 grid → encode
- Key functions: `sampleCubic()`, `sampleQuad()`, `getGlyphContours()`, `encodeContoursToVector()`

**Added version badge** — V.011 in header top-right, bumped to V.012

---

### Session 3 — Blank Tiles Fix + Grid Upgrade + Outline Rewrite (V.013 → V.017)

**Bug: Character grid tiles were blank after uploading a font (V.013–V.015)**
- Root cause: `glyph.draw(ctx, x, y, fontSize)` internally calls `path.draw(ctx)` which
  sets `ctx.fillStyle` to the path's own `fill` property (default: black). On a dark
  background this made every glyph invisible.
- Fix: use `glyph.getPath(ox, oy, scale * font.unitsPerEm)` → set `path.fill = '#ffffff'`
  → call `path.draw(ctx)`. Applied in both `renderGlyphToCanvas` and `_convertGlyphRaster`.

**Bug: Editor glyph background not rendering (V.016)**
- Same opentype.js API issue in `editor.js _renderGlyphBackground()`
- Fix: same pattern — getPath → set fill → draw

**Grid upgrade: 5×5 → 9×9**
- Original DEFAULT_VECTORS used coords 0–4. All values doubled via `_scale5to9()`.
- GRID constant changed to 8 (9 positions per axis).
- Firmware motor scaling updated to compensate.

**New conversion pipeline: Bezier Outline Tracing (V.017)**
- Replaced Zhang-Suen thinning + rasterization with direct bezier sampling
- `_extractContours(commands)` — splits flat path commands into M…Z contour arrays
- `_sampleContour(cmds)` — evaluates cubic/quadratic bezier curves at even t steps
- `_snapPath(pts, CELL)` — snaps canvas coords to 9×9 grid, removes consecutive dupes
- `_convertGlyphOutline(font, ch)` — orchestrates above; allocates 13-point budget
  proportionally across contours (outer + inner counters like in A, B, O)
- `convertFont` updated to call `_convertGlyphOutline` instead of old raster path

---

### Session 7 — Winding-based hole dropping, outer-contour priority (V.023)

**Root cause of V.021/V.022 showing zero difference**
- For pixel fonts where every corner is 90°, the angle multiplier (1 + angle/π = 1.5) is
  uniform across all corners → RDP selects by geometric distance alone, same as V.020
- Hard corner protection (V.021) fell back to slice(0,n) → same result
- The real problem: 13-point budget was split between outer shape AND inner hole (triangle
  void in A, oval void in O, etc.), giving the outer only ~8 unique corners

**V.023 — Winding direction filter: drop inner holes, give outer all budget**
- Added `_signedArea(pts)`: shoelace formula on snapped grid coords. In our grid
  (gy increases upward), outer filled contours are CW in screen = negative signed area;
  inner holes are CCW in screen = positive signed area
- `_convertGlyphOutline` now filters `allContours` to keep only negative-area contours
  before budget allocation. Falls back to all contours if none detected (unusual fonts)
- Effect on 'A': inner triangular hole (positive area) is dropped; outer contour gets
  all 13 points instead of ~9, giving ~12 unique corners vs ~8 before
- Effect on letters with no holes (C, E, F, etc.): unchanged — single outer contour
- Effect on letters like ':' or '!' where both elements are filled shapes (not holes):
  both survive the filter and share the budget proportionally as before

---

### Session 6 — Angle-Weighted RDP replaces hard corner protection (V.022)

**Problem: V.021 hard corner protection caused over-retention of redundant points**
- Pixel fonts (PixelOperator Bold) have 90° corners everywhere; `_getCornerPoints` marked
  nearly every snapped point as "required"
- When required.size > budget n, the safety `result.slice(0, n)` returned an arbitrary
  first-n subset rather than the most meaningful corners, producing bad traces
- Inner-top corners of A (nearly on the horizontal top edge) were forced to stay even
  though they added zero visual information, creating a bumpy/jagged top edge

**V.022 — Angle-weighted RDP**
- Replaced hard-required Set with multiplicative angle weighting in `_rdpSimplify`:
  `effective_distance = geom_distance × (1 + angle/π)`
- A 90° corner at geom_distance d appears 1.5× further → harder to remove
- A 90° corner at geom_distance ≈ 0 (on the simplification line) → effective ≈ 0 → removed
  This correctly cleans up redundant inner-edge corners that lie on a straight section
- Removed `_getCornerPoints`, `required` parameter from all RDP functions
- Added `_attachAngles(pts)`: attaches `.angle` property to each interior snapped point;
  called on each contour after `_snapPath` in `_convertGlyphOutline`
- `_rdpToCount` hi bound stays at GRID*2 (16) to cover the up-to-2× angle multiplier
- No safety truncation needed — binary search always converges gracefully

---

### Session 5 — Corner-Protected RDP + Denser Sampling (V.021)

**Problem: Vector traces didn't follow letter outlines closely enough**
- RDP epsilon search range was [0, 16] — wider than the 9×9 grid diagonal (~11.3 units)
  causing the binary search to over-simplify when budget was tight
- Sharp corners (top of A, crossbar ends, serif notches) were unprotected and could be
  removed by RDP whenever their perpendicular deviation happened to be small
- Bezier curves sampled at only 4 points per segment, leaving too few points before
  grid snapping for smooth fonts

**V.021 — Corner-protected RDP + denser bezier sampling**
- Increased C and Q bezier sampling from 4 to 8 points per segment
- Added `_getCornerPoints(pts)`: detects points where direction changes ≥ 45°;
  returns them as a Set of required object references (endpoints always included)
- Modified `_rdpSimplify(pts, epsilon, required)`: points in `required` receive
  distance = Infinity so RDP always recurses through them and never discards them
- Modified `_rdpToCount(pts, n, required)`: reduced epsilon ceiling from 16 → GRID (8);
  passes required set through to `_rdpSimplify`; added safety slice if result > n
- `_convertGlyphOutline` now calls `_getCornerPoints` on each snapped contour and
  passes the result into `_rdpToCount` as the required set
- No interior-diagonal regression: corner-protected RDP keeps corners as split points
  and simplifies only the intermediate outline segments between them

---

### Session 4 — Outline Quality Improvements (V.018 → V.020)

**Problem: Vectors had bad diagonal connections crossing letter interiors**
- Example: bold A showed a diagonal line cutting from bottom-right to mid-left
- Root cause: the outer contour of a bold letter includes crossbar notch indentations
  (~3 grid units deep); when subsampled to 13 points these notch corners connected
  across the interior of the letter

**V.018 — Corner-aware point selection**
- Added `_selectCornerPoints(pts, n)`: scores each point by angle change (direction
  change at that point), keeps top-n "corner" points in original order
- Replaced even-index subsampling

**V.019 — RDP simplification + denser Q-curve sampling**
- Added `_rdpSimplify(pts, epsilon)` (Ramer-Douglas-Peucker) applied after snap
  with epsilon=1.5 to remove minor noise before corner selection
- Increased quadratic bezier (Q) sampling from 2 to 4 steps per segment — TrueType
  fonts use Q commands heavily and 2 samples per curve was too coarse

**V.020 — Adaptive RDP replaces corner scoring**
- Added `_rdpToCount(pts, n)`: binary-searches (28 iterations) for the RDP epsilon
  that reduces a contour to exactly n points
- Replaced `_selectCornerPoints` entirely — adaptive RDP naturally increases epsilon
  until crossbar notches (deviation ~3 grid units) are removed, giving clean outer
  shapes like a proper triangle for A without interior diagonals
- Removed fixed-epsilon RDP pre-pass; `_rdpToCount` handles full simplification

---

## Known Limitations / Next Steps to Consider

1. **Outline vs stroke** — conversion traces the font's outer contour (hollow outlined
   letter). The label maker physically draws lines; for thin/handwriting fonts this
   looks natural but bold fonts produce hollow shapes. Acceptable trade-off; hardware
   cannot reproduce filled shapes.

2. **13-point budget is tight for complex letters** — A, B, O, R, etc. have outer +
   inner contours. Budget is split proportionally (min 3 per contour). Letters with
   many contours may not reproduce well.

3. **Characters not auto-converted** — Ä, Ö, Ü, ß, smiley/heart icons (indices 39–41,
   47, 60–62) keep their hardcoded defaults. Edit manually in the editor.

4. **Editor improvements** — functional but could benefit from keyboard shortcuts,
   copy/paste between characters, zoom.

5. **Preview scaling** — preview canvas scales to container width. Could add print-scale toggle.

---

## Architecture Notes

- `app.js` is the main IIFE — owns `vectorData[]` and `autoVectors[]` state
- `editor.onChange` callback fires on every edit → updates `vectorData[activeCharIndex]`
  → redraws tile → updates preview
- `preview.js._charToIndex()` mirrors the firmware's `plotCharacter()` char→index mapping
- `codegen.js` fetches `assets/message_template.ino` at download time (requires HTTP
  server or GitHub Pages — won't work from `file://`)
- opentype.js loaded from CDN: `https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js`
- CRLF warning: this repo on Windows gets LF→CRLF substitution on git touch; use Write
  tool (not Edit) when rewriting vectorizer.js to avoid line-ending mismatch failures
