(function () {
  const editorCanvas = document.getElementById('editorCanvas');
  const ctx = editorCanvas.getContext('2d');
  const stage = document.querySelector('.stage');
  const canvasShell = document.querySelector('.canvas-shell');
  const removeBusyGlow = document.getElementById('removeBusyGlow');
  const toolControls = document.getElementById('toolControls');
  const statusText = document.getElementById('statusText');
  const editorToast = document.getElementById('editorToast');
  const uploadGate = document.getElementById('uploadGate');
  const uploadInput = document.getElementById('uploadInput');
  const topLabel = document.getElementById('topLabel');

  const saveBtn = document.getElementById('saveBtn');
  const saveOverlay = document.getElementById('saveOverlay');
  const saveBackBtn = document.getElementById('saveBackBtn');
  const saveList = document.getElementById('saveList');
  const savePreviewImg = document.getElementById('savePreviewImg');

  const tabCrop = document.getElementById('tabCrop');
  const tabRemove = document.getElementById('tabRemove');
  const tabFilter = document.getElementById('tabFilter');
  const tabReshape = document.getElementById('tabReshape');

  const cropApplyBtn = document.getElementById('cropApplyBtn');
  const cropCancelBtn = document.getElementById('cropCancelBtn');
  const cropUndoBtn = document.getElementById('cropUndoBtn');
  const cropRedoBtn = document.getElementById('cropRedoBtn');
  const cropAspectRow = document.getElementById('cropAspectRow');
  const rotateLeftBtn = document.getElementById('rotateLeftBtn');
  const rotateRightBtn = document.getElementById('rotateRightBtn');
  const flipMirrorBtn = document.getElementById('flipMirrorBtn');
  const freeRotateInput = document.getElementById('freeRotateInput');
  const freeRotateText = document.getElementById('freeRotateText');
  const applyFreeRotateBtn = document.getElementById('applyFreeRotateBtn');

  const removeBrush = document.getElementById('removeBrush');
  const removeBrushText = document.getElementById('removeBrushText');
  const removeAlgorithm = document.getElementById('removeAlgorithm');
  const removeUndoBtn = document.getElementById('removeUndoBtn');
  const removeRedoBtn = document.getElementById('removeRedoBtn');

  const filterPresetRow = document.getElementById('filterPresetRow');
  const filterIntensity = document.getElementById('filterIntensity');
  const filterIntensityText = document.getElementById('filterIntensityText');
  const filterApplyBtn = document.getElementById('filterApplyBtn');
  const filterUndoBtn = document.getElementById('filterUndoBtn');
  const filterRedoBtn = document.getElementById('filterRedoBtn');

  const reshapeBrush = document.getElementById('reshapeBrush');
  const reshapeBrushText = document.getElementById('reshapeBrushText');
  const reshapeStrength = document.getElementById('reshapeStrength');
  const reshapeStrengthText = document.getElementById('reshapeStrengthText');
  const reshapeUndoBtn = document.getElementById('reshapeUndoBtn');
  const reshapeRedoBtn = document.getElementById('reshapeRedoBtn');
  const reshapeResetBtn = document.getElementById('reshapeResetBtn');

  const state = {
    originalImage: null,
    workingImage: null,
    fileBaseName: 'image',
    activeTool: 'crop',
    viewport: { scale: 1, offsetX: 0, offsetY: 0, minScale: 0.2, maxScale: 8, fitScale: 1 },
    ops: {
      cropOp: null,
      removeOp: ToolRemove.createOps()
    },
    undoRedo: {
      cropUndo: [],
      cropRedo: [],
      removeUndo: [],
      removeRedo: [],
      filterUndo: [],
      filterRedo: [],
      reshapeUndo: [],
      reshapeRedo: []
    },
    crop: {
      aspect: 'free',
      aspectRatio: null,
      rotatedAspect: false,
      rect: null,
      draftRect: null,
      interaction: null
    },
    remove: {
      algorithm: 'ai',
      brushPercent: 24,
      maskCanvas: document.createElement('canvas'),
      processing: false,
      currentStroke: null
    },
    filter: {
      preset: 'vivid',
      intensity: 65
    },
    reshape: {
      brush: 70,
      strength: 40,
      currentPoint: null
    },
    render: {
      hasTransparentPixels: false
    },
    save: {
      mode: 'original',
      format: 'png',
      quality: 90,
      compressAlgorithm: 'balanced',
      compressRatio: 92,
      upscaleAlgorithm: 'balanced',
      upscaleScale: 2,
      previewBlob: null,
      previewUrl: null,
      baseBytes: null,
      processing: false,
      renderSeq: 0,
      pendingRender: null
    },
    pointers: new Map(),
    pinch: null,
    pan: null,
    openSave: false
  };

  function setStatus(message) {
    statusText.textContent = message;
  }

  function setHintForActiveTool() {
    const hint =
      state.activeTool === 'crop'
        ? 'Drag handles to crop. Use rotate/flip controls. Pinch to zoom.'
        : state.activeTool === 'remove'
          ? 'Paint to remove. Release to apply. Pinch to zoom.'
          : state.activeTool === 'filter'
            ? 'Pick a popular photo filter and apply it.'
            : 'Drag on subject edges to push pixels inward for slimming.';
    setStatus(hint);
  }

  function showToast(message, durationMs) {
    if (!editorToast) return;
    editorToast.textContent = message;
    editorToast.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      editorToast.classList.remove('show');
    }, durationMs || 1300);
  }

  showToast._timer = null;

  function detectTransparency(canvas) {
    if (!canvas || !canvas.width || !canvas.height) return false;
    const c = canvas.getContext('2d');
    const data = c.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) return true;
    }
    return false;
  }

  function refreshTransparencyState() {
    state.render.hasTransparentPixels = detectTransparency(state.workingImage);
  }

  function resetSession() {
    if (state.save.previewUrl) {
      URL.revokeObjectURL(state.save.previewUrl);
      state.save.previewUrl = null;
    }
    if (savePreviewImg) {
      savePreviewImg.removeAttribute('src');
    }
    state.originalImage = null;
    state.workingImage = null;
    state.fileBaseName = 'image';
    state.ops.cropOp = null;
    state.ops.removeOp = ToolRemove.createOps();
    state.undoRedo.cropUndo = [];
    state.undoRedo.cropRedo = [];
    state.undoRedo.removeUndo = [];
    state.undoRedo.removeRedo = [];
    state.undoRedo.filterUndo = [];
    state.undoRedo.filterRedo = [];
    state.undoRedo.reshapeUndo = [];
    state.undoRedo.reshapeRedo = [];
    state.crop.rect = null;
    state.crop.draftRect = null;
    state.remove.processing = false;
    state.remove.currentStroke = null;
    state.render.hasTransparentPixels = false;
    state.remove.maskCanvas.width = 1;
    state.remove.maskCanvas.height = 1;
    uploadInput.value = '';
    uploadGate.classList.remove('hidden');
    saveBtn.disabled = true;
    setStatus('Upload one image to start editing.');
    draw();
    refreshUndoButtons();
  }

  function updateToolPanes() {
    document.querySelectorAll('.tool-pane').forEach((pane) => {
      pane.classList.toggle('active', pane.dataset.tool === state.activeTool);
    });
    tabCrop.classList.toggle('active', state.activeTool === 'crop');
    tabRemove.classList.toggle('active', state.activeTool === 'remove');
    tabFilter.classList.toggle('active', state.activeTool === 'filter');
    tabReshape.classList.toggle('active', state.activeTool === 'reshape');
    const toolTitle =
      state.activeTool === 'crop'
        ? 'Crop'
        : state.activeTool === 'remove'
          ? 'Remove'
          : state.activeTool === 'filter'
            ? 'Filter'
            : 'Reshape';
    topLabel.textContent = 'Editor • ' + toolTitle;
    if (state.workingImage) setHintForActiveTool();
    syncRemoveBusyGlow();
    draw();
  }

  function syncRemoveBusyGlow() {
    const active = (state.activeTool === 'remove' && state.remove.processing) || state.save.processing;
    if (removeBusyGlow) removeBusyGlow.classList.toggle('active', active);
    if (canvasShell) canvasShell.classList.toggle('busy', active);
  }

  function updateLayout() {
    const tabs = document.querySelector('.tabs');
    const toolHeight = toolControls.offsetHeight;
    document.documentElement.style.setProperty('--tool-h', toolHeight + 'px');
    if (stage) {
      stage.style.bottom = toolHeight + tabs.offsetHeight + 'px';
    }

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const viewport = canvasShell || stage;
    const rect = viewport.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (editorCanvas.width !== width || editorCanvas.height !== height) {
      editorCanvas.width = width;
      editorCanvas.height = height;
      fitViewportToImage();
      draw();
    }
  }

  function fitViewportToImage() {
    if (!state.workingImage) return;
    const fit = TransformCore.fitContain(
      state.workingImage.width,
      state.workingImage.height,
      editorCanvas.width,
      editorCanvas.height
    );
    state.viewport.fitScale = fit.scale;
    state.viewport.minScale = Math.max(0.12, fit.scale * 0.65);
    state.viewport.maxScale = Math.max(6, fit.scale * 18);
    state.viewport.scale = fit.scale;
    state.viewport.offsetX = fit.offsetX;
    state.viewport.offsetY = fit.offsetY;
  }

  function getCanvasPoint(e) {
    const rect = editorCanvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? editorCanvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? editorCanvas.height / rect.height : 1;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  function getImagePointFromCanvas(canvasPoint) {
    return TransformCore.screenToImage(canvasPoint, state.viewport);
  }

  function getViewportPanBounds() {
    const iw = state.workingImage.width * state.viewport.scale;
    const ih = state.workingImage.height * state.viewport.scale;
    const minX = editorCanvas.width - iw;
    const maxX = 0;
    const minY = editorCanvas.height - ih;
    const maxY = 0;
    return { iw, ih, minX, maxX, minY, maxY };
  }

  function resolveElasticOffset(value, min, max) {
    if (value < min) {
      const overshoot = min - value;
      return min - overshoot * 0.34;
    }
    if (value > max) {
      const overshoot = value - max;
      return max + overshoot * 0.34;
    }
    return value;
  }

  function clampViewport(options) {
    if (!state.workingImage) return;
    const opts = options || {};
    const hard = Boolean(opts.hard);
    const bounds = getViewportPanBounds();
    if (bounds.iw <= editorCanvas.width) {
      state.viewport.offsetX = (editorCanvas.width - bounds.iw) / 2;
    } else if (hard) {
      state.viewport.offsetX = TransformCore.clamp(state.viewport.offsetX, bounds.minX, bounds.maxX);
    } else {
      const elasticX = Math.max(24, Math.min(112, editorCanvas.width * 0.2));
      state.viewport.offsetX = resolveElasticOffset(
        state.viewport.offsetX,
        bounds.minX - elasticX,
        bounds.maxX + elasticX,
        elasticX
      );
    }
    if (bounds.ih <= editorCanvas.height) {
      state.viewport.offsetY = (editorCanvas.height - bounds.ih) / 2;
    } else if (hard) {
      state.viewport.offsetY = TransformCore.clamp(state.viewport.offsetY, bounds.minY, bounds.maxY);
    } else {
      const elasticY = Math.max(24, Math.min(112, editorCanvas.height * 0.24));
      state.viewport.offsetY = resolveElasticOffset(
        state.viewport.offsetY,
        bounds.minY - elasticY,
        bounds.maxY + elasticY,
        elasticY
      );
    }
  }

  function setScaleAroundPoint(nextScale, anchorCanvasPoint) {
    const clamped = TransformCore.clamp(nextScale, state.viewport.minScale, state.viewport.maxScale);
    const imagePoint = TransformCore.screenToImage(anchorCanvasPoint, state.viewport);
    state.viewport.scale = clamped;
    state.viewport.offsetX = anchorCanvasPoint.x - imagePoint.x * clamped;
    state.viewport.offsetY = anchorCanvasPoint.y - imagePoint.y * clamped;
    clampViewport({ hard: false });
  }

  function beginPinchFromPointers() {
    if (state.pointers.size < 2) return;
    const points = Array.from(state.pointers.values());
    const dx = points[0].x - points[1].x;
    const dy = points[0].y - points[1].y;
    const mid = {
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2
    };
    state.pinch = {
      startDistance: Math.max(1, Math.hypot(dx, dy)),
      startScale: state.viewport.scale,
      anchorImagePoint: TransformCore.screenToImage(mid, state.viewport)
    };
  }

  function continuePanWithRemainingPointer() {
    if (state.activeTool !== 'crop') return;
    if (state.crop.interaction) return;
    if (state.pointers.size !== 1) return;
    const point = Array.from(state.pointers.values())[0];
    state.pan = {
      startCanvas: point,
      startOffsetX: state.viewport.offsetX,
      startOffsetY: state.viewport.offsetY
    };
  }

  function draw() {
    CanvasRenderer.renderEditor(ctx, {
      imageCanvas: state.workingImage,
      maskCanvas: state.remove.maskCanvas,
      cropRect: state.crop.draftRect,
      viewport: state.viewport,
      activeTool: state.activeTool,
      showTransparencyGrid: state.render.hasTransparentPixels
    });
  }

  function initCropRect() {
    if (!state.workingImage) return;
    const rect = ToolCrop.createInitialRect(
      state.workingImage.width,
      state.workingImage.height,
      state.crop.aspectRatio
    );
    state.crop.rect = rect;
    state.crop.draftRect = { ...rect };
  }

  function initMaskCanvas() {
    if (!state.workingImage) return;
    state.remove.maskCanvas.width = state.workingImage.width;
    state.remove.maskCanvas.height = state.workingImage.height;
    const mctx = state.remove.maskCanvas.getContext('2d');
    mctx.clearRect(0, 0, state.remove.maskCanvas.width, state.remove.maskCanvas.height);
  }

  function getRemoveBrushSizePx() {
    if (!state.workingImage) return 8;
    const basis = Math.min(state.workingImage.width, state.workingImage.height);
    const maxPx = Math.max(6, Math.round(basis * 0.1));
    const percent = Math.max(1, Math.min(100, Number(state.remove.brushPercent) || 1));
    return Math.max(2, Math.round((percent / 100) * maxPx));
  }

  function refreshUndoButtons() {
    cropUndoBtn.disabled = state.undoRedo.cropUndo.length === 0;
    cropRedoBtn.disabled = state.undoRedo.cropRedo.length === 0;
    removeUndoBtn.disabled =
      (state.ops.removeOp.strokes.length === 0 && state.undoRedo.removeUndo.length === 0) || state.remove.processing;
    removeRedoBtn.disabled =
      (state.ops.removeOp.redoStrokes.length === 0 && state.undoRedo.removeRedo.length === 0) || state.remove.processing;
    filterUndoBtn.disabled = state.undoRedo.filterUndo.length === 0;
    filterRedoBtn.disabled = state.undoRedo.filterRedo.length === 0;
    reshapeUndoBtn.disabled = state.undoRedo.reshapeUndo.length === 0;
    reshapeRedoBtn.disabled = state.undoRedo.reshapeRedo.length === 0;
  }

  async function loadImage(file) {
    const img = await ImageCore.loadImageFromFile(file);
    state.originalImage = ImageCore.drawToCanvas(img, img.width, img.height);
    state.workingImage = ImageCore.cloneCanvas(state.originalImage);
    state.fileBaseName = (file.name || 'image').replace(/\.[^.]+$/, '') || 'image';
    state.ops.cropOp = null;
    state.ops.removeOp = ToolRemove.createOps();
    state.undoRedo.cropUndo = [];
    state.undoRedo.cropRedo = [];
    state.undoRedo.removeUndo = [];
    state.undoRedo.removeRedo = [];
    state.undoRedo.filterUndo = [];
    state.undoRedo.filterRedo = [];
    state.undoRedo.reshapeUndo = [];
    state.undoRedo.reshapeRedo = [];
    state.save.baseBytes = null;
    initCropRect();
    initMaskCanvas();
    fitViewportToImage();
    saveBtn.disabled = false;
    uploadGate.classList.add('hidden');
    refreshTransparencyState();
    setHintForActiveTool();
    refreshUndoButtons();
    draw();
  }

  function handleCropPointerDown(imagePoint) {
    if (!state.crop.draftRect) return false;
    const hit = ToolCrop.hitTest(state.crop.draftRect, imagePoint, 20 / state.viewport.scale);
    if (!hit) return false;
    state.crop.interaction = {
      handle: hit,
      startPoint: imagePoint,
      startRect: { ...state.crop.draftRect }
    };
    return true;
  }

  function handleCropPointerMove(imagePoint) {
    if (!state.crop.interaction || !state.workingImage) return;
    const dx = imagePoint.x - state.crop.interaction.startPoint.x;
    const dy = imagePoint.y - state.crop.interaction.startPoint.y;
    const rect = ToolCrop.resizeRect(
      state.crop.interaction.startRect,
      state.crop.interaction.handle,
      dx,
      dy,
      state.crop.aspectRatio,
      state.workingImage.width,
      state.workingImage.height
    );
    state.crop.draftRect = rect;
    draw();
  }

  function getMaskContext() {
    return state.remove.maskCanvas.getContext('2d');
  }

  function drawStrokeSegment(stroke, fromPoint, toPoint) {
    const mctx = getMaskContext();
    ToolRemove.drawStroke(mctx, {
      mode: stroke.mode,
      size: stroke.size,
      points: [fromPoint, toPoint]
    });
  }

  function beginRemoveStroke(imagePoint) {
    const point = {
      x: TransformCore.clamp(imagePoint.x, 0, state.workingImage.width),
      y: TransformCore.clamp(imagePoint.y, 0, state.workingImage.height)
    };
    const stroke = ToolRemove.beginStroke('paint', getRemoveBrushSizePx(), point);
    state.remove.currentStroke = stroke;
    ToolRemove.drawStroke(getMaskContext(), stroke);
    draw();
  }

  function updateRemoveStroke(imagePoint) {
    if (!state.remove.currentStroke) return;
    const point = {
      x: TransformCore.clamp(imagePoint.x, 0, state.workingImage.width),
      y: TransformCore.clamp(imagePoint.y, 0, state.workingImage.height)
    };
    const prev = state.remove.currentStroke.points[state.remove.currentStroke.points.length - 1];
    ToolRemove.extendStroke(state.remove.currentStroke, point);
    drawStrokeSegment(state.remove.currentStroke, prev, point);
    draw();
  }

  function endRemoveStroke() {
    if (!state.remove.currentStroke) return;
    ToolRemove.pushStroke(state.ops.removeOp, state.remove.currentStroke);
    state.remove.currentStroke = null;
    refreshUndoButtons();
    if (!state.remove.processing) {
      applyRemove();
      return;
    }
    setHintForActiveTool();
  }

  function clearMaskAndStrokes() {
    state.ops.removeOp = ToolRemove.createOps();
    const mctx = getMaskContext();
    mctx.clearRect(0, 0, state.remove.maskCanvas.width, state.remove.maskCanvas.height);
    refreshUndoButtons();
  }

  function buildBinaryMaskBlob() {
    const temp = ImageCore.createCanvas(state.remove.maskCanvas.width, state.remove.maskCanvas.height);
    const tctx = temp.getContext('2d');
    tctx.fillStyle = 'black';
    tctx.fillRect(0, 0, temp.width, temp.height);

    const src = getMaskContext().getImageData(0, 0, temp.width, temp.height);
    const out = tctx.getImageData(0, 0, temp.width, temp.height);
    for (let i = 0; i < src.data.length; i += 4) {
      const a = src.data[i + 3];
      const v = a > 20 ? 255 : 0;
      out.data[i] = v;
      out.data[i + 1] = v;
      out.data[i + 2] = v;
      out.data[i + 3] = 255;
    }
    tctx.putImageData(out, 0, 0);
    return ImageCore.canvasToBlob(temp, 'image/png');
  }


  function commitImageChange(nextCanvas, bucket, toastMessage) {
    if (!nextCanvas || !state.workingImage) return;
    const key = bucket || 'crop';
    const undoKey = key + 'Undo';
    const redoKey = key + 'Redo';
    if (state.undoRedo[undoKey]) {
      state.undoRedo[undoKey].push(ImageCore.cloneCanvas(state.workingImage));
      state.undoRedo[redoKey] = [];
    }
    state.workingImage = nextCanvas;
    state.save.baseBytes = null;
    initCropRect();
    initMaskCanvas();
    clearMaskAndStrokes();
    fitViewportToImage();
    refreshTransparencyState();
    refreshUndoButtons();
    setHintForActiveTool();
    if (toastMessage) showToast(toastMessage);
    draw();
  }

  function applyRotate(deg) {
    if (!state.workingImage) return;
    const rotated = ImageCore.rotateCanvas(state.workingImage, deg);
    commitImageChange(rotated, 'crop', 'Rotation applied.');
  }

  function applyMirrorFlip() {
    if (!state.workingImage) return;
    const flipped = ImageCore.flipCanvas(state.workingImage, true);
    commitImageChange(flipped, 'crop', 'Mirror flip applied.');
  }

  function applyFineRotate() {
    if (!state.workingImage) return;
    const deg = Number(freeRotateInput.value) || 0;
    if (deg === 0) return;
    const rotated = ImageCore.rotateCanvas(state.workingImage, deg);
    commitImageChange(rotated, 'crop', 'Fine rotation applied.');
    freeRotateInput.value = '0';
    freeRotateText.textContent = '0°';
  }

  function applyFilter() {
    if (!state.workingImage) return;
    const next = ImageCore.applyFilter(state.workingImage, state.filter.preset, state.filter.intensity);
    commitImageChange(next, 'filter', 'Filter applied.');
  }

  function undoFromBucket(bucket) {
    const undoKey = bucket + 'Undo';
    const redoKey = bucket + 'Redo';
    if (!state.undoRedo[undoKey] || !state.undoRedo[undoKey].length) return;
    state.undoRedo[redoKey].push(ImageCore.cloneCanvas(state.workingImage));
    state.workingImage = state.undoRedo[undoKey].pop();
    state.save.baseBytes = null;
    initCropRect();
    initMaskCanvas();
    clearMaskAndStrokes();
    fitViewportToImage();
    refreshTransparencyState();
    refreshUndoButtons();
    draw();
  }

  function redoFromBucket(bucket) {
    const undoKey = bucket + 'Undo';
    const redoKey = bucket + 'Redo';
    if (!state.undoRedo[redoKey] || !state.undoRedo[redoKey].length) return;
    state.undoRedo[undoKey].push(ImageCore.cloneCanvas(state.workingImage));
    state.workingImage = state.undoRedo[redoKey].pop();
    state.save.baseBytes = null;
    initCropRect();
    initMaskCanvas();
    clearMaskAndStrokes();
    fitViewportToImage();
    refreshTransparencyState();
    refreshUndoButtons();
    draw();
  }

  function reshapePushAt(currPoint) {
    const prev = state.reshape.currentPoint;
    if (!prev || !state.workingImage) {
      state.reshape.currentPoint = currPoint;
      return;
    }
    const ctx2 = state.workingImage.getContext('2d');
    const image = ctx2.getImageData(0, 0, state.workingImage.width, state.workingImage.height);
    const src = new Uint8ClampedArray(image.data);
    const radius = Number(state.reshape.brush) || 60;
    const strength = (Number(state.reshape.strength) || 40) / 100;
    const shiftX = (currPoint.x - prev.x) * strength * 0.65;
    const shiftY = (currPoint.y - prev.y) * strength * 0.35;
    const minX = Math.max(0, Math.floor(currPoint.x - radius));
    const maxX = Math.min(state.workingImage.width - 1, Math.ceil(currPoint.x + radius));
    const minY = Math.max(0, Math.floor(currPoint.y - radius));
    const maxY = Math.min(state.workingImage.height - 1, Math.ceil(currPoint.y + radius));

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const dx = x - currPoint.x;
        const dy = y - currPoint.y;
        const d = Math.hypot(dx, dy);
        if (d > radius) continue;
        const falloff = (1 - d / radius) * (1 - d / radius);
        const sx = Math.round(Math.max(0, Math.min(state.workingImage.width - 1, x - shiftX * falloff)));
        const sy = Math.round(Math.max(0, Math.min(state.workingImage.height - 1, y - shiftY * falloff)));
        const di = (y * state.workingImage.width + x) * 4;
        const si = (sy * state.workingImage.width + sx) * 4;
        image.data[di] = src[si];
        image.data[di + 1] = src[si + 1];
        image.data[di + 2] = src[si + 2];
        image.data[di + 3] = src[si + 3];
      }
    }

    ctx2.putImageData(image, 0, 0);
    state.reshape.currentPoint = currPoint;
    refreshTransparencyState();
    draw();
  }

  async function applyRemove() {
    if (!state.workingImage || state.remove.processing) return;
    if (!state.ops.removeOp.strokes.length) {
      setStatus('Paint at least one stroke, then release to apply.');
      return;
    }

    state.remove.processing = true;
    saveBtn.disabled = true;
    syncRemoveBusyGlow();
    setStatus('Removing...');

    try {
      if (!window.RemoveEngine || typeof window.RemoveEngine.inpaintMaskedImage !== 'function') {
        throw new Error('Remove engine is unavailable.');
      }
      const sourceCtx = state.workingImage.getContext('2d');
      const width = state.workingImage.width;
      const height = state.workingImage.height;
      const sourceImageData = sourceCtx.getImageData(0, 0, width, height);
      const maskPixels = getMaskContext().getImageData(0, 0, width, height).data;
      const maskData = new Uint8Array(width * height);
      let maskedCount = 0;
      for (let i = 0; i < maskData.length; i += 1) {
        const marked = maskPixels[i * 4 + 3] > 20;
        maskData[i] = marked ? 1 : 0;
        if (marked) maskedCount += 1;
      }
      if (maskedCount === 0) {
        throw new Error('Paint at least one stroke, then release to apply.');
      }
      state.undoRedo.removeUndo.push(ImageCore.cloneCanvas(state.workingImage));
      state.undoRedo.removeRedo = [];
      const resultImageData = await window.RemoveEngine.inpaintMaskedImage(sourceImageData, maskData, {
        algorithm: state.remove.algorithm,
        brushSize: getRemoveBrushSizePx()
      });
      sourceCtx.putImageData(resultImageData, 0, 0);
      state.save.baseBytes = null;
      state.ops.removeOp.lastResult = { at: new Date().toISOString() };
      initCropRect();
      initMaskCanvas();
      clearMaskAndStrokes();
      refreshTransparencyState();
      setHintForActiveTool();
      showToast('Remove applied.');
    } catch (err) {
      setStatus(err.message || 'Remove failed.');
    } finally {
      state.remove.processing = false;
      syncRemoveBusyGlow();
      saveBtn.disabled = !state.workingImage;
      refreshUndoButtons();
      draw();
    }
  }

  function applyCrop() {
    if (!state.workingImage || !state.crop.draftRect) return;
    const d = state.crop.draftRect;
    const imgW = state.workingImage.width;
    const imgH = state.workingImage.height;
    const startX = TransformCore.clamp(Math.floor(d.x), 0, Math.max(0, imgW - 1));
    const startY = TransformCore.clamp(Math.floor(d.y), 0, Math.max(0, imgH - 1));
    const endX = TransformCore.clamp(Math.ceil(d.x + d.w), startX + 1, imgW);
    const endY = TransformCore.clamp(Math.ceil(d.y + d.h), startY + 1, imgH);
    const rect = {
      x: startX,
      y: startY,
      w: Math.max(1, endX - startX),
      h: Math.max(1, endY - startY)
    };

    state.undoRedo.cropUndo.push(ImageCore.cloneCanvas(state.workingImage));
    state.undoRedo.cropRedo = [];
    state.undoRedo.removeUndo = [];
    state.undoRedo.removeRedo = [];
    state.undoRedo.filterUndo = [];
    state.undoRedo.filterRedo = [];
    state.undoRedo.reshapeUndo = [];
    state.undoRedo.reshapeRedo = [];
    state.workingImage = ImageCore.cropCanvas(state.workingImage, rect);
    state.save.baseBytes = null;
    state.ops.cropOp = {
      x: rect.x,
      y: rect.y,
      w: rect.w,
      h: rect.h,
      aspect: state.crop.aspect
    };

    initCropRect();
    initMaskCanvas();
    clearMaskAndStrokes();
    fitViewportToImage();
    refreshTransparencyState();
    refreshUndoButtons();
    setHintForActiveTool();
    showToast('Crop applied.');
    draw();
  }

  function undoCrop() {
    if (!state.undoRedo.cropUndo.length) return;
    state.undoRedo.cropRedo.push(ImageCore.cloneCanvas(state.workingImage));
    state.workingImage = state.undoRedo.cropUndo.pop();
    state.undoRedo.removeUndo = [];
    state.undoRedo.removeRedo = [];
    state.undoRedo.filterUndo = [];
    state.undoRedo.filterRedo = [];
    state.undoRedo.reshapeUndo = [];
    state.undoRedo.reshapeRedo = [];
    state.save.baseBytes = null;
    initCropRect();
    initMaskCanvas();
    clearMaskAndStrokes();
    fitViewportToImage();
    refreshTransparencyState();
    refreshUndoButtons();
    setHintForActiveTool();
    draw();
  }

  function redoCrop() {
    if (!state.undoRedo.cropRedo.length) return;
    state.undoRedo.cropUndo.push(ImageCore.cloneCanvas(state.workingImage));
    state.workingImage = state.undoRedo.cropRedo.pop();
    state.undoRedo.removeUndo = [];
    state.undoRedo.removeRedo = [];
    state.undoRedo.filterUndo = [];
    state.undoRedo.filterRedo = [];
    state.undoRedo.reshapeUndo = [];
    state.undoRedo.reshapeRedo = [];
    state.save.baseBytes = null;
    initCropRect();
    initMaskCanvas();
    clearMaskAndStrokes();
    fitViewportToImage();
    refreshTransparencyState();
    refreshUndoButtons();
    setHintForActiveTool();
    draw();
  }

  function computeEffectiveQuality() {
    let q = state.save.quality;
    if (state.save.mode === 'compress') {
      if (state.save.compressAlgorithm === 'smallest') q = Math.max(35, q - 24);
      if (state.save.compressAlgorithm === 'quality') q = Math.min(100, q + 8);
    }
    return q;
  }

  function computeEffectiveCompressRatio() {
    const base = Math.max(60, Math.min(100, Number(state.save.compressRatio) || 92)) / 100;
    if (state.save.compressAlgorithm === 'smallest') return Math.max(0.55, base * 0.9);
    if (state.save.compressAlgorithm === 'quality') return Math.min(1, base * 1.05);
    return base;
  }

  async function ensureSaveBaseBytes() {
    if (!state.workingImage) return 0;
    if (state.save.baseBytes && state.save.baseBytes > 0) {
      return state.save.baseBytes;
    }
    const baseBlob = await ImageCore.canvasToBlob(state.workingImage, 'image/png');
    state.save.baseBytes = baseBlob.size;
    return state.save.baseBytes;
  }

  function createScaledCanvas(source, outWidth, outHeight, upscaleAlgorithm) {
    const out = ImageCore.createCanvas(outWidth, outHeight);
    const outCtx = out.getContext('2d');
    const algo = upscaleAlgorithm || 'balanced';
    if (algo === 'pixel') {
      outCtx.imageSmoothingEnabled = false;
      outCtx.drawImage(source, 0, 0, outWidth, outHeight);
      return out;
    }

    outCtx.imageSmoothingEnabled = true;
    if (algo === 'sharp') {
      const mid = ImageCore.createCanvas(Math.max(1, Math.round(outWidth * 0.65)), Math.max(1, Math.round(outHeight * 0.65)));
      const midCtx = mid.getContext('2d');
      midCtx.imageSmoothingEnabled = true;
      midCtx.imageSmoothingQuality = 'high';
      midCtx.drawImage(source, 0, 0, mid.width, mid.height);
      outCtx.imageSmoothingQuality = 'high';
      outCtx.drawImage(mid, 0, 0, outWidth, outHeight);
      return out;
    }

    outCtx.imageSmoothingQuality = algo === 'smooth' ? 'high' : 'medium';
    outCtx.drawImage(source, 0, 0, outWidth, outHeight);
    return out;
  }

  async function renderSaveOutput() {
    if (!state.workingImage) throw new Error('No image to export.');
    const format = state.save.format;
    const mimeType = ImageCore.formatToMime(format);
    const quality = computeEffectiveQuality();
    const source = state.workingImage;
    let exportCanvas = source;
    let outWidth = source.width;
    let outHeight = source.height;

    if (state.save.mode === 'compress' && format === 'png') {
      const scaleFactor = computeEffectiveCompressRatio();
      outWidth = Math.max(1, Math.round(source.width * scaleFactor));
      outHeight = Math.max(1, Math.round(source.height * scaleFactor));
      if (scaleFactor < 1) {
        exportCanvas = createScaledCanvas(source, outWidth, outHeight, 'smooth');
      }
    } else if (state.save.mode === 'upscale') {
      const scale = Math.max(1, Math.min(4, Number(state.save.upscaleScale) || 2));
      outWidth = Math.max(1, Math.round(source.width * scale));
      outHeight = Math.max(1, Math.round(source.height * scale));
      exportCanvas = createScaledCanvas(source, outWidth, outHeight, state.save.upscaleAlgorithm);
    }

    const blob = await ImageCore.canvasToBlob(
      exportCanvas,
      mimeType,
      format === 'png' ? undefined : quality / 100
    );

    return { blob, width: outWidth, height: outHeight, format, quality };
  }

  async function refreshSavePreview(metaEl, estimateEl, ratioEl, downloadBtn, seq) {
    if (!state.openSave || !state.workingImage) return;
    downloadBtn.disabled = true;
    try {
      const rendered = await renderSaveOutput();
      if (seq !== state.save.renderSeq) return;
      state.save.previewBlob = rendered.blob;
      if (state.save.previewUrl) {
        URL.revokeObjectURL(state.save.previewUrl);
      }
      state.save.previewUrl = URL.createObjectURL(rendered.blob);
      savePreviewImg.src = state.save.previewUrl;

      const estimate = rendered.blob.size;
      metaEl.textContent = rendered.width + ' × ' + rendered.height;
      estimateEl.textContent = 'Estimated size: ' + ImageCore.formatBytes(estimate);
      if (ratioEl) {
        ratioEl.textContent = '';
        if (state.save.mode === 'compress') {
          const baseBytes = await ensureSaveBaseBytes();
          if (baseBytes > 0) {
            const delta = ((baseBytes - estimate) / baseBytes) * 100;
            if (delta >= 0) {
              ratioEl.textContent = 'Compression ratio: ' + delta.toFixed(1) + '% smaller than current image';
            } else {
              ratioEl.textContent = 'Compression ratio: ' + Math.abs(delta).toFixed(1) + '% larger than current image';
            }
          }
        }
      }
      downloadBtn.disabled = false;
    } catch (err) {
      metaEl.textContent = 'Preview failed';
      estimateEl.textContent = err.message || 'Unable to render preview.';
      if (ratioEl) ratioEl.textContent = '';
    }
  }

  function scheduleSavePreview(metaEl, estimateEl, ratioEl, downloadBtn) {
    state.save.renderSeq += 1;
    const seq = state.save.renderSeq;
    if (state.save.pendingRender) {
      clearTimeout(state.save.pendingRender);
    }
    state.save.pendingRender = setTimeout(() => {
      refreshSavePreview(metaEl, estimateEl, ratioEl, downloadBtn, seq);
    }, 60);
  }

  function updateSavePanel() {
    if (!state.workingImage) return;
    saveList.innerHTML = `
      <div class="save-item">
        <h3>Final Output</h3>
        <p class="save-meta" id="saveMetaText"></p>
        <div class="row">
          <label for="saveMode">Process</label>
          <select id="saveMode">
            <option value="original">Original</option>
            <option value="compress">Compress</option>
            <option value="upscale">Upscale</option>
          </select>
          <label for="saveFormat">Format</label>
          <select id="saveFormat">
            <option value="png">PNG</option>
            <option value="jpeg">JPG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
        <div class="row" id="saveQualityRow">
          <label for="saveQuality">Quality</label>
          <input id="saveQuality" type="range" min="40" max="100" step="1" />
          <span class="save-chip" id="saveQualityText"></span>
        </div>
        <div class="row" id="saveCompressAlgoRow">
          <label for="saveCompressAlgorithm">Compress Algo</label>
          <select id="saveCompressAlgorithm">
            <option value="balanced">Balanced</option>
            <option value="smallest">Smallest Size</option>
            <option value="quality">Best Quality</option>
          </select>
        </div>
        <div class="row hidden" id="saveCompressRatioRow">
          <label for="saveCompressRatio">PNG Ratio</label>
          <input id="saveCompressRatio" type="range" min="60" max="100" step="1" />
          <span class="save-chip" id="saveCompressRatioText"></span>
        </div>
        <div class="row hidden" id="saveUpscaleRow">
          <label for="saveUpscaleScale">Scale</label>
          <select id="saveUpscaleScale">
            <option value="2">2x</option>
            <option value="3">3x</option>
            <option value="4">4x</option>
          </select>
          <label for="saveUpscaleAlgorithm">Upscale Algo</label>
          <select id="saveUpscaleAlgorithm">
            <option value="balanced">Balanced</option>
            <option value="smooth">Smooth</option>
            <option value="sharp">Sharp</option>
            <option value="pixel">Pixel (Nearest)</option>
          </select>
        </div>
        <p class="save-estimate" id="saveEstimateText"></p>
        <p class="save-ratio" id="saveRatioText"></p>
        <p class="save-notice" id="saveNotice"></p>
      </div>
    `;

    const modeInput = document.getElementById('saveMode');
    const formatInput = document.getElementById('saveFormat');
    const qualityInput = document.getElementById('saveQuality');
    const qualityText = document.getElementById('saveQualityText');
    const compressAlgoInput = document.getElementById('saveCompressAlgorithm');
    const compressRatioInput = document.getElementById('saveCompressRatio');
    const compressRatioText = document.getElementById('saveCompressRatioText');
    const upscaleScaleInput = document.getElementById('saveUpscaleScale');
    const upscaleAlgoInput = document.getElementById('saveUpscaleAlgorithm');
    const qualityRow = document.getElementById('saveQualityRow');
    const compressAlgoRow = document.getElementById('saveCompressAlgoRow');
    const compressRatioRow = document.getElementById('saveCompressRatioRow');
    const upscaleRow = document.getElementById('saveUpscaleRow');
    const metaEl = document.getElementById('saveMetaText');
    const estimateEl = document.getElementById('saveEstimateText');
    const ratioEl = document.getElementById('saveRatioText');
    const noticeEl = document.getElementById('saveNotice');
    const downloadBtn = document.getElementById('saveDownloadBtn');

    modeInput.value = state.save.mode;
    formatInput.value = state.save.format;
    qualityInput.value = String(state.save.quality);
    qualityText.textContent = state.save.quality + '';
    compressAlgoInput.value = state.save.compressAlgorithm;
    compressRatioInput.value = String(state.save.compressRatio);
    compressRatioText.textContent = state.save.compressRatio + '%';
    upscaleScaleInput.value = String(state.save.upscaleScale);
    upscaleAlgoInput.value = state.save.upscaleAlgorithm;

    function syncControlVisibility() {
      const mode = modeInput.value;
      const format = formatInput.value;
      const qualityAllowed = !(mode === 'compress' && format === 'png') && format !== 'png';
      qualityRow.classList.toggle('hidden', !qualityAllowed);
      compressAlgoRow.classList.toggle('hidden', mode !== 'compress');
      compressRatioRow.classList.toggle('hidden', !(mode === 'compress' && format === 'png'));
      upscaleRow.classList.toggle('hidden', mode !== 'upscale');
    }

    function onInputChange() {
      state.save.mode = modeInput.value;
      state.save.format = formatInput.value;
      state.save.quality = Number(qualityInput.value);
      state.save.compressAlgorithm = compressAlgoInput.value;
      state.save.compressRatio = Number(compressRatioInput.value);
      state.save.upscaleScale = Number(upscaleScaleInput.value);
      state.save.upscaleAlgorithm = upscaleAlgoInput.value;
      qualityText.textContent = qualityInput.value;
      compressRatioText.textContent = compressRatioInput.value + '%';
      noticeEl.textContent = '';
      syncControlVisibility();
      scheduleSavePreview(metaEl, estimateEl, ratioEl, downloadBtn);
    }

    [modeInput, formatInput, qualityInput, compressAlgoInput, compressRatioInput, upscaleScaleInput, upscaleAlgoInput].forEach((el) => {
      el.addEventListener('input', onInputChange);
      el.addEventListener('change', onInputChange);
    });

    downloadBtn.addEventListener('click', async () => {
      if (state.remove.processing || downloadBtn.disabled) return;
      try {
        state.save.processing = true;
        syncRemoveBusyGlow();
        noticeEl.textContent = 'Preparing your file...';
        downloadBtn.disabled = true;
        const rendered = await renderSaveOutput();
        const suffix = state.save.mode === 'upscale' ? '-upscaled' : state.save.mode === 'compress' ? '-compressed' : '-edited';
        const filename = state.fileBaseName + suffix + '.' + ImageCore.extForFormat(rendered.format);
        ImageCore.downloadBlob(rendered.blob, filename);
        noticeEl.textContent = 'Saved. Your download has started.';
      } catch (err) {
        noticeEl.textContent = err.message || 'Save failed.';
      } finally {
        state.save.processing = false;
        syncRemoveBusyGlow();
        scheduleSavePreview(metaEl, estimateEl, ratioEl, downloadBtn);
      }
    });

    syncControlVisibility();
    scheduleSavePreview(metaEl, estimateEl, ratioEl, downloadBtn);
  }

  function openSave() {
    if (!state.workingImage) return;
    if (state.remove.processing) {
      setStatus('Remove is still processing. Save is disabled.');
      return;
    }
    updateSavePanel();
    state.openSave = true;
    saveOverlay.classList.add('active');
    saveOverlay.setAttribute('aria-hidden', 'false');
  }

  function closeSave() {
    state.openSave = false;
    if (state.save.pendingRender) {
      clearTimeout(state.save.pendingRender);
      state.save.pendingRender = null;
    }
    saveOverlay.classList.remove('active');
    saveOverlay.setAttribute('aria-hidden', 'true');
  }

  function onPointerDown(e) {
    if (!state.workingImage || state.openSave) return;
    editorCanvas.setPointerCapture(e.pointerId);
    const point = getCanvasPoint(e);
    state.pointers.set(e.pointerId, point);

    if (state.pointers.size === 2) {
      beginPinchFromPointers();
      state.crop.interaction = null;
      state.remove.currentStroke = null;
      return;
    }

    if (state.pointers.size > 1) return;

    const imagePoint = getImagePointFromCanvas(point);
    if (state.activeTool === 'crop') {
      const hit = handleCropPointerDown(imagePoint);
      if (!hit) {
        const isSmallScreen = Math.min(window.innerWidth || 0, window.innerHeight || 0) <= 430;
        if (isSmallScreen && state.viewport.scale <= state.viewport.fitScale * 1.02) {
          state.pan = null;
          return;
        }
        state.pan = {
          startCanvas: point,
          startOffsetX: state.viewport.offsetX,
          startOffsetY: state.viewport.offsetY
        };
      }
    } else if (state.activeTool === 'remove' && !state.remove.processing) {
      beginRemoveStroke(imagePoint);
    } else if (state.activeTool === 'reshape') {
      state.undoRedo.reshapeUndo.push(ImageCore.cloneCanvas(state.workingImage));
      state.undoRedo.reshapeRedo = [];
      state.reshape.currentPoint = imagePoint;
      refreshUndoButtons();
    }
  }

  function onPointerMove(e) {
    if (!state.workingImage || !state.pointers.has(e.pointerId) || state.openSave) return;
    const point = getCanvasPoint(e);
    state.pointers.set(e.pointerId, point);

    if (state.pinch && state.pointers.size >= 2) {
      const points = Array.from(state.pointers.values());
      const dx = points[0].x - points[1].x;
      const dy = points[0].y - points[1].y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const ratio = dist / Math.max(1, state.pinch.startDistance);
      const mid = {
        x: (points[0].x + points[1].x) / 2,
        y: (points[0].y + points[1].y) / 2
      };
      const nextScale = TransformCore.clamp(
        state.pinch.startScale * ratio,
        state.viewport.minScale,
        state.viewport.maxScale
      );
      state.viewport.scale = nextScale;
      state.viewport.offsetX = mid.x - state.pinch.anchorImagePoint.x * nextScale;
      state.viewport.offsetY = mid.y - state.pinch.anchorImagePoint.y * nextScale;
      clampViewport({ hard: false });
      draw();
      return;
    }

    if (state.activeTool === 'crop') {
      if (state.crop.interaction) {
        handleCropPointerMove(getImagePointFromCanvas(point));
      } else if (state.pan) {
        state.viewport.offsetX = state.pan.startOffsetX + (point.x - state.pan.startCanvas.x);
        state.viewport.offsetY = state.pan.startOffsetY + (point.y - state.pan.startCanvas.y);
        clampViewport({ hard: false });
        draw();
      }
    } else if (state.activeTool === 'remove' && state.remove.currentStroke && !state.remove.processing) {
      updateRemoveStroke(getImagePointFromCanvas(point));
    } else if (state.activeTool === 'reshape' && state.reshape.currentPoint) {
      reshapePushAt(getImagePointFromCanvas(point));
    }
  }

  function onPointerUp(e) {
    if (state.pointers.has(e.pointerId)) {
      state.pointers.delete(e.pointerId);
    }

    if (state.pointers.size < 2) {
      state.pinch = null;
      continuePanWithRemainingPointer();
    }

    if (state.activeTool === 'crop') {
      state.crop.interaction = null;
      if (state.pointers.size === 0) {
        state.pan = null;
      }
      clampViewport({ hard: true });
      draw();
    } else if (state.activeTool === 'remove') {
      endRemoveStroke();
      clampViewport({ hard: true });
      draw();
    } else if (state.activeTool === 'reshape') {
      state.reshape.currentPoint = null;
      state.save.baseBytes = null;
      clampViewport({ hard: true });
      draw();
    }
  }

  editorCanvas.addEventListener('pointerdown', onPointerDown);
  editorCanvas.addEventListener('pointermove', onPointerMove);
  editorCanvas.addEventListener('pointerup', onPointerUp);
  editorCanvas.addEventListener('pointercancel', onPointerUp);

  editorCanvas.addEventListener(
    'wheel',
    (e) => {
      if (!state.workingImage || state.openSave) return;
      e.preventDefault();
      const point = getCanvasPoint(e);
      const delta = e.deltaY < 0 ? 1.1 : 0.92;
      setScaleAroundPoint(state.viewport.scale * delta, point);
      clampViewport({ hard: false });
      draw();
    },
    { passive: false }
  );

  uploadInput.addEventListener('change', async () => {
    if (!uploadInput.files || !uploadInput.files.length) return;
    try {
      await loadImage(uploadInput.files[0]);
    } catch (err) {
      setStatus(err.message || 'Failed to load image.');
    }
  });

  document.getElementById('backBtn').addEventListener('click', () => {
    if (state.workingImage && !window.confirm('Reset current session?')) return;
    closeSave();
    resetSession();
  });

  saveBtn.addEventListener('click', openSave);
  saveBackBtn.addEventListener('click', closeSave);

  tabCrop.addEventListener('click', () => {
    state.activeTool = 'crop';
    updateToolPanes();
  });
  tabRemove.addEventListener('click', () => {
    state.activeTool = 'remove';
    updateToolPanes();
  });
  tabFilter.addEventListener('click', () => {
    state.activeTool = 'filter';
    updateToolPanes();
  });
  tabReshape.addEventListener('click', () => {
    state.activeTool = 'reshape';
    updateToolPanes();
  });

  function setCropAspectFromButton(btn, rotate) {
    if (!state.workingImage) return;
    const base = btn.dataset.aspect || 'free';
    let next = base;
    const canRotate = base.includes(':');
    state.crop.rotatedAspect = Boolean(rotate && canRotate);
    if (state.crop.rotatedAspect) {
      const parts = base.split(':');
      next = parts[1] + ':' + parts[0];
    }
    state.crop.aspect = next;
    state.crop.aspectRatio = ToolCrop.parseAspect(state.crop.aspect);
    cropAspectRow.querySelectorAll('button[data-aspect]').forEach((b) => {
      b.classList.toggle('active', b === btn);
      b.classList.toggle('rotated', b === btn && state.crop.rotatedAspect);
      if (b === btn && canRotate) {
        b.textContent = state.crop.rotatedAspect ? next : base;
      } else if (b.dataset.aspect) {
        b.textContent = b.dataset.aspect;
      }
    });
    state.crop.draftRect = ToolCrop.createInitialRect(
      state.workingImage.width,
      state.workingImage.height,
      state.crop.aspectRatio
    );
    draw();
  }

  cropAspectRow.querySelectorAll('button[data-aspect]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setCropAspectFromButton(btn, false);
    });
    btn.addEventListener('dblclick', (e) => {
      e.preventDefault();
      setCropAspectFromButton(btn, !btn.classList.contains('rotated'));
    });
  });

  cropApplyBtn.addEventListener('click', applyCrop);
  cropCancelBtn.addEventListener('click', () => {
    initCropRect();
    setHintForActiveTool();
    draw();
  });
  cropUndoBtn.addEventListener('click', undoCrop);
  cropRedoBtn.addEventListener('click', redoCrop);
  rotateLeftBtn.addEventListener('click', () => applyRotate(-90));
  rotateRightBtn.addEventListener('click', () => applyRotate(90));
  flipMirrorBtn.addEventListener('click', applyMirrorFlip);
  freeRotateInput.addEventListener('input', () => {
    freeRotateText.textContent = freeRotateInput.value + '°';
  });
  applyFreeRotateBtn.addEventListener('click', applyFineRotate);

  removeBrush.addEventListener('input', () => {
    state.remove.brushPercent = Number(removeBrush.value);
    removeBrushText.textContent = state.remove.brushPercent + '%';
  });
  removeAlgorithm.addEventListener('change', () => {
    state.remove.algorithm = removeAlgorithm.value;
  });

  removeUndoBtn.addEventListener('click', () => {
    if (ToolRemove.undoStroke(state.ops.removeOp)) {
      ToolRemove.rebuildMask(
        getMaskContext(),
        state.ops.removeOp,
        state.remove.maskCanvas.width,
        state.remove.maskCanvas.height
      );
      refreshUndoButtons();
      draw();
      return;
    }
    if (state.undoRedo.removeUndo.length > 0) {
      state.undoRedo.removeRedo.push(ImageCore.cloneCanvas(state.workingImage));
      state.workingImage = state.undoRedo.removeUndo.pop();
      state.save.baseBytes = null;
      initCropRect();
      initMaskCanvas();
      clearMaskAndStrokes();
      refreshTransparencyState();
      refreshUndoButtons();
      setHintForActiveTool();
      draw();
    }
  });

  removeRedoBtn.addEventListener('click', () => {
    if (ToolRemove.redoStroke(state.ops.removeOp)) {
      ToolRemove.rebuildMask(
        getMaskContext(),
        state.ops.removeOp,
        state.remove.maskCanvas.width,
        state.remove.maskCanvas.height
      );
      refreshUndoButtons();
      draw();
      return;
    }
    if (state.undoRedo.removeRedo.length > 0) {
      state.undoRedo.removeUndo.push(ImageCore.cloneCanvas(state.workingImage));
      state.workingImage = state.undoRedo.removeRedo.pop();
      state.save.baseBytes = null;
      initCropRect();
      initMaskCanvas();
      clearMaskAndStrokes();
      refreshTransparencyState();
      refreshUndoButtons();
      setHintForActiveTool();
      draw();
    }
  });

  filterPresetRow.querySelectorAll('button[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.filter.preset = btn.dataset.filter;
      filterPresetRow.querySelectorAll('button[data-filter]').forEach((item) => {
        item.classList.toggle('active', item === btn);
      });
    });
  });
  filterIntensity.addEventListener('input', () => {
    state.filter.intensity = Number(filterIntensity.value);
    filterIntensityText.textContent = state.filter.intensity + '%';
  });
  filterApplyBtn.addEventListener('click', applyFilter);
  filterUndoBtn.addEventListener('click', () => undoFromBucket('filter'));
  filterRedoBtn.addEventListener('click', () => redoFromBucket('filter'));

  reshapeBrush.addEventListener('input', () => {
    state.reshape.brush = Number(reshapeBrush.value);
    reshapeBrushText.textContent = reshapeBrush.value;
  });
  reshapeStrength.addEventListener('input', () => {
    state.reshape.strength = Number(reshapeStrength.value);
    reshapeStrengthText.textContent = reshapeStrength.value + '%';
  });
  reshapeUndoBtn.addEventListener('click', () => undoFromBucket('reshape'));
  reshapeRedoBtn.addEventListener('click', () => redoFromBucket('reshape'));
  reshapeResetBtn.addEventListener('click', () => {
    while (state.undoRedo.reshapeUndo.length) {
      undoFromBucket('reshape');
    }
  });

  window.addEventListener('resize', () => {
    updateLayout();
  });
  window.addEventListener('orientationchange', () => {
    setTimeout(updateLayout, 50);
  });

  updateToolPanes();
  updateLayout();
  resetSession();
  removeAlgorithm.value = state.remove.algorithm;
  removeBrush.value = String(state.remove.brushPercent);
  removeBrushText.textContent = state.remove.brushPercent + '%';
  freeRotateInput.value = '0';
  freeRotateText.textContent = '0°';
  filterIntensity.value = String(state.filter.intensity);
  filterIntensityText.textContent = state.filter.intensity + '%';
  reshapeBrush.value = String(state.reshape.brush);
  reshapeBrushText.textContent = String(state.reshape.brush);
  reshapeStrength.value = String(state.reshape.strength);
  reshapeStrengthText.textContent = state.reshape.strength + '%';
  refreshUndoButtons();
})();
