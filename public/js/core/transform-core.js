(function (global) {
  const TransformCore = {};

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  TransformCore.clamp = clamp;

  TransformCore.fitContain = function fitContain(imageW, imageH, viewportW, viewportH) {
    const safeVw = Math.max(1, viewportW);
    const safeVh = Math.max(1, viewportH);
    const scale = Math.min(safeVw / imageW, safeVh / imageH);
    const drawW = imageW * scale;
    const drawH = imageH * scale;
    return {
      scale,
      offsetX: (safeVw - drawW) / 2,
      offsetY: (safeVh - drawH) / 2
    };
  };

  TransformCore.screenToImage = function screenToImage(point, viewport) {
    return {
      x: (point.x - viewport.offsetX) / viewport.scale,
      y: (point.y - viewport.offsetY) / viewport.scale
    };
  };

  TransformCore.imageToScreen = function imageToScreen(point, viewport) {
    return {
      x: point.x * viewport.scale + viewport.offsetX,
      y: point.y * viewport.scale + viewport.offsetY
    };
  };

  TransformCore.createDefaultCropRect = function createDefaultCropRect(width, height) {
    return {
      x: width * 0.1,
      y: height * 0.1,
      w: width * 0.8,
      h: height * 0.8
    };
  };

  TransformCore.normalizeRect = function normalizeRect(rect) {
    const x = Math.min(rect.x, rect.x + rect.w);
    const y = Math.min(rect.y, rect.y + rect.h);
    const w = Math.abs(rect.w);
    const h = Math.abs(rect.h);
    return { x, y, w, h };
  };

  TransformCore.clampCropRect = function clampCropRect(rect, imageW, imageH, minSize) {
    const min = Math.max(8, minSize || 20);
    const out = { ...rect };
    out.w = clamp(out.w, min, imageW);
    out.h = clamp(out.h, min, imageH);
    out.x = clamp(out.x, 0, imageW - out.w);
    out.y = clamp(out.y, 0, imageH - out.h);
    return out;
  };

  TransformCore.fitAspectRect = function fitAspectRect(imageW, imageH, ratio) {
    if (!ratio || ratio <= 0) {
      return TransformCore.createDefaultCropRect(imageW, imageH);
    }
    const maxW = imageW * 0.9;
    const maxH = imageH * 0.9;
    let w = maxW;
    let h = w / ratio;
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }
    return {
      x: (imageW - w) / 2,
      y: (imageH - h) / 2,
      w,
      h
    };
  };

  global.TransformCore = TransformCore;
})(window);
