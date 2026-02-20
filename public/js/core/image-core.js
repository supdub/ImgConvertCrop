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
    const normalized = ((((Number(degrees) || 0) % 360) + 360) % 360);
    if (normalized === 0) return ImageCore.cloneCanvas(sourceCanvas);
    const radians = (normalized * Math.PI) / 180;
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

  ImageCore.flipCanvas = function flipCanvas(sourceCanvas, horizontal) {
    const out = ImageCore.createCanvas(sourceCanvas.width, sourceCanvas.height);
    const ctx = out.getContext('2d');
    ctx.save();
    if (horizontal) {
      ctx.translate(out.width, 0);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(0, out.height);
      ctx.scale(1, -1);
    }
    ctx.drawImage(sourceCanvas, 0, 0);
    ctx.restore();
    return out;
  };

  ImageCore.applyFilter = function applyFilter(sourceCanvas, filter, intensity) {
    const out = ImageCore.cloneCanvas(sourceCanvas);
    const ctx = out.getContext('2d');
    const image = ctx.getImageData(0, 0, out.width, out.height);
    const data = image.data;
    const t = clamp(Number(intensity) || 0, 0, 100) / 100;
    const mode = String(filter || 'none');

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;

      if (mode === 'vivid') {
        const boost = 1 + 0.45 * t;
        r = clamp((r - 128) * boost + 128 + 8 * t, 0, 255);
        g = clamp((g - 128) * boost + 128 + 6 * t, 0, 255);
        b = clamp((b - 128) * boost + 128 + 10 * t, 0, 255);
      } else if (mode === 'warm') {
        r = clamp(r + 28 * t, 0, 255);
        g = clamp(g + 10 * t, 0, 255);
        b = clamp(b - 20 * t, 0, 255);
      } else if (mode === 'cool') {
        r = clamp(r - 14 * t, 0, 255);
        g = clamp(g + 4 * t, 0, 255);
        b = clamp(b + 26 * t, 0, 255);
      } else if (mode === 'mono') {
        r = r * (1 - t) + luma * t;
        g = g * (1 - t) + luma * t;
        b = b * (1 - t) + luma * t;
      } else if (mode === 'fade') {
        const faded = 240;
        r = r * (1 - 0.28 * t) + faded * 0.28 * t;
        g = g * (1 - 0.28 * t) + faded * 0.28 * t;
        b = b * (1 - 0.28 * t) + faded * 0.28 * t;
      }

      data[i] = clamp(r, 0, 255);
      data[i + 1] = clamp(g, 0, 255);
      data[i + 2] = clamp(b, 0, 255);
    }

    ctx.putImageData(image, 0, 0);
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
