# Font-to-Label-Maker — Dev Log

Live site: https://iceman1freeze.github.io/Font-to-Label-Maker/
Repo: https://github.com/Iceman1Freeze/Font-to-Label-Maker

---

## Current Version: V.012

---

## What This Project Does

A GitHub Pages website where users upload a `.ttf` font file, auto-convert it to Arduino vector format, optionally edit individual characters on an interactive grid, preview the label output, then download a ready-to-flash `message.ino` for the Crunchlabs Hack Pack label maker.

---

## Vector Format (from original message.ino)

```
const uint8_t vector[63][14]
- ones digit   = Y coordinate (0–4)
- tens digit   = X coordinate (0–4)
- hundreds     = 1 → draw, 0 → move
- 200          = end-of-character sentinel
- 222          = plot a single dot
```

63 characters total. 14 entries max per character.

---

## File Structure

```
index.html                   — 5-step single-page UI
css/style.css                — dark theme
js/app.js                    — wires all modules together
js/vectorizer.js             — TTF → vector conversion engine
js/editor.js                 — interactive 5×5 grid editor (VectorEditor class)
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
  - Much more accurate character shapes, no bitmap step at all
- Key functions: `sampleCubic()`, `sampleQuad()`, `getGlyphContours()`, `encodeContoursToVector()`

**Added version badge** — V.011 in header top-right, now V.012

---

## Known Limitations / Next Steps to Consider

1. **5×5 grid is coarse** — only 25 unique positions per character, max 13 line segments
   - The encoding already supports up to 9×9 (values 0–88 move, 100–188 draw)
   - Upgrading would require a firmware change to rescale motor coordinates
   - Worth discussing if font quality still looks poor after V.012 fix

2. **Outline vs stroke** — current conversion traces the font's outer contour (outline of the letter shape). For thick/block fonts this looks like outlined letters. For thin fonts it's close to stroke-based. The label maker physically draws lines, so stroke-based is "more correct" but outline is more reliable to generate automatically.

3. **Characters not auto-converted** — Ä, Ö, Ü, ß, smiley/heart icons (indices 39–41, 47, 60–62) keep their hardcoded defaults. These can be edited manually in the editor.

4. **Editor improvements** — the per-character vector editor is functional but could benefit from: keyboard shortcuts, copy/paste between characters, zoom.

5. **Preview scaling** — preview canvas scales to container width. Could add a "print scale" toggle.

---

## Architecture Notes

- `app.js` is the main IIFE — it owns `vectorData[]` and `autoVectors[]` state
- `editor.onChange` callback fires on every point edit → updates `vectorData[activeCharIndex]` → redraws tile → updates preview
- `preview.js._charToIndex()` mirrors the firmware's `plotCharacter()` char→index mapping exactly
- `codegen.js` fetches `assets/message_template.ino` at download time (requires HTTP server or GitHub Pages — won't work from `file://`)
- opentype.js loaded from CDN: `https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js`
