(function (global) {
  const RemoveApi = {};

  async function blurMaskedArea(imageBlob, maskBlob) {
    const image = await global.ImageCore.loadImageFromBlob(imageBlob);
    const mask = await global.ImageCore.loadImageFromBlob(maskBlob);

    const base = global.ImageCore.drawToCanvas(image, image.width, image.height);
    const maskCanvas = global.ImageCore.drawToCanvas(mask, image.width, image.height);
    const ctx = base.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');

    const src = ctx.getImageData(0, 0, base.width, base.height);
    const out = ctx.createImageData(base.width, base.height);
    const maskData = maskCtx.getImageData(0, 0, base.width, base.height).data;
    const data = src.data;
    const outData = out.data;
    const width = base.width;
    const height = base.height;
    const radius = 6;

    function idx(x, y) {
      return (y * width + x) * 4;
    }

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = idx(x, y);
        if (maskData[i + 3] < 20) {
          outData[i] = data[i];
          outData[i + 1] = data[i + 1];
          outData[i + 2] = data[i + 2];
          outData[i + 3] = data[i + 3];
          continue;
        }

        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;
        for (let yy = Math.max(0, y - radius); yy <= Math.min(height - 1, y + radius); yy += 1) {
          for (let xx = Math.max(0, x - radius); xx <= Math.min(width - 1, x + radius); xx += 1) {
            const ii = idx(xx, yy);
            r += data[ii];
            g += data[ii + 1];
            b += data[ii + 2];
            count += 1;
          }
        }

        outData[i] = Math.round(r / count);
        outData[i + 1] = Math.round(g / count);
        outData[i + 2] = Math.round(b / count);
        outData[i + 3] = data[i + 3];
      }
    }

    ctx.putImageData(out, 0, 0);
    return global.ImageCore.canvasToBlob(base, 'image/png');
  }

  RemoveApi.removeObject = async function removeObject(input) {
    const endpoint = input.endpoint || '/api/remove';
    const forceMock = Boolean(input.forceMock);
    if (!input.imageBlob || !input.maskBlob) {
      throw new Error('removeObject requires imageBlob and maskBlob.');
    }

    if (!forceMock) {
      try {
        const form = new FormData();
        form.append('image', input.imageBlob, 'image.png');
        form.append('mask', input.maskBlob, 'mask.png');
        form.append('params', JSON.stringify(input.params || {}));

        const res = await fetch(endpoint, {
          method: 'POST',
          body: form
        });

        if (res.ok) {
          const type = res.headers.get('content-type') || '';
          if (type.includes('application/json')) {
            const payload = await res.json();
            if (payload && payload.url) {
              const imageRes = await fetch(payload.url);
              if (!imageRes.ok) throw new Error('Failed to fetch remove result url.');
              return imageRes.blob();
            }
          }
          if (type.startsWith('image/')) {
            return res.blob();
          }
        }
      } catch (_err) {
        // fallback to mock below
      }
    }

    return blurMaskedArea(input.imageBlob, input.maskBlob);
  };

  global.RemoveApi = RemoveApi;
})(window);
