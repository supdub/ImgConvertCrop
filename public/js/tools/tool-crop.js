(function (global) {
  const ToolCrop = {};

  function parseAspect(value) {
    if (!value || value === 'free') return null;
    const parts = String(value).split(':');
    if (parts.length !== 2) return null;
    const a = Number(parts[0]);
    const b = Number(parts[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0) return null;
    return a / b;
  }

  ToolCrop.parseAspect = parseAspect;

  ToolCrop.createInitialRect = function createInitialRect(width, height, aspect) {
    if (!aspect) {
      return global.TransformCore.createDefaultCropRect(width, height);
    }
    return global.TransformCore.fitAspectRect(width, height, aspect);
  };

  ToolCrop.hitTest = function hitTest(rect, point, tolerance) {
    const t = tolerance || 16;
    const handles = {
      nw: { x: rect.x, y: rect.y },
      ne: { x: rect.x + rect.w, y: rect.y },
      sw: { x: rect.x, y: rect.y + rect.h },
      se: { x: rect.x + rect.w, y: rect.y + rect.h }
    };

    for (const name in handles) {
      const h = handles[name];
      if (Math.abs(point.x - h.x) <= t && Math.abs(point.y - h.y) <= t) {
        return name;
      }
    }

    if (
      point.x >= rect.x &&
      point.x <= rect.x + rect.w &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.h
    ) {
      return 'move';
    }

    return null;
  };

  ToolCrop.resizeRect = function resizeRect(startRect, handle, dx, dy, aspect, boundsW, boundsH) {
    const min = 20;
    const out = { ...startRect };

    if (handle === 'move') {
      out.x = startRect.x + dx;
      out.y = startRect.y + dy;
      return global.TransformCore.clampCropRect(out, boundsW, boundsH, min);
    }

    if (!aspect) {
      if (handle.includes('n')) {
        out.y = startRect.y + dy;
        out.h = startRect.h - dy;
      }
      if (handle.includes('s')) out.h = startRect.h + dy;
      if (handle.includes('w')) {
        out.x = startRect.x + dx;
        out.w = startRect.w - dx;
      }
      if (handle.includes('e')) out.w = startRect.w + dx;
    } else {
      const horizontal = handle.includes('e') ? dx : -dx;
      const vertical = handle.includes('s') ? dy : -dy;
      const useHorizontal = Math.abs(horizontal) > Math.abs(vertical * aspect);
      const nextW = startRect.w + (useHorizontal ? horizontal : vertical * aspect);
      const w = Math.max(min, nextW);
      const h = w / aspect;
      out.w = w;
      out.h = h;
      out.x = handle.includes('w') ? startRect.x + (startRect.w - w) : startRect.x;
      out.y = handle.includes('n') ? startRect.y + (startRect.h - h) : startRect.y;
    }

    return global.TransformCore.clampCropRect(out, boundsW, boundsH, min);
  };

  global.ToolCrop = ToolCrop;
})(window);
