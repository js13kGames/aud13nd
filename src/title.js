
// render text offscreen and return sampled pixel/pixels
const memo = new Map();

const getTitlePixels = (txt1, txt2, opts = {}) => {
  const key = JSON.stringify([txt1, txt2, opts]);
  if (!memo.has(key)) {
    const { w, h, x: sx, y: sy, fontSize=190, spacing, n, dir } = opts;
    // render text in offscreen canvas
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d");
    ctx.font = `bold ${fontSize}px Monaco, monospace`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.letterSpacing = "14px";
    ctx.lineWidth = 8;
    ctx.fillStyle = `#000000`;
    ctx.fillText(txt1, w / 2, h / 3, w);
    ctx.strokeStyle = "#000000";
    ctx.strokeText(txt1, w / 2, h / 3, w);
    ctx.fillStyle = `#FF0000`;
    ctx.fillText(txt2, w / 2, h / 3, w);
    ctx.strokeStyle = "#FF0000";
    ctx.strokeText(txt2, w / 2, h / 3, w);
    let pixels = [];
    // modify the sampled x/y pixels based on direction
    const mx = /W/.test(dir) ? spacing - n - 1 : /E/.test(dir) ? n : 0;
    const my = /N/.test(dir) ? spacing - n - 1 : /S/.test(dir) ? n : 0;
    // read image data which has four values for each pixel [r, g, b, a, ...]
    const { data, width } = ctx.getImageData(0, 0, w, h);
    // iterate over the image data, one pixel (four values) at a time
    for (let i = 0, w4 = width * 4; i < data.length; i += 4) {
      // compute the x/y coords from array index
      const x = Math.floor((i % w4) / 4);
      const y = Math.floor(i / w4);
      // only include sampled pixels
      if (x % spacing === mx && y % spacing === my) {
        // title pixel has alpha
        if (data[i + 3] > 0) {
          pixels.push({
            x: sx + x,
            y: sy + y,
            w: spacing,
            h: spacing,
            // red pixels are "on"
            on: data[i + 0] > 0,
          });
        }
      }
    }
    memo.set(key, pixels);
  }
  return memo.get(key);
};

export default getTitlePixels;
