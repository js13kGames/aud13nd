function pluginMenu() {
  const game = this;

  // common layout properties
  const props = { p: 2, r: 3, s: 1, hue: 105 };

  // set the sampling direction
  let mousedir = "W";
  const compass = {
    "-180": "W",
    "-135": "NW",
    "-90": "N",
    "-45": "NE",
    0: "E",
    45: "SE",
    90: "S",
    135: "SW",
    180: "W",
  };
  // change sampling direction based on mouse position
  const onMousemove = (ev) => {
    const { viewport } = game.state;
    // get offsets from title center
    const dx = ev.offsetX - viewport.w / 2;
    const dy = ev.offsetY - viewport.h / 3;
    // convert offsets to degrees
    const deg = Math.atan2(dy, dx) * (180 / Math.PI);
    // round to 45 degrees and convert to compass direction
    mousedir = compass[Math.round(deg / 45) * 45];
  };

  // static foe to render on the title
  const foe = {
    // x/y - set onPaint
    // d/w/h - all equal
    d: 20,
    w: 20,
    h: 20,
    particles: [...Array(40).keys()].map(() => game.foes.makeParticle(20)),
  };

  let time = 0;
  const onPaint = ({ tick }) => {
    // keep track of time
    time += tick;
    // look for saved state
    const { viewport, resume, highscore } = game.state;
    const { drawButton, drawLabel, clear } = game.canvas;

    // clear the canvas
    clear();

    // render each pixel of the title
    const pixels = getTitlePixels({
      x: 50,
      y: 50,
      w: viewport.w - 100,
      h: viewport.h - 100,
      // pixel sampling gaps
      spacing: 14,
      // rotate the samples to create motion effect
      n: Math.floor(time * 10) % 14,
      // change direction based on mouse position
      dir: mousedir,
    });
    pixels.forEach((pixel) => game.canvas.drawBox({ ...props, ...pixel }));

    // update particles
    foe.particles.forEach((particle) => {
      particle.angle += tick * 30;
      particle.tilt -= tick * 3;
    });

    // take the bottom of last pixel to figure out particle position
    const lastPixel = pixels[pixels.length-1];

    // render foe
    game.foes.drawFoe({
      x: viewport.w / 2,
      y: lastPixel.y + (viewport.h / 2 - lastPixel.y + lastPixel.h) / 2,
      ...foe,
    });

    drawButton({
      name: "Start",
      x: viewport.w / 2 - 100,
      y: viewport.h / 2,
      w: 200,
      h: 60,
      f: 16,
      ...props,
      value: "Start New Game",
      on: false,
      onChange: () => {
        game.set("resume", "");
        game.set("newgame", true);
        game.set("totalscore", 0);
        game.scene.set("Level 1");
      },
    });

    // option to resume from previous completed level
    if (resume) {
      drawButton({
        name: "Resume",
        x: viewport.w / 2 - 100,
        y: viewport.h / 2 + 60,
        w: 200,
        h: 60,
        f: 16,
        ...props,
        value: `Resume ${resume}`,
        on: false,
        onChange: () => {
          game.scene.set("resume");
        },
      });
    }
    // reward to just play with the sequencer
    if (highscore >= 10000) {
      drawButton({
        name: "Sequencer",
        x: viewport.w / 2 - 100,
        y: viewport.h / 2 + 60 + 60,
        w: 200,
        h: 60,
        f: 16,
        ...props,
        value: `Play Sequencer`,
        on: false,
        onChange: () => {
          game.scene.set("sequencer");
        },
      });
    }
    if (highscore > 0) {
      drawLabel({
        value: `Highscore ${highscore}`,
        x: viewport.w / 2,
        y: viewport.h / 2 + 60 + 60 + 60 + 20,
        w: 200,
        f: 16,
      });
    }
  };

  // render text offscreen and return sampled pixel/particles
  const memo = new Map();
  const getTitlePixels = (opts = {}) => {
    const key = JSON.stringify(opts);
    if (!memo.has(key)) {
      const { w, h, x: sx, y: sy, spacing, n, dir } = opts;
      const txt1 = "AUD  ND";
      const txt2 = "   13  ";
      const size = 190;
      // render text in offscreen canvas
      const canvas = new OffscreenCanvas(w, h);
      const ctx = canvas.getContext("2d");
      ctx.font = `bold ${size}px Monaco, monospace`;
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
      let particles = [];
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
            particles.push({
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
      memo.set(key, particles);
    }
    return memo.get(key);
  };

  const setup = () => {
    game.on("loop_paint", onPaint);
    game.canvas.$canvas.on("mousemove", onMousemove);
    return teardown;
  };

  const teardown = () => {
    game.off("loop_paint", onPaint);
    game.canvas.$canvas.off("mousemove", onMousemove);
  };

  return {
    name: "menu",
    setup,
  };
}

export default pluginMenu;
