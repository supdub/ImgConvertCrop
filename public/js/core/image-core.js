(function (global) {
  const ImageCore = {};

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  ImageCore.formatToMime = function formatToMime(format) {
    const normalized = String(format || '').toLowerCase();
    if (normalized === 'jpg' || normalized === 'jpeg') return 'image/jpeg';
    if (normalized === 'png') return 'image/png';
    if (normalized === 'webp') return 'image/webp';
    if (normalized === 'avif') return 'image/avif';
    return normalized.startsWith('image/') ? normalized : 'image/png';
  };

  ImageCore.extForFormat = function extForFormat(format) {
    const normalized = String(format || '').toLowerCase();
    return normalized === 'jpeg' ? 'jpg' : normalized;
  };

  ImageCore.toQualityUnit = function toQualityUnit(value, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return clamp(n / 100, 0.01, 1);
  };

  ImageCore.canEncode = function canEncode(mimeType) {
    const c = document.createElement('canvas');
    const out = c.toDataURL(mimeType);
    return out.startsWith('data:' + mimeType);
  };

  ImageCore.loadImageFromBlob = async function loadImageFromBlob(blob) {
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  ImageCore.loadImageFromFile = function loadImageFromFile(file) {
    return ImageCore.loadImageFromBlob(file);
  };

  ImageCore.createCanvas = function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    return canvas;
  };

  ImageCore.cloneCanvas = function cloneCanvas(sourceCanvas) {
    const canvas = ImageCore.createCanvas(sourceCanvas.width, sourceCanvas.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(sourceCanvas, 0, 0);
    return canvas;
  };

  ImageCore.drawToCanvas = function drawToCanvas(source, width, height) {
    const canvas = ImageCore.createCanvas(width || source.width, height || source.height);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas;
  };

  ImageCore.canvasToBlob = function canvasToBlob(canvas, mimeType, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to generate image blob.'));
            return;
          }
          resolve(blob);
        },
        mimeType,
        quality
      );
    });
  };

  ImageCore.renderToBlob = async function renderToBlob(source, options) {
    const opts = options || {};
    const mimeType = opts.mimeType || 'image/png';
    const quality = typeof opts.quality === 'number' ? opts.quality : undefined;
    const crop = opts.crop || { x: 0, y: 0, w: source.width, h: source.height };
    const outW = Math.max(1, Math.round(opts.outWidth || crop.w || source.width));
    const outH = Math.max(1, Math.round(opts.outHeight || crop.h || source.height));

    const canvas = ImageCore.createCanvas(outW, outH);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      source,
      Math.round(crop.x),
      Math.round(crop.y),
      Math.round(crop.w),
      Math.round(crop.h),
      0,
      0,
      outW,
      outH
    );

    const blob = await ImageCore.canvasToBlob(canvas, mimeType, quality);
    return { blob, width: outW, height: outH, mimeType };
  };

  ImageCore.cropCanvas = function cropCanvas(sourceCanvas, rect) {
    const out = ImageCore.createCanvas(rect.w, rect.h);
    const ctx = out.getContext('2d');
    ctx.drawImage(
      sourceCanvas,
      Math.round(rect.x),
      Math.round(rect.y),
      Math.round(rect.w),
      Math.round(rect.h),
      0,
      0,
      out.width,
      out.height
    );
    return out;
  };



  ImageCore.rotateCanvas = function rotateCanvas(sourceCanvas, degrees) {
    const radians = (Number(degrees) || 0) * Math.PI / 180;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));
    const outW = Math.max(1, Math.round(sourceCanvas.width * cos + sourceCanvas.height * sin));
    const outH = Math.max(1, Math.round(sourceCanvas.width * sin + sourceCanvas.height * cos));
    const out = ImageCore.createCanvas(outW, outH);
    const ctx = out.getContext('2d');
    ctx.translate(outW / 2, outH / 2);
    ctx.rotate(radians);
    ctx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2);
    return out;
  };

  ImageCore.flipCanvasHorizontal = function flipCanvasHorizontal(sourceCanvas) {
    const out = ImageCore.createCanvas(sourceCanvas.width, sourceCanvas.height);
    const ctx = out.getContext('2d');
    ctx.translate(out.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(sourceCanvas, 0, 0);
    return out;
  };

  ImageCore.applyFilterPreset = function applyFilterPreset(sourceCanvas, preset, strengthPercent) {
    const p = String(preset || 'none').toLowerCase();
    const strength = clamp(Number(strengthPercent), 0, 100) / 100;
    const filters = {
      none: 'none',
      vivid: 'contrast(1.18) saturate(1.24)',
      portrait: 'brightness(1.06) contrast(1.08) saturate(1.08)',
      bw: 'grayscale(1) contrast(1.12)',
      vintage: 'sepia(0.42) contrast(1.05) saturate(0.84)',
      warm: 'sepia(0.24) saturate(1.14) hue-rotate(-8deg)',
      cool: 'saturate(0.9) hue-rotate(10deg) contrast(1.04)'
    };
    if (p === 'none' || strength <= 0) {
      return ImageCore.cloneCanvas(sourceCanvas);
    }

    const filtered = ImageCore.cloneCanvas(sourceCanvas);
    const filteredCtx = filtered.getContext('2d');
    filteredCtx.filter = filters[p] || 'none';
    filteredCtx.clearRect(0, 0, filtered.width, filtered.height);
    filteredCtx.drawImage(sourceCanvas, 0, 0);
    filteredCtx.filter = 'none';

    if (strength >= 0.999) {
      return filtered;
    }

    const out = ImageCore.cloneCanvas(sourceCanvas);
    const ctx = out.getContext('2d');
    ctx.globalAlpha = strength;
    ctx.drawImage(filtered, 0, 0);
    ctx.globalAlpha = 1;
    ctx.filter = 'none';
    return out;
  };


  ImageCore.applyColorAdjustments = function applyColorAdjustments(sourceCanvas, adjustments) {
    const opts = adjustments || {};
    const highlight = clamp(Number(opts.highlight) || 0, -100, 100) / 100;
    const contrast = clamp(Number(opts.contrast) || 0, -100, 100) / 100;
    const warmth = clamp(Number(opts.warmth) || 0, -100, 100) / 100;
    const saturation = clamp(Number(opts.saturation) || 0, -100, 100) / 100;
    const shadows = clamp(Number(opts.shadows) || 0, -100, 100) / 100;

    const out = ImageCore.cloneCanvas(sourceCanvas);
    const ctx = out.getContext('2d');
    const img = ctx.getImageData(0, 0, out.width, out.height);
    const d = img.data;
    const contrastMul = 1 + contrast * 0.85;
    const satMul = 1 + saturation * 0.9;

    for (let i = 0; i < d.length; i += 4) {
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const hiMix = Math.max(0, (luma - 138) / 117);
      const shMix = Math.max(0, (132 - luma) / 132);
      const hiBoost = highlight * hiMix * 62;
      const shBoost = shadows * shMix * 56;
      r += hiBoost + shBoost;
      g += hiBoost + shBoost;
      b += hiBoost + shBoost;

      r = (r - 128) * contrastMul + 128;
      g = (g - 128) * contrastMul + 128;
      b = (b - 128) * contrastMul + 128;

      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * satMul;
      g = gray + (g - gray) * satMul;
      b = gray + (b - gray) * satMul;

      const warmR = 36 * warmth;
      const warmB = -30 * warmth;
      r += warmR;
      b += warmB;
      g += 8 * warmth;

      d[i] = clamp(Math.round(r), 0, 255);
      d[i + 1] = clamp(Math.round(g), 0, 255);
      d[i + 2] = clamp(Math.round(b), 0, 255);
    }
    ctx.putImageData(img, 0, 0);
    return out;
  };

  ImageCore.addSolidFrame = function addSolidFrame(sourceCanvas, colorHex, thicknessPercent) {
    const pct = clamp(Number(thicknessPercent) || 0, 0, 30) / 100;
    if (pct <= 0.0001) return ImageCore.cloneCanvas(sourceCanvas);
    const border = Math.max(1, Math.round(Math.min(sourceCanvas.width, sourceCanvas.height) * pct));
    const out = ImageCore.createCanvas(sourceCanvas.width + border * 2, sourceCanvas.height + border * 2);
    const ctx = out.getContext('2d');
    ctx.fillStyle = colorHex || '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(sourceCanvas, border, border);
    return out;
  };

  ImageCore.pushPixels = function pushPixels(sourceCanvas, centerX, centerY, deltaX, deltaY, radius, strength) {
    const out = ImageCore.cloneCanvas(sourceCanvas);
    const w = out.width;
    const h = out.height;
    const ctx = out.getContext('2d');
    const src = ctx.getImageData(0, 0, w, h);
    const dst = ctx.createImageData(w, h);
    dst.data.set(src.data);
    const r = Math.max(6, Number(radius) || 20);
    const force = Math.max(0.02, Math.min(1, Number(strength) || 0.4));
    const maxShiftX = deltaX * force;
    const maxShiftY = deltaY * force;
    const minX = Math.max(0, Math.floor(centerX - r));
    const maxX = Math.min(w - 1, Math.ceil(centerX + r));
    const minY = Math.max(0, Math.floor(centerY - r));
    const maxY = Math.min(h - 1, Math.ceil(centerY + r));

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.hypot(dx, dy);
        if (dist >= r) continue;
        const falloff = (1 - dist / r) ** 2;
        const sx = clamp(Math.round(x - maxShiftX * falloff), 0, w - 1);
        const sy = clamp(Math.round(y - maxShiftY * falloff), 0, h - 1);
        const di = (y * w + x) * 4;
        const si = (sy * w + sx) * 4;
        dst.data[di] = src.data[si];
        dst.data[di + 1] = src.data[si + 1];
        dst.data[di + 2] = src.data[si + 2];
        dst.data[di + 3] = src.data[si + 3];
      }
    }

    ctx.putImageData(dst, 0, 0);
    return out;
  };

  ImageCore.estimateFileSize = function estimateFileSize(opts) {
    const width = Number(opts.width) || 1;
    const height = Number(opts.height) || 1;
    const format = String(opts.format || 'png').toLowerCase();
    const q = clamp(Number(opts.quality) || 90, 1, 100) / 100;
    const pixels = width * height;
    let bytes;

    if (format === 'png') {
      bytes = pixels * 2.2;
    } else if (format === 'webp') {
      bytes = pixels * (0.12 + 0.46 * q);
    } else {
      bytes = pixels * (0.18 + 0.7 * q);
    }

    return Math.max(256, Math.round(bytes));
  };

  ImageCore.formatBytes = function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  ImageCore.downloadBlob = function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  global.ImageCore = ImageCore;
})(window);
