(function (global) {
  const ToolRemove = {};

  ToolRemove.createOps = function createOps() {
    return {
      strokes: [],
      redoStrokes: [],
      lastResult: null
    };
  };

  ToolRemove.beginStroke = function beginStroke(mode, size, point) {
    return {
      mode: mode === 'erase' ? 'erase' : 'paint',
      size: Math.max(1, Number(size) || 18),
      points: [point]
    };
  };

  ToolRemove.extendStroke = function extendStroke(stroke, point) {
    stroke.points.push(point);
  };

  function drawSegment(ctx, a, b, radius) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = radius * 2;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  ToolRemove.drawStroke = function drawStroke(maskCtx, stroke) {
    const radius = stroke.size / 2;
    maskCtx.save();
    if (stroke.mode === 'erase') {
      maskCtx.globalCompositeOperation = 'destination-out';
      maskCtx.strokeStyle = 'rgba(0,0,0,1)';
      maskCtx.fillStyle = 'rgba(0,0,0,1)';
    } else {
      maskCtx.globalCompositeOperation = 'source-over';
      maskCtx.strokeStyle = 'rgba(255,0,0,0.95)';
      maskCtx.fillStyle = 'rgba(255,0,0,0.95)';
    }

    if (stroke.points.length === 1) {
      const p = stroke.points[0];
      maskCtx.beginPath();
      maskCtx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      maskCtx.fill();
    } else {
      for (let i = 1; i < stroke.points.length; i += 1) {
        drawSegment(maskCtx, stroke.points[i - 1], stroke.points[i], radius);
      }
    }
    maskCtx.restore();
  };

  ToolRemove.rebuildMask = function rebuildMask(maskCtx, ops, width, height) {
    maskCtx.clearRect(0, 0, width, height);
    ops.strokes.forEach((stroke) => ToolRemove.drawStroke(maskCtx, stroke));
  };

  ToolRemove.pushStroke = function pushStroke(ops, stroke) {
    if (!stroke || !stroke.points || stroke.points.length === 0) return;
    ops.strokes.push(stroke);
    ops.redoStrokes = [];
  };

  ToolRemove.undoStroke = function undoStroke(ops) {
    if (!ops.strokes.length) return false;
    ops.redoStrokes.push(ops.strokes.pop());
    return true;
  };

  ToolRemove.redoStroke = function redoStroke(ops) {
    if (!ops.redoStrokes.length) return false;
    ops.strokes.push(ops.redoStrokes.pop());
    return true;
  };

  global.ToolRemove = ToolRemove;
})(window);
