// app.js — Main application logic

(function () {
  let loadedFont = null;
  let vectorData = Vectorizer.DEFAULT_VECTORS.map(v => [...v]);
  let autoVectors = Vectorizer.DEFAULT_VECTORS.map(v => [...v]);
  let activeCharIndex = 0;

  const editorCanvas  = document.getElementById('editor-canvas');
  const glyphCanvas   = document.getElementById('glyph-canvas');
  const previewCanvas = document.getElementById('preview-canvas');
  const charGrid      = document.getElementById('char-grid');
  const previewInput  = document.getElementById('preview-text');
  const fontStatus    = document.getElementById('font-status');
  const editorTitle   = document.getElementById('editor-char-title');
  const btnUndo       = document.getElementById('btn-undo');
  const btnResetAuto  = document.getElementById('btn-reset-auto');
  const btnResetDef   = document.getElementById('btn-reset-default');
  const btnDownload   = document.getElementById('btn-download');
  const btnModeMove   = document.getElementById('btn-mode-move');
  const btnModeDraw   = document.getElementById('btn-mode-draw');
  const dropZone      = document.getElementById('drop-zone');
  const fileInput     = document.getElementById('file-input');
  const loadingBar    = document.getElementById('loading-bar');

  const editor  = new VectorEditor(editorCanvas, glyphCanvas);
  const preview = new LabelPreview(previewCanvas);

  editor.onChange = (vecs) => {
    vectorData[activeCharIndex] = [...vecs];
    updateCharTile(activeCharIndex);
    preview.render(previewInput.value);
  };

  // ── Font upload ─────────────────────────────────────────────────────────────

  function handleFontFile(file) {
    if (!file || !file.name.match(/\.ttf$/i)) {
      alert('Please upload a .ttf font file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => processFontBuffer(e.target.result, file.name);
    reader.readAsArrayBuffer(file);
  }

  function processFontBuffer(buffer, name) {
    try {
      loadedFont = opentype.parse(buffer);
    } catch (err) {
      alert('Could not parse font: ' + err.message);
      return;
    }
    fontStatus.textContent = '✓ ' + name;
    fontStatus.classList.add('loaded');

    loadingBar.style.display = 'block';
    loadingBar.style.width = '0%';

    // Convert in small batches to avoid blocking the UI
    const TOTAL = 63;
    let done = 0;
    const result = Vectorizer.DEFAULT_VECTORS.map(v => [...v]);

    function processChunk() {
      const start = done;
      const end = Math.min(start + 5, TOTAL);
      for (let i = start; i < end; i++) {
        const converted = Vectorizer.convertFont._convertSingle
          ? Vectorizer.convertFont._convertSingle(loadedFont, i)
          : null;
        // Use bulk conversion result if available (set after full run)
      }
      done = end;
      loadingBar.style.width = (done / TOTAL * 100) + '%';
      if (done < TOTAL) {
        requestAnimationFrame(processChunk);
      } else {
        loadingBar.style.display = 'none';
        finishConversion();
      }
    }

    // Run the full conversion synchronously (it's fast enough for 63 chars)
    const converted = Vectorizer.convertFont(loadedFont);
    autoVectors = converted.map(v => [...v]);
    vectorData = converted.map(v => [...v]);
    loadingBar.style.display = 'none';
    finishConversion();
  }

  function finishConversion() {
    buildCharGrid();
    selectChar(0);
    preview.setVectorData(vectorData);
    preview.render(previewInput.value);
  }

  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => handleFontFile(e.target.files[0]));
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFontFile(e.dataTransfer.files[0]);
  });

  // ── Character grid ──────────────────────────────────────────────────────────

  function buildCharGrid() {
    charGrid.innerHTML = '';
    for (let i = 0; i < 63; i++) {
      const tile = document.createElement('div');
      tile.className = 'char-tile';
      tile.dataset.idx = i;

      const label = document.createElement('span');
      label.className = 'char-label';
      label.textContent = Vectorizer.CHAR_LABELS[i];
      tile.appendChild(label);

      const tileCanvas = document.createElement('canvas');
      tileCanvas.width = 60;
      tileCanvas.height = 60;
      tile.appendChild(tileCanvas);

      tile.addEventListener('click', () => selectChar(i));
      charGrid.appendChild(tile);
      drawTileCanvas(tileCanvas, vectorData[i]);
    }
  }

  function drawTileCanvas(canvas, vectors) {
    Vectorizer.renderVectorToCanvas(vectors, canvas, { size: 60 });
  }

  function updateCharTile(idx) {
    const tile = charGrid.querySelector(`[data-idx="${idx}"]`);
    if (!tile) return;
    const tileCanvas = tile.querySelector('canvas');
    drawTileCanvas(tileCanvas, vectorData[idx]);
    tile.classList.toggle('modified',
      JSON.stringify(vectorData[idx]) !== JSON.stringify(Vectorizer.DEFAULT_VECTORS[idx])
    );
  }

  function selectChar(idx) {
    activeCharIndex = idx;
    document.querySelectorAll('.char-tile').forEach(t => t.classList.remove('active'));
    const tile = charGrid.querySelector(`[data-idx="${idx}"]`);
    if (tile) tile.classList.add('active');

    editorTitle.textContent = `Editing: ${Vectorizer.CHAR_LABELS[idx]}`;
    editor.setCharacter(idx, vectorData[idx], autoVectors[idx], loadedFont);
    editor.render();
  }

  // ── Editor controls ─────────────────────────────────────────────────────────

  btnUndo.addEventListener('click',       () => editor.undo());
  btnResetAuto.addEventListener('click',  () => editor.resetToAuto());
  btnResetDef.addEventListener('click',   () => editor.resetToDefault());

  btnModeMove.addEventListener('click', () => {
    editor.drawMode = false;
    btnModeMove.classList.add('active');
    btnModeDraw.classList.remove('active');
  });
  btnModeDraw.addEventListener('click', () => {
    editor.drawMode = true;
    btnModeDraw.classList.add('active');
    btnModeMove.classList.remove('active');
  });

  // ── Preview ─────────────────────────────────────────────────────────────────

  previewInput.addEventListener('input', () => {
    preview.render(previewInput.value.toUpperCase());
  });

  // ── Download ────────────────────────────────────────────────────────────────

  btnDownload.addEventListener('click', async () => {
    btnDownload.disabled = true;
    btnDownload.textContent = 'Generating...';
    try {
      const code = await CodeGen.generateInoFile(vectorData);
      CodeGen.downloadFile('message.ino', code);
    } catch (e) {
      alert('Error generating file: ' + e.message);
    } finally {
      btnDownload.disabled = false;
      btnDownload.textContent = '⬇ Download message.ino';
    }
  });

  // ── Init ────────────────────────────────────────────────────────────────────

  function init() {
    buildCharGrid();
    selectChar(0);
    preview.render('');
    resizePreview();
  }

  function resizePreview() {
    const container = previewCanvas.parentElement;
    previewCanvas.width = container.clientWidth || 700;
    previewCanvas.height = 80;
    preview.render(previewInput.value.toUpperCase());
  }

  window.addEventListener('resize', resizePreview);
  init();
})();
