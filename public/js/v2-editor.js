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
  const tabAdjust = document.getElementById('tabAdjust');
  const tabFrame = document.getElementById('tabFrame');
  const tabMosaic = document.getElementById('tabMosaic');
  const tabReshape = document.getElementById('tabReshape');

  const cropApplyBtn = document.getElementById('cropApplyBtn');
  const rotateCwBtn = document.getElementById('rotateCwBtn');
  const rotateCcwBtn = document.getElementById('rotateCcwBtn');
  const flipHorizontalBtn = document.getElementById('flipHorizontalBtn');
  const fineRotateSlider = document.getElementById('fineRotateSlider');
  const fineRotateValue = document.getElementById('fineRotateValue');
  const cropUndoBtn = document.getElementById('cropUndoBtn');
  const cropRedoBtn = document.getElementById('cropRedoBtn');
  const cropAspectRow = document.getElementById('cropAspectRow');

  const filterPreset = document.getElementById('filterPreset');
  const filterStrength = document.getElementById('filterStrength');
  const filterStrengthText = document.getElementById('filterStrengthText');
  const filterUndoBtn = document.getElementById('filterUndoBtn');
  const filterRedoBtn = document.getElementById('filterRedoBtn');

  const adjustHighlight = document.getElementById('adjustHighlight');
  const adjustContrast = document.getElementById('adjustContrast');
  const adjustWarmth = document.getElementById('adjustWarmth');
  const adjustSaturation = document.getElementById('adjustSaturation');
  const adjustShadows = document.getElementById('adjustShadows');
  const adjustHighlightText = document.getElementById('adjustHighlightText');
  const adjustContrastText = document.getElementById('adjustContrastText');
  const adjustWarmthText = document.getElementById('adjustWarmthText');
  const adjustSaturationText = document.getElementById('adjustSaturationText');
  const adjustShadowsText = document.getElementById('adjustShadowsText');
  const adjustResetBtn = document.getElementById('adjustResetBtn');
  const adjustUndoBtn = document.getElementById('adjustUndoBtn');
  const adjustRedoBtn = document.getElementById('adjustRedoBtn');

  const frameColor = document.getElementById('frameColor');
  const frameThickness = document.getElementById('frameThickness');
  const frameThicknessText = document.getElementById('frameThicknessText');
  const frameUndoBtn = document.getElementById('frameUndoBtn');
  const frameRedoBtn = document.getElementById('frameRedoBtn');

  const mosaicType = document.getElementById('mosaicType');
  const mosaicBrush = document.getElementById('mosaicBrush');
  const mosaicBrushText = document.getElementById('mosaicBrushText');
  const mosaicStrength = document.getElementById('mosaicStrength');
  const mosaicStrengthText = document.getElementById('mosaicStrengthText');
  const mosaicUndoBtn = document.getElementById('mosaicUndoBtn');
  const mosaicRedoBtn = document.getElementById('mosaicRedoBtn');

  const reshapeBrush = document.getElementById('reshapeBrush');
  const reshapeBrushText = document.getElementById('reshapeBrushText');
  const reshapeStrength = document.getElementById('reshapeStrength');
  const reshapeStrengthText = document.getElementById('reshapeStrengthText');
  const reshapeUndoBtn = document.getElementById('reshapeUndoBtn');
  const reshapeRedoBtn = document.getElementById('reshapeRedoBtn');

  const removeBrush = document.getElementById('removeBrush');
  const removeBrushText = document.getElementById('removeBrushText');
  const removeAlgorithm = document.getElementById('removeAlgorithm');
  const removeUndoBtn = document.getElementById('removeUndoBtn');
  const removeRedoBtn = document.getElementById('removeRedoBtn');

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
      reshapeRedo: [],
      adjustUndo: [],
      adjustRedo: [],
      frameUndo: [],
      frameRedo: [],
      mosaicUndo: [],
      mosaicRedo: []
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
      preset: 'none',
      strength: 100
    },
    adjust: {
      highlight: 0,
      contrast: 0,
      warmth: 0,
      saturation: 0,
      shadows: 0,
      draftBase: null,
      dirty: false
    },
    frame: {
      color: '#ffffff',
      thickness: 8,
      draftBase: null,
      dirty: false
    },
    mosaic: {
      type: 'pixel',
      brushPercent: 24,
      strength: 16,
      active: null
    },
    reshape: {
      brushPercent: 20,
      strength: 48,
      active: null
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
  let fineRotateBaseImage = null;
  let fineRotateDraftDegrees = 0;

  function setStatus(message) {
    statusText.textContent = message;
  }

  function setHintForActiveTool() {
    const map = {
      crop: 'Drag handles to crop. Pinch to zoom.',
      remove: 'Paint to remove. Release to apply. Pinch to zoom.',
      filter: 'Choose preset + strength for one-tap classic look.',
      adjust: 'iOS-style fine adjustments. Sliders apply instantly.',
      frame: 'Pick pure color and size. Frame is applied immediately.',
      mosaic: 'Paint mosaic directly. Release to finish each stroke.',
      reshape: 'Pixel push: drag inward on edges to slim subjects.'
    };
    setStatus(map[state.activeTool] || 'Edit your photo.');
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
    state.undoRedo.adjustUndo = [];
    state.undoRedo.adjustRedo = [];
    state.undoRedo.frameUndo = [];
    state.undoRedo.frameRedo = [];
    state.undoRedo.mosaicUndo = [];
    state.undoRedo.mosaicRedo = [];
    state.crop.rect = null;
    state.crop.draftRect = null;
    state.remove.processing = false;
    state.remove.currentStroke = null;
    state.reshape.active = null;
    state.adjust = { highlight: 0, contrast: 0, warmth: 0, saturation: 0, shadows: 0, draftBase: null, dirty: false };
    state.frame = { color: '#ffffff', thickness: 8, draftBase: null, dirty: false };
    state.mosaic.active = null;
    state.render.hasTransparentPixels = false;
    state.remove.maskCanvas.width = 1;
    state.remove.maskCanvas.height = 1;
    fineRotateBaseImage = null;
    fineRotateDraftDegrees = 0;
    fineRotateSlider.value = '0';
    fineRotateValue.textContent = '0°';
    uploadInput.value = '';
    uploadGate.classList.remove('hidden');
    saveBtn.disabled = true;
    setStatus('Upload one image to start editing.');
    draw();
    refreshUndoButtons();
  }

  function updateToolPanes() {
    finalizeLiveAdjustments();
    finalizeLiveFrame();
    document.querySelectorAll('.tool-pane').forEach((pane) => {
      pane.classList.toggle('active', pane.dataset.tool === state.activeTool);
    });
    tabCrop.classList.toggle('active', state.activeTool === 'crop');
    tabRemove.classList.toggle('active', state.activeTool === 'remove');
    tabFilter.classList.toggle('active', state.activeTool === 'filter');
    tabAdjust.classList.toggle('active', state.activeTool === 'adjust');
    tabFrame.classList.toggle('active', state.activeTool === 'frame');
    tabMosaic.classList.toggle('active', state.activeTool === 'mosaic');
    tabReshape.classList.toggle('active', state.activeTool === 'reshape');
    const titleMap = { crop: 'Editor • Crop', remove: 'Editor • Remove', filter: 'Editor • Filter', adjust: 'Editor • Adjust', frame: 'Editor • Frame', mosaic: 'Editor • Mosaic', reshape: 'Editor • Reshape' };
    topLabel.textContent = titleMap[state.activeTool] || 'Editor';
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
    if (!['crop', 'filter', 'adjust', 'frame', 'mosaic', 'reshape'].includes(state.activeTool)) return;
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
    adjustUndoBtn.disabled = state.undoRedo.adjustUndo.length === 0;
    adjustRedoBtn.disabled = state.undoRedo.adjustRedo.length === 0;
    frameUndoBtn.disabled = state.undoRedo.frameUndo.length === 0;
    frameRedoBtn.disabled = state.undoRedo.frameRedo.length === 0;
    mosaicUndoBtn.disabled = state.undoRedo.mosaicUndo.length === 0;
    mosaicRedoBtn.disabled = state.undoRedo.mosaicRedo.length === 0;
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
    state.undoRedo.adjustUndo = [];
    state.undoRedo.adjustRedo = [];
    state.undoRedo.frameUndo = [];
    state.undoRedo.frameRedo = [];
    state.undoRedo.mosaicUndo = [];
    state.undoRedo.mosaicRedo = [];
    state.adjust = { highlight: 0, contrast: 0, warmth: 0, saturation: 0, shadows: 0, draftBase: null, dirty: false };
    state.frame = { color: '#ffffff', thickness: 8, draftBase: null, dirty: false };
    state.mosaic.active = null;
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
    state.undoRedo.adjustUndo = [];
    state.undoRedo.adjustRedo = [];
    state.undoRedo.frameUndo = [];
    state.undoRedo.frameRedo = [];
    state.undoRedo.mosaicUndo = [];
    state.undoRedo.mosaicRedo = [];
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
    state.undoRedo.adjustUndo = [];
    state.undoRedo.adjustRedo = [];
    state.undoRedo.frameUndo = [];
    state.undoRedo.frameRedo = [];
    state.undoRedo.mosaicUndo = [];
    state.undoRedo.mosaicRedo = [];
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
    state.undoRedo.adjustUndo = [];
    state.undoRedo.adjustRedo = [];
    state.undoRedo.frameUndo = [];
    state.undoRedo.frameRedo = [];
    state.undoRedo.mosaicUndo = [];
    state.undoRedo.mosaicRedo = [];
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


  function commitWorkingImage(nextCanvas, stackName) {
    state.undoRedo[stackName + 'Undo'].push(ImageCore.cloneCanvas(state.workingImage));
    state.undoRedo[stackName + 'Redo'] = [];
    state.workingImage = nextCanvas;
    state.save.baseBytes = null;
    initCropRect();
    initMaskCanvas();
    clearMaskAndStrokes();
    refreshTransparencyState();
    fitViewportToImage();
    refreshUndoButtons();
    draw();
  }

  function rotateImage(deg) {
    if (!state.workingImage) return;
    const out = ImageCore.rotateCanvas(state.workingImage, deg);
    commitWorkingImage(out, 'crop');
    showToast('Rotation applied.');
  }

  function mirrorImage() {
    if (!state.workingImage) return;
    const out = ImageCore.flipCanvasHorizontal(state.workingImage);
    commitWorkingImage(out, 'crop');
    showToast('Mirror flip applied.');
  }

  function resetFineRotateControl() {
    fineRotateSlider.value = '0';
    fineRotateValue.textContent = '0°';
  }

  function updateFineRotationPreview(degrees) {
    if (!state.workingImage) return;
    if (!fineRotateBaseImage) {
      fineRotateBaseImage = ImageCore.cloneCanvas(state.workingImage);
    }
    fineRotateDraftDegrees = degrees;
    if (Math.abs(degrees) < 0.01) {
      state.workingImage = fineRotateBaseImage;
    } else {
      state.workingImage = ImageCore.rotateCanvas(fineRotateBaseImage, degrees);
    }
    state.save.baseBytes = null;
    initCropRect();
    initMaskCanvas();
    clearMaskAndStrokes();
    refreshTransparencyState();
    fitViewportToImage();
    refreshUndoButtons();
    draw();
  }

  function finalizeFineRotation() {
    if (!fineRotateBaseImage) {
      resetFineRotateControl();
      return;
    }
    if (Math.abs(fineRotateDraftDegrees) >= 0.01) {
      state.undoRedo.cropUndo.push(fineRotateBaseImage);
      state.undoRedo.cropRedo = [];
      state.undoRedo.removeUndo = [];
      state.undoRedo.removeRedo = [];
      state.undoRedo.filterUndo = [];
      state.undoRedo.filterRedo = [];
      state.undoRedo.reshapeUndo = [];
      state.undoRedo.reshapeRedo = [];
      showToast('Fine rotation applied.');
    } else {
      state.workingImage = fineRotateBaseImage;
    }
    fineRotateBaseImage = null;
    fineRotateDraftDegrees = 0;
    resetFineRotateControl();
    setHintForActiveTool();
    refreshUndoButtons();
    draw();
  }

  function applyFilter() {
    if (!state.workingImage) return;
    const preset = filterPreset.value;
    if (preset === 'none') {
      setStatus('Select a filter preset first.');
      return;
    }
    const out = ImageCore.applyFilterPreset(state.workingImage, preset, state.filter.strength);
    commitWorkingImage(out, 'filter');
    showToast('Filter applied.');
  }

  function undoStack(name) {
    if (!state.undoRedo[name + 'Undo'].length) return;
    state.undoRedo[name + 'Redo'].push(ImageCore.cloneCanvas(state.workingImage));
    state.workingImage = state.undoRedo[name + 'Undo'].pop();
    state.save.baseBytes = null;
    initCropRect();
    initMaskCanvas();
    clearMaskAndStrokes();
    refreshTransparencyState();
    fitViewportToImage();
    refreshUndoButtons();
    draw();
  }

  function redoStack(name) {
    if (!state.undoRedo[name + 'Redo'].length) return;
    state.undoRedo[name + 'Undo'].push(ImageCore.cloneCanvas(state.workingImage));
    state.workingImage = state.undoRedo[name + 'Redo'].pop();
    state.save.baseBytes = null;
    initCropRect();
    initMaskCanvas();
    clearMaskAndStrokes();
    refreshTransparencyState();
    fitViewportToImage();
    refreshUndoButtons();
    draw();
  }

  function beginReshapeStroke(imagePoint) {
    if (!state.workingImage) return;
    state.undoRedo.reshapeUndo.push(ImageCore.cloneCanvas(state.workingImage));
    state.undoRedo.reshapeRedo = [];
    state.reshape.active = { lastPoint: imagePoint };
    refreshUndoButtons();
  }

  function updateReshapeStroke(imagePoint) {
    if (!state.reshape.active || !state.workingImage) return;
    const last = state.reshape.active.lastPoint;
    const dx = imagePoint.x - last.x;
    const dy = imagePoint.y - last.y;
    if (Math.abs(dx) < 0.4 && Math.abs(dy) < 0.4) return;
    const basis = Math.min(state.workingImage.width, state.workingImage.height);
    const radius = Math.max(8, (Number(state.reshape.brushPercent) / 100) * basis * 0.25);
    const strength = Math.max(0.05, Number(state.reshape.strength) / 100);
    state.workingImage = ImageCore.pushPixels(state.workingImage, imagePoint.x, imagePoint.y, dx, dy, radius, strength);
    state.reshape.active.lastPoint = imagePoint;
    state.save.baseBytes = null;
    refreshTransparencyState();
    draw();
  }

  function endReshapeStroke() {
    if (!state.reshape.active) return;
    state.reshape.active = null;
    showToast('Reshape applied.');
    refreshUndoButtons();
  }



  function renderMosaicStamp(targetCanvas, sourceCanvas, centerX, centerY, radius, type, strength) {
    const w = targetCanvas.width;
    const h = targetCanvas.height;
    const minX = Math.max(0, Math.floor(centerX - radius));
    const minY = Math.max(0, Math.floor(centerY - radius));
    const maxX = Math.min(w, Math.ceil(centerX + radius));
    const maxY = Math.min(h, Math.ceil(centerY + radius));
    const regionW = Math.max(1, maxX - minX);
    const regionH = Math.max(1, maxY - minY);
    const sctx = sourceCanvas.getContext('2d');
    const tctx = targetCanvas.getContext('2d');
    const src = sctx.getImageData(minX, minY, regionW, regionH);
    const dst = tctx.createImageData(regionW, regionH);
    dst.data.set(src.data);
    const block = Math.max(2, Number(strength) || 10);

    if (type === 'blur') {
      const blurR = Math.max(1, Math.round(block / 4));
      for (let y = 0; y < regionH; y += 1) {
        for (let x = 0; x < regionW; x += 1) {
          const dx = x + minX - centerX;
          const dy = y + minY - centerY;
          if (dx * dx + dy * dy > radius * radius) continue;
          let tr = 0, tg = 0, tb = 0, ta = 0, count = 0;
          for (let oy = -blurR; oy <= blurR; oy += 1) {
            for (let ox = -blurR; ox <= blurR; ox += 1) {
              const sx = Math.max(0, Math.min(regionW - 1, x + ox));
              const sy = Math.max(0, Math.min(regionH - 1, y + oy));
              const si = (sy * regionW + sx) * 4;
              tr += src.data[si]; tg += src.data[si + 1]; tb += src.data[si + 2]; ta += src.data[si + 3]; count += 1;
            }
          }
          const di = (y * regionW + x) * 4;
          dst.data[di] = tr / count; dst.data[di + 1] = tg / count; dst.data[di + 2] = tb / count; dst.data[di + 3] = ta / count;
        }
      }
    } else {
      const stepY = type === 'hex' ? Math.max(2, Math.round(block * 0.86)) : block;
      for (let by = 0; by < regionH; by += stepY) {
        const offsetX = type === 'hex' && Math.floor(by / stepY) % 2 ? Math.round(block / 2) : 0;
        for (let bx = 0; bx < regionW; bx += block) {
          const sx = Math.min(regionW - 1, bx + offsetX + Math.floor(block / 2));
          const sy = Math.min(regionH - 1, by + Math.floor(stepY / 2));
          const si = (sy * regionW + sx) * 4;
          const r = src.data[si], g = src.data[si + 1], b = src.data[si + 2], a = src.data[si + 3];
          const yEnd = Math.min(regionH, by + stepY);
          const xEnd = Math.min(regionW, bx + block + offsetX);
          for (let y = by; y < yEnd; y += 1) {
            for (let x = Math.max(0, bx + offsetX); x < xEnd; x += 1) {
              const dx = x + minX - centerX;
              const dy = y + minY - centerY;
              if (dx * dx + dy * dy > radius * radius) continue;
              if (type === 'hex') {
                const cellCx = bx + offsetX + block / 2;
                const cellCy = by + stepY / 2;
                if (((x - cellCx) ** 2) / ((block * 0.55) ** 2) + ((y - cellCy) ** 2) / ((stepY * 0.52) ** 2) > 1) continue;
              }
              const di = (y * regionW + x) * 4;
              dst.data[di] = r; dst.data[di + 1] = g; dst.data[di + 2] = b; dst.data[di + 3] = a;
            }
          }
        }
      }
    }
    tctx.putImageData(dst, minX, minY);
  }

  function beginMosaicStroke(imagePoint) {
    if (!state.workingImage) return;
    state.undoRedo.mosaicUndo.push(ImageCore.cloneCanvas(state.workingImage));
    state.undoRedo.mosaicRedo = [];
    state.mosaic.active = { lastPoint: imagePoint, sourceSnapshot: ImageCore.cloneCanvas(state.workingImage) };
    refreshUndoButtons();
    updateMosaicStroke(imagePoint);
  }

  function updateMosaicStroke(imagePoint) {
    if (!state.mosaic.active || !state.workingImage) return;
    const basis = Math.min(state.workingImage.width, state.workingImage.height);
    const radius = Math.max(6, (Number(state.mosaic.brushPercent) / 100) * basis * 0.24);
    const intensity = Math.max(4, Number(state.mosaic.strength) || 12);
    const last = state.mosaic.active.lastPoint;
    const dist = Math.hypot(imagePoint.x - last.x, imagePoint.y - last.y);
    const step = Math.max(3, radius * 0.34);
    const count = Math.max(1, Math.ceil(dist / step));
    for (let i = 1; i <= count; i += 1) {
      const t = i / count;
      const px = last.x + (imagePoint.x - last.x) * t;
      const py = last.y + (imagePoint.y - last.y) * t;
      renderMosaicStamp(state.workingImage, state.mosaic.active.sourceSnapshot, px, py, radius, state.mosaic.type, intensity);
    }
    state.mosaic.active.lastPoint = imagePoint;
    state.save.baseBytes = null;
    draw();
  }

  function endMosaicStroke() {
    if (!state.mosaic.active) return;
    state.mosaic.active = null;
    refreshTransparencyState();
    showToast('Mosaic applied.');
    refreshUndoButtons();
  }

  function applyLiveAdjustments() {
    if (!state.workingImage) return;
    if (!state.adjust.draftBase) {
      state.adjust.draftBase = ImageCore.cloneCanvas(state.workingImage);
      state.adjust.dirty = false;
    }
    const next = ImageCore.applyColorAdjustments(state.adjust.draftBase, state.adjust);
    state.workingImage = next;
    state.adjust.dirty = true;
    state.save.baseBytes = null;
    initCropRect();
    initMaskCanvas();
    clearMaskAndStrokes();
    refreshTransparencyState();
    fitViewportToImage();
    draw();
  }

  function finalizeLiveAdjustments() {
    if (!state.adjust.draftBase) return;
    if (state.adjust.dirty) {
      state.undoRedo.adjustUndo.push(state.adjust.draftBase);
      state.undoRedo.adjustRedo = [];
      refreshUndoButtons();
    } else {
      state.workingImage = state.adjust.draftBase;
    }
    state.adjust.draftBase = null;
    state.adjust.dirty = false;
  }

  function applyLiveFrame() {
    if (!state.workingImage) return;
    if (!state.frame.draftBase) {
      state.frame.draftBase = ImageCore.cloneCanvas(state.workingImage);
      state.frame.dirty = false;
    }
    state.workingImage = ImageCore.addSolidFrame(state.frame.draftBase, state.frame.color, state.frame.thickness);
    state.frame.dirty = true;
    state.save.baseBytes = null;
    initCropRect();
    initMaskCanvas();
    clearMaskAndStrokes();
    refreshTransparencyState();
    fitViewportToImage();
    draw();
  }

  function finalizeLiveFrame() {
    if (!state.frame.draftBase) return;
    if (state.frame.dirty) {
      state.undoRedo.frameUndo.push(state.frame.draftBase);
      state.undoRedo.frameRedo = [];
      refreshUndoButtons();
    } else {
      state.workingImage = state.frame.draftBase;
    }
    state.frame.draftBase = null;
    state.frame.dirty = false;
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
    } else if (state.activeTool === 'remove') {
      if (!state.remove.processing) beginRemoveStroke(imagePoint);
    } else if (state.activeTool === 'reshape') {
      beginReshapeStroke(imagePoint);
    } else if (state.activeTool === 'mosaic') {
      beginMosaicStroke(imagePoint);
    } else {
      state.pan = {
        startCanvas: point,
        startOffsetX: state.viewport.offsetX,
        startOffsetY: state.viewport.offsetY
      };
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
    } else if (state.activeTool === 'reshape' && state.reshape.active) {
      updateReshapeStroke(getImagePointFromCanvas(point));
    } else if (state.activeTool === 'mosaic' && state.mosaic.active) {
      updateMosaicStroke(getImagePointFromCanvas(point));
    } else if (state.pan) {
      state.viewport.offsetX = state.pan.startOffsetX + (point.x - state.pan.startCanvas.x);
      state.viewport.offsetY = state.pan.startOffsetY + (point.y - state.pan.startCanvas.y);
      clampViewport({ hard: false });
      draw();
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
      endReshapeStroke();
      clampViewport({ hard: true });
      draw();
    } else if (state.activeTool === 'mosaic') {
      endMosaicStroke();
      clampViewport({ hard: true });
      draw();
    } else {
      if (state.pointers.size === 0) state.pan = null;
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
    if (state.workingImage && !window.confirm('Discard current session?')) return;
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
  tabAdjust.addEventListener('click', () => {
    state.activeTool = 'adjust';
    updateToolPanes();
  });
  tabFrame.addEventListener('click', () => {
    state.activeTool = 'frame';
    updateToolPanes();
  });
  tabMosaic.addEventListener('click', () => {
    state.activeTool = 'mosaic';
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
  cropUndoBtn.addEventListener('click', undoCrop);
  cropRedoBtn.addEventListener('click', redoCrop);

  rotateCwBtn.addEventListener('click', () => rotateImage(90));
  rotateCcwBtn.addEventListener('click', () => rotateImage(-90));
  flipHorizontalBtn.addEventListener('click', mirrorImage);
  fineRotateSlider.addEventListener('input', () => {
    const nextValue = Number(fineRotateSlider.value) || 0;
    fineRotateValue.textContent = nextValue.toFixed(1).replace('.0', '') + '°';
    updateFineRotationPreview(nextValue);
  });
  fineRotateSlider.addEventListener('change', () => {
    finalizeFineRotation();
  });

  filterPreset.addEventListener('change', () => {
    state.filter.preset = filterPreset.value;
    if (state.filter.preset !== 'none') applyFilter();
  });
  filterStrength.addEventListener('input', () => {
    state.filter.strength = Number(filterStrength.value) || 0;
    filterStrengthText.textContent = state.filter.strength + '%';
    if (state.filter.preset !== 'none') applyFilter();
  });
  filterUndoBtn.addEventListener('click', () => undoStack('filter'));
  filterRedoBtn.addEventListener('click', () => redoStack('filter'));

  const adjustInputs = [
    [adjustHighlight, adjustHighlightText, 'highlight'],
    [adjustContrast, adjustContrastText, 'contrast'],
    [adjustWarmth, adjustWarmthText, 'warmth'],
    [adjustSaturation, adjustSaturationText, 'saturation'],
    [adjustShadows, adjustShadowsText, 'shadows']
  ];
  adjustInputs.forEach(([input, output, key]) => {
    input.addEventListener('input', () => {
      state.adjust[key] = Number(input.value) || 0;
      output.textContent = String(state.adjust[key]);
      applyLiveAdjustments();
    });
    input.addEventListener('change', finalizeLiveAdjustments);
  });
  adjustResetBtn.addEventListener('click', () => {
    adjustInputs.forEach(([input, output, key]) => {
      state.adjust[key] = 0;
      input.value = '0';
      output.textContent = '0';
    });
    applyLiveAdjustments();
    finalizeLiveAdjustments();
  });
  adjustUndoBtn.addEventListener('click', () => undoStack('adjust'));
  adjustRedoBtn.addEventListener('click', () => redoStack('adjust'));

  frameColor.addEventListener('input', () => {
    state.frame.color = frameColor.value;
    applyLiveFrame();
  });
  frameThickness.addEventListener('input', () => {
    state.frame.thickness = Number(frameThickness.value) || 0;
    frameThicknessText.textContent = state.frame.thickness + '%';
    applyLiveFrame();
  });
  frameColor.addEventListener('change', finalizeLiveFrame);
  frameThickness.addEventListener('change', finalizeLiveFrame);
  frameUndoBtn.addEventListener('click', () => undoStack('frame'));
  frameRedoBtn.addEventListener('click', () => redoStack('frame'));

  mosaicType.addEventListener('change', () => {
    state.mosaic.type = mosaicType.value;
  });
  mosaicBrush.addEventListener('input', () => {
    state.mosaic.brushPercent = Number(mosaicBrush.value) || 24;
    mosaicBrushText.textContent = state.mosaic.brushPercent + '%';
  });
  mosaicStrength.addEventListener('input', () => {
    state.mosaic.strength = Number(mosaicStrength.value) || 16;
    mosaicStrengthText.textContent = String(state.mosaic.strength);
  });
  mosaicUndoBtn.addEventListener('click', () => undoStack('mosaic'));
  mosaicRedoBtn.addEventListener('click', () => redoStack('mosaic'));

  reshapeBrush.addEventListener('input', () => {
    state.reshape.brushPercent = Number(reshapeBrush.value);
    reshapeBrushText.textContent = state.reshape.brushPercent + '%';
  });
  reshapeStrength.addEventListener('input', () => {
    state.reshape.strength = Number(reshapeStrength.value);
    reshapeStrengthText.textContent = state.reshape.strength + '%';
  });
  reshapeUndoBtn.addEventListener('click', () => undoStack('reshape'));
  reshapeRedoBtn.addEventListener('click', () => redoStack('reshape'));

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
  filterPreset.value = state.filter.preset;
  filterStrength.value = String(state.filter.strength);
  filterStrengthText.textContent = state.filter.strength + '%';
  reshapeBrush.value = String(state.reshape.brushPercent);
  reshapeBrushText.textContent = state.reshape.brushPercent + '%';
  reshapeStrength.value = String(state.reshape.strength);
  reshapeStrengthText.textContent = state.reshape.strength + '%';
  frameColor.value = state.frame.color;
  frameThickness.value = String(state.frame.thickness);
  frameThicknessText.textContent = state.frame.thickness + '%';
  mosaicType.value = state.mosaic.type;
  mosaicBrush.value = String(state.mosaic.brushPercent);
  mosaicBrushText.textContent = state.mosaic.brushPercent + '%';
  mosaicStrength.value = String(state.mosaic.strength);
  mosaicStrengthText.textContent = String(state.mosaic.strength);
  [adjustHighlight, adjustContrast, adjustWarmth, adjustSaturation, adjustShadows].forEach((el) => {
    el.value = '0';
  });
  [adjustHighlightText, adjustContrastText, adjustWarmthText, adjustSaturationText, adjustShadowsText].forEach((el) => {
    el.textContent = '0';
  });
  fineRotateValue.textContent = '0°';
  refreshUndoButtons();
})();
