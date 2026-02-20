(function (global) {
  const RemoveEngine = {};

  async function yieldToBrowser() {
    if (typeof requestAnimationFrame === 'function') {
      await new Promise((resolve) => requestAnimationFrame(() => resolve()));
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  function dilateMaskData(maskData, width, height, radius) {
    if (!radius || radius <= 0) return maskData;
    const out = new Uint8Array(maskData.length);
    const r = Math.max(1, Math.round(radius));
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const idx = y * width + x;
        if (!maskData[idx]) continue;
        for (let ny = Math.max(0, y - r); ny <= Math.min(height - 1, y + r); ny += 1) {
          for (let nx = Math.max(0, x - r); nx <= Math.min(width - 1, x + r); nx += 1) {
            const dx = nx - x;
            const dy = ny - y;
            if (dx * dx + dy * dy > r * r) continue;
            out[ny * width + nx] = 1;
          }
        }
      }
    }
    return out;
  }

  function blurRegionFromSource(src, width, height, minX, minY, maxX, maxY) {
    const regionW = maxX - minX + 1;
    const regionH = maxY - minY + 1;
    const size = regionW * regionH;
    const blurR = new Float32Array(size);
    const blurG = new Float32Array(size);
    const blurB = new Float32Array(size);
    const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        let rs = 0;
        let gs = 0;
        let bs = 0;
        let ws = 0;
        let k = 0;
        for (let ny = Math.max(0, y - 1); ny <= Math.min(height - 1, y + 1); ny += 1) {
          for (let nx = Math.max(0, x - 1); nx <= Math.min(width - 1, x + 1); nx += 1) {
            const w = kernel[k++];
            const base = (ny * width + nx) * 4;
            rs += src[base] * w;
            gs += src[base + 1] * w;
            bs += src[base + 2] * w;
            ws += w;
          }
        }
        const li = (y - minY) * regionW + (x - minX);
        blurR[li] = rs / ws;
        blurG[li] = gs / ws;
        blurB[li] = bs / ws;
      }
    }
    return { blurR, blurG, blurB, regionW, regionH };
  }

  function buildNearestBoundaryMap(workMask, width, height, minX, minY, maxX, maxY) {
    const regionW = maxX - minX + 1;
    const regionH = maxY - minY + 1;
    const regionSize = regionW * regionH;
    const nearest = new Int32Array(regionSize);
    nearest.fill(-1);
    const dist = new Int16Array(regionSize);
    dist.fill(-1);
    const qX = new Int32Array(regionSize);
    const qY = new Int32Array(regionSize);
    let head = 0;
    let tail = 0;

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const idx = y * width + x;
        if (workMask[idx]) continue;
        const li = (y - minY) * regionW + (x - minX);
        nearest[li] = li;
        dist[li] = 0;
        qX[tail] = x;
        qY[tail] = y;
        tail += 1;
      }
    }

    while (head < tail) {
      const x = qX[head];
      const y = qY[head];
      head += 1;
      const li = (y - minY) * regionW + (x - minX);
      const sourceLi = nearest[li];
      const neighbors = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1]
      ];
      for (const [nx, ny] of neighbors) {
        if (nx < minX || nx > maxX || ny < minY || ny > maxY) continue;
        const nLi = (ny - minY) * regionW + (nx - minX);
        if (nearest[nLi] !== -1) continue;
        nearest[nLi] = sourceLi;
        dist[nLi] = dist[li] + 1;
        qX[tail] = nx;
        qY[tail] = ny;
        tail += 1;
      }
    }

    return { nearest, dist, regionW, regionH };
  }

  function buildSeamMask(workMask, maskData, width, height, minX, minY, maxX, maxY) {
    const seam = new Uint8Array(workMask.length);
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const idx = y * width + x;
        if (!workMask[idx]) continue;
        if (!maskData[idx]) {
          seam[idx] = 1;
          continue;
        }
        const neighbors = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1]
        ];
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const nIdx = ny * width + nx;
          if (!workMask[nIdx]) {
            seam[idx] = 1;
            break;
          }
        }
      }
    }
    return seam;
  }

  async function applyTextureTransfer(out, src, workMask, width, height, minX, minY, maxX, maxY, detailGain = 0.8) {
    const { blurR, blurG, blurB, regionW } = blurRegionFromSource(src, width, height, minX, minY, maxX, maxY);
    const { nearest, dist } = buildNearestBoundaryMap(workMask, width, height, minX, minY, maxX, maxY);

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const idx = y * width + x;
        if (!workMask[idx]) continue;
        const li = (y - minY) * regionW + (x - minX);
        const nearestLi = nearest[li];
        if (nearestLi < 0) continue;
        const nearestX = (nearestLi % regionW) + minX;
        const nearestY = Math.floor(nearestLi / regionW) + minY;
        const nearestBase = (nearestY * width + nearestX) * 4;
        const detailR = src[nearestBase] - blurR[nearestLi];
        const detailG = src[nearestBase + 1] - blurG[nearestLi];
        const detailB = src[nearestBase + 2] - blurB[nearestLi];

        const d = Math.max(0, dist[li]);
        const adaptiveGain = detailGain * (0.95 - Math.min(0.35, d * 0.025));
        const base = idx * 4;
        out[base] = Math.max(0, Math.min(255, Math.round(out[base] + detailR * adaptiveGain)));
        out[base + 1] = Math.max(0, Math.min(255, Math.round(out[base + 1] + detailG * adaptiveGain)));
        out[base + 2] = Math.max(0, Math.min(255, Math.round(out[base + 2] + detailB * adaptiveGain)));
      }
      if (y % 24 === 0) await yieldToBrowser();
    }
  }

  async function applyAIGenerativeFill(out, src, maskData, workMask, width, height, minX, minY, maxX, maxY, strength = 0.88) {
    const { nearest, dist, regionW } = buildNearestBoundaryMap(workMask, width, height, minX, minY, maxX, maxY);

    const boundaryPool = [];
    let lumSum = 0;
    let lumSqSum = 0;
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const idx = y * width + x;
        if (workMask[idx]) continue;
        const neighbors = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1]
        ];
        let touchesMask = false;
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          if (workMask[ny * width + nx]) {
            touchesMask = true;
            break;
          }
        }
        if (!touchesMask) continue;
        boundaryPool.push([x, y]);
        const b = idx * 4;
        const lum = src[b] * 0.299 + src[b + 1] * 0.587 + src[b + 2] * 0.114;
        lumSum += lum;
        lumSqSum += lum * lum;
      }
    }

    const count = Math.max(1, boundaryPool.length);
    const lumMean = lumSum / count;
    const lumVar = Math.max(0, lumSqSum / count - lumMean * lumMean);
    const noiseScale = Math.min(10, Math.sqrt(lumVar) * 0.18);

    let centerX = 0;
    let centerY = 0;
    let centerCount = 0;
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const idx = y * width + x;
        if (!maskData[idx]) continue;
        centerX += x;
        centerY += y;
        centerCount += 1;
      }
    }
    centerX = centerCount ? centerX / centerCount : (minX + maxX) * 0.5;
    centerY = centerCount ? centerY / centerCount : (minY + maxY) * 0.5;

    const passes = Math.max(6, Math.min(9, Math.round(3 + strength * 7)));
    for (let pass = 0; pass < passes; pass += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          const idx = y * width + x;
          if (!workMask[idx]) continue;
          const li = (y - minY) * regionW + (x - minX);
          const nearestLi = nearest[li];
          if (nearestLi < 0) continue;

          const nearestX = (nearestLi % regionW) + minX;
          const nearestY = Math.floor(nearestLi / regionW) + minY;
          const nBase = (nearestY * width + nearestX) * 4;

          const mirrorX = Math.max(0, Math.min(width - 1, Math.round(centerX - (x - centerX))));
          const mirrorY = Math.max(0, Math.min(height - 1, Math.round(centerY - (y - centerY))));
          const mIdx = mirrorY * width + mirrorX;
          const mBase = (!workMask[mIdx] ? mIdx : nearestY * width + nearestX) * 4;

          const picked = boundaryPool.length
            ? boundaryPool[(x * 73 + y * 151 + pass * 977) % boundaryPool.length]
            : [nearestX, nearestY];
          const rx = picked[0];
          const ry = picked[1];
          const rBase = (ry * width + rx) * 4;

          const d = Math.max(0, dist[li]);
          const depthBoost = Math.min(0.38, d * 0.024);
          const alpha = Math.min(0.97, strength + depthBoost);

          const targetR = src[nBase] * 0.6 + src[mBase] * 0.15 + src[rBase] * 0.25;
          const targetG = src[nBase + 1] * 0.6 + src[mBase + 1] * 0.15 + src[rBase + 1] * 0.25;
          const targetB = src[nBase + 2] * 0.6 + src[mBase + 2] * 0.15 + src[rBase + 2] * 0.25;

          const jitter = noiseScale * (0.42 / (pass + 1));
          const j = () => (Math.random() * 2 - 1) * jitter;
          const base = idx * 4;
          out[base] = Math.max(0, Math.min(255, Math.round(out[base] * (1 - alpha) + (targetR + j()) * alpha)));
          out[base + 1] = Math.max(0, Math.min(255, Math.round(out[base + 1] * (1 - alpha) + (targetG + j()) * alpha)));
          out[base + 2] = Math.max(0, Math.min(255, Math.round(out[base + 2] * (1 - alpha) + (targetB + j()) * alpha)));
        }
        if (y % 24 === 0) await yieldToBrowser();
      }
    }
  }

  async function applyAggressiveCrispFill(out, src, maskData, workMask, width, height, minX, minY, maxX, maxY) {
    const { nearest, regionW } = buildNearestBoundaryMap(workMask, width, height, minX, minY, maxX, maxY);
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const idx = y * width + x;
        if (!workMask[idx]) continue;
        const li = (y - minY) * regionW + (x - minX);
        const nearestLi = nearest[li];
        if (nearestLi < 0) continue;
        const nearestX = (nearestLi % regionW) + minX;
        const nearestY = Math.floor(nearestLi / regionW) + minY;
        const srcBase = (nearestY * width + nearestX) * 4;
        const base = idx * 4;
        const alpha = maskData[idx] ? 0.96 : 0.72;
        out[base] = Math.round(out[base] * (1 - alpha) + src[srcBase] * alpha);
        out[base + 1] = Math.round(out[base + 1] * (1 - alpha) + src[srcBase + 1] * alpha);
        out[base + 2] = Math.round(out[base + 2] * (1 - alpha) + src[srcBase + 2] * alpha);
      }
      if (y % 24 === 0) await yieldToBrowser();
    }
  }

  async function smoothMaskedRegion(out, maskData, width, height, minX, minY, maxX, maxY, passes) {
    const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];
    for (let pass = 0; pass < passes; pass += 1) {
      const src = new Uint8ClampedArray(out);
      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          const idx = y * width + x;
          if (!maskData[idx]) continue;
          let rs = 0;
          let gs = 0;
          let bs = 0;
          let ws = 0;
          let k = 0;
          for (let ny = Math.max(0, y - 1); ny <= Math.min(height - 1, y + 1); ny += 1) {
            for (let nx = Math.max(0, x - 1); nx <= Math.min(width - 1, x + 1); nx += 1) {
              const w = kernel[k++];
              const b = (ny * width + nx) * 4;
              rs += src[b] * w;
              gs += src[b + 1] * w;
              bs += src[b + 2] * w;
              ws += w;
            }
          }
          const base = idx * 4;
          out[base] = Math.round(rs / ws);
          out[base + 1] = Math.round(gs / ws);
          out[base + 2] = Math.round(bs / ws);
        }
        if (y % 24 === 0) await yieldToBrowser();
      }
    }
  }

  async function featherSeamTowardBoundary(out, src, workMask, width, height, minX, minY, maxX, maxY) {
    const seam = buildSeamMask(workMask, workMask, width, height, minX, minY, maxX, maxY);
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const idx = y * width + x;
        if (!seam[idx]) continue;
        let rs = 0;
        let gs = 0;
        let bs = 0;
        let count = 0;
        const neighbors = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1]
        ];
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const nIdx = ny * width + nx;
          if (workMask[nIdx]) continue;
          const nBase = nIdx * 4;
          rs += src[nBase];
          gs += src[nBase + 1];
          bs += src[nBase + 2];
          count += 1;
        }
        if (!count) continue;
        const base = idx * 4;
        const alpha = 0.38;
        const br = rs / count;
        const bg = gs / count;
        const bb = bs / count;
        out[base] = Math.round(out[base] * (1 - alpha) + br * alpha);
        out[base + 1] = Math.round(out[base + 1] * (1 - alpha) + bg * alpha);
        out[base + 2] = Math.round(out[base + 2] * (1 - alpha) + bb * alpha);
      }
      if (y % 24 === 0) await yieldToBrowser();
    }
  }

  function estimateBoundaryVariance(src, workMask, width, height, minX, minY, maxX, maxY) {
    let sum = 0;
    let sumSq = 0;
    let count = 0;
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const idx = y * width + x;
        if (workMask[idx]) continue;
        const neighbors = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1]
        ];
        let touchesMask = false;
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          if (workMask[ny * width + nx]) {
            touchesMask = true;
            break;
          }
        }
        if (!touchesMask) continue;
        const base = idx * 4;
        const lum = src[base] * 0.299 + src[base + 1] * 0.587 + src[base + 2] * 0.114;
        sum += lum;
        sumSq += lum * lum;
        count += 1;
      }
    }
    if (!count) return 0;
    const mean = sum / count;
    return Math.max(0, sumSq / count - mean * mean);
  }

  async function inpaintMaskedImage(sourceImageData, maskData, options = {}) {
    const width = sourceImageData.width;
    const height = sourceImageData.height;
    const src = sourceImageData.data;
    const algorithm =
      options.algorithm === 'aggressive'
        ? 'aggressive'
        : options.algorithm === 'ai'
          ? 'ai'
          : options.algorithm === 'texture'
            ? 'texture'
            : 'natural';
    const brushSize = Number(options.brushSize) || 28;
    const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;
    const dilateRadius =
      algorithm === 'aggressive'
        ? Math.max(4, Math.min(14, Math.round(brushSize / 9)))
        : algorithm === 'ai'
          ? Math.max(4, Math.min(12, Math.round(brushSize / 10)))
          : algorithm === 'texture'
            ? Math.max(2, Math.min(8, Math.round(brushSize / 14)))
            : 0;
    const workMask = dilateRadius > 0 ? dilateMaskData(maskData, width, height, dilateRadius) : maskData;
    const out = new Uint8ClampedArray(src);
    const total = width * height;
    const known = new Uint8Array(total);

    let unknownCount = 0;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const idx = y * width + x;
        if (workMask[idx] > 0) {
          unknownCount += 1;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        } else {
          known[idx] = 1;
        }
      }
    }

    if (unknownCount === 0) return new ImageData(out, width, height);

    const pad = 2;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(width - 1, maxX + pad);
    maxY = Math.min(height - 1, maxY + pad);
    const regionW = maxX - minX + 1;
    const regionH = maxY - minY + 1;

    const rA = new Float32Array(total);
    const gA = new Float32Array(total);
    const bA = new Float32Array(total);
    const rB = new Float32Array(total);
    const gB = new Float32Array(total);
    const bB = new Float32Array(total);

    for (let i = 0; i < total; i += 1) {
      const base = i * 4;
      rA[i] = src[base];
      gA[i] = src[base + 1];
      bA[i] = src[base + 2];
    }

    const seedPasses = algorithm === 'aggressive' ? 16 : algorithm === 'ai' ? 18 : algorithm === 'texture' ? 12 : 10;
    for (let pass = 0; pass < seedPasses; pass += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          const idx = y * width + x;
          if (known[idx]) continue;
          let rs = 0;
          let gs = 0;
          let bs = 0;
          let count = 0;
          for (let ny = Math.max(0, y - 1); ny <= Math.min(height - 1, y + 1); ny += 1) {
            for (let nx = Math.max(0, x - 1); nx <= Math.min(width - 1, x + 1); nx += 1) {
              const nIdx = ny * width + nx;
              if (!known[nIdx]) continue;
              rs += rA[nIdx];
              gs += gA[nIdx];
              bs += bA[nIdx];
              count += 1;
            }
          }
          if (count > 0) {
            rB[idx] = rs / count;
            gB[idx] = gs / count;
            bB[idx] = bs / count;
          } else {
            rB[idx] = rA[idx];
            gB[idx] = gA[idx];
            bB[idx] = bA[idx];
          }
        }
      }
      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          const idx = y * width + x;
          if (known[idx]) continue;
          rA[idx] = rB[idx];
          gA[idx] = gB[idx];
          bA[idx] = bB[idx];
        }
      }
      await yieldToBrowser();
    }

    const iterations =
      algorithm === 'aggressive'
        ? Math.max(80, Math.min(420, Math.round(Math.max(regionW, regionH) * 1.1)))
        : algorithm === 'ai'
          ? Math.max(120, Math.min(560, Math.round(Math.max(regionW, regionH) * 1.25)))
          : algorithm === 'texture'
            ? Math.max(70, Math.min(320, Math.round(Math.max(regionW, regionH) * 0.9)))
            : Math.max(50, Math.min(260, Math.round(Math.max(regionW, regionH) * 0.75)));

    for (let iter = 0; iter < iterations; iter += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          const idx = y * width + x;
          if (known[idx]) {
            rB[idx] = rA[idx];
            gB[idx] = gA[idx];
            bB[idx] = bA[idx];
            continue;
          }

          const l = y * width + Math.max(0, x - 1);
          const r = y * width + Math.min(width - 1, x + 1);
          const u = Math.max(0, y - 1) * width + x;
          const d = Math.min(height - 1, y + 1) * width + x;

          rB[idx] = (rA[l] + rA[r] + rA[u] + rA[d]) * 0.25;
          gB[idx] = (gA[l] + gA[r] + gA[u] + gA[d]) * 0.25;
          bB[idx] = (bA[l] + bA[r] + bA[u] + bA[d]) * 0.25;
        }
      }

      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          const idx = y * width + x;
          if (known[idx]) continue;
          rA[idx] = rB[idx];
          gA[idx] = gB[idx];
          bA[idx] = bB[idx];
        }
      }

      if (typeof onProgress === 'function') {
        onProgress((iter + 1) / iterations);
      }
      if (iter % 6 === 0) {
        await yieldToBrowser();
      }
    }

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const idx = y * width + x;
        if (known[idx]) continue;
        const base = idx * 4;
        out[base] = Math.max(0, Math.min(255, Math.round(rA[idx])));
        out[base + 1] = Math.max(0, Math.min(255, Math.round(gA[idx])));
        out[base + 2] = Math.max(0, Math.min(255, Math.round(bA[idx])));
      }
    }

    if (algorithm === 'aggressive') {
      await applyAggressiveCrispFill(out, src, maskData, workMask, width, height, minX, minY, maxX, maxY);
      const seamMask = buildSeamMask(workMask, maskData, width, height, minX, minY, maxX, maxY);
      await smoothMaskedRegion(out, seamMask, width, height, minX, minY, maxX, maxY, 1);
    } else if (algorithm === 'ai') {
      await applyAIGenerativeFill(out, src, maskData, workMask, width, height, minX, minY, maxX, maxY, 0.88);
      await applyAIGenerativeFill(out, src, maskData, workMask, width, height, minX, minY, maxX, maxY, 0.58);
      const boundaryVar = estimateBoundaryVariance(src, workMask, width, height, minX, minY, maxX, maxY);
      if (boundaryVar < 260) {
        await smoothMaskedRegion(out, maskData, width, height, minX, minY, maxX, maxY, 3);
        const seamMaskSoft = buildSeamMask(workMask, maskData, width, height, minX, minY, maxX, maxY);
        await smoothMaskedRegion(out, seamMaskSoft, width, height, minX, minY, maxX, maxY, 2);
      } else {
        await applyTextureTransfer(out, src, workMask, width, height, minX, minY, maxX, maxY, 0.68);
        await applyTextureTransfer(out, src, workMask, width, height, minX, minY, maxX, maxY, 0.44);
        await applyTextureTransfer(out, src, workMask, width, height, minX, minY, maxX, maxY, 0.24);
      }
      const seamMask = buildSeamMask(workMask, maskData, width, height, minX, minY, maxX, maxY);
      await smoothMaskedRegion(out, seamMask, width, height, minX, minY, maxX, maxY, 2);
      await featherSeamTowardBoundary(out, src, workMask, width, height, minX, minY, maxX, maxY);
      await featherSeamTowardBoundary(out, src, workMask, width, height, minX, minY, maxX, maxY);
    } else if (algorithm === 'texture') {
      await applyTextureTransfer(out, src, workMask, width, height, minX, minY, maxX, maxY, 0.72);
      await applyTextureTransfer(out, src, workMask, width, height, minX, minY, maxX, maxY, 0.42);
      const seamMask = buildSeamMask(workMask, maskData, width, height, minX, minY, maxX, maxY);
      await smoothMaskedRegion(out, seamMask, width, height, minX, minY, maxX, maxY, 1);
    } else {
      await smoothMaskedRegion(out, maskData, width, height, minX, minY, maxX, maxY, 2);
      await featherSeamTowardBoundary(out, src, workMask, width, height, minX, minY, maxX, maxY);
    }

    if (typeof onProgress === 'function') onProgress(1);
    return new ImageData(out, width, height);
  }

  RemoveEngine.inpaintMaskedImage = inpaintMaskedImage;
  global.RemoveEngine = RemoveEngine;
})(window);
