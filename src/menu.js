import $ from "./Gloop/util/$dom";
import getTitlePixels from "./title";

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

  let keys = "x";
  let cheat = "x38384040373937396665";
  let timer = null;
  const onKeydown = (ev) => {
    switch (ev.code) {
      case "ArrowUp":
        mousedir = "N";
        break;
      case "ArrowDown":
        mousedir = "S";
        break;
      case "ArrowLeft":
        mousedir = "W";
        break;
      case "ArrowRight":
        mousedir = "E";
        break;
    }
    clearTimeout(timer);
    timer = setTimeout(() => (keys = "x"), 800);
    keys += ev.keyCode;
    if (keys === cheat) {
      game.emit("sequencer_unlocked");
    }
  };

  // static foe to render on the title
  const foe = {
    // x/y - set onPaint
    // d/w/h - all equal
    d: 20,
    w: 20,
    h: 20,
    particles: [...Array(30).keys()].map(() => game.foes.makeParticle(20)),
  };

  let time = 0;
  const onPaint = ({ tick }) => {
    // keep track of time
    time += tick;
    // look for saved state
    const { viewport, resume, highscore, unlocked } = game.state;
    const { drawButton, drawLabel, clear } = game.canvas;

    // clear the canvas
    clear();

    // render each pixel of the title
    const pixels = getTitlePixels("AUD  ND", "   13  ", {
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
    const lastPixel = pixels[pixels.length - 1];

    // render foe
    game.foes.drawFoe({
      x: viewport.w / 2,
      y: lastPixel.y + (viewport.h / 2 + 100 - lastPixel.y + lastPixel.h) / 2,
      ...foe,
    });

    drawButton({
      name: "Start",
      x: viewport.w / 2 - 100,
      y: viewport.h / 2 + 100,
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
        y: viewport.h / 2 + 160,
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
    if (unlocked === true) {
      drawButton({
        name: "Sequencer",
        x: viewport.w / 2 - 100,
        y: viewport.h / 2 + 220,
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
        y: viewport.h / 2 + 300,
        w: 200,
        f: 16,
      });
    }
    game.overlay.render();
  };

  const setup = () => {
    game.on("loop_paint", onPaint);
    game.canvas.$canvas.on("mousemove", onMousemove);
    $(window).on("keydown", onKeydown);
    return teardown;
  };

  const teardown = () => {
    game.off("loop_paint", onPaint);
    game.canvas.$canvas.off("mousemove", onMousemove);
    $(window).off("keydown", onKeydown);
  };

  return {
    name: "menu",
    setup,
  };
}

export default pluginMenu;
