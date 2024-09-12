function pluginFoes() {
  const game = this;

  // constants for abstract position
  const LEFT = -50;
  const WIDTH = 1000;
  const RIGHT = 1050;

  // get ratio or real screen width to fixed abstract width so that everything
  // moves consistently and fairly at different screen resolutions
  const scaleFactor = () => {
    const { cells } = game.seq;
    const first = cells[0];
    const last = cells[cells.length - 1];
    const delta = last.x + last.w - first.x;
    return delta / WIDTH;
  };

  // spawn new foes to attack selected beats
  let foes = [];
  // keep track of particles after collisions
  let sparks = [];
  let delay = null;
  const shouldSpawn = (tick) => {
    // limit concurrent foes
    if (foes.length >= config.limit) {
      return;
    }
    delay = delay ?? config.intro;
    // check delay to next spawn
    if (delay > 0) {
      delay -= tick;
      return; // don't spawn
    }
    const { getRandomRow } = game.seq;
    // pick a selected row to attack
    const row = getRandomRow("lead");
    // pick a direction
    const dir = Math.round(game.random()) ? -1 : 1;
    // enemy size
    const diameter = 20;
    // create foe
    const foe = {
      key: "lead",
      // abstract horiz starting position
      rx: dir > 0 ? LEFT : RIGHT,
      row,
      d: diameter,
      // horizontal velocity pos left-to-right, neg right-to-left
      v: config.speed * dir,
      // hold in spawn position before moving
      hold: config.hold,
      // animated particles for effects
      particles: [...Array(40).keys()].map(() => makeParticle(diameter)),
    };
    foes.push(foe);
    // emit event for sound/fx
    game.emit("foe_spawn", foe);
    // reset delay to next spawn
    delay = config.delay;
  };

  const makeParticle = (d) => {
    const { random } = game;
    // particles are just arc segments on elliptical path
    // x/y - will be the foe center location
    // w/h - will be the radiusX and radiusY
    // tilt - will be the rotation angle of the whole ellipse
    // angle - will be animated around the shape over time
    // t - how long the sparks survive after collision
    const w = random(d * 2, d / 2);
    const h = random(d, d / 2);
    const tilt = random(Math.PI, -Math.PI);
    const angle = random(Math.PI, -Math.PI);
    const hue = random(240, 420);
    const t = 0.75;
    return { w, h, tilt, angle, t, hue };
  };

  const checkCollisions = (foe) => {
    const { cells } = game.seq;
    // get real horiz position
    const pos = getPosition(foe);
    // check against each cell of that foe's row
    for (let i = 0; i < cells.length; i++) {
      const target = cells[i];
      // make sure target cell is selected and in the right row
      if (target.on !== true || target.row != foe.row) {
        continue; // skip
      }
      const left = Math.max(target.x, pos.x - pos.w / 2);
      const right = Math.min(target.x + target.w, pos.x + pos.w / 2);
      // check for overlap
      if (right - left > 0) {
        // store collision data
        foe.collision = {
          key: foe.key,
          row: target.row,
          col: target.col,
          x: pos.x,
          y: pos.y,
        };
      }
    }
  };

  // get the actual centered position of a foe
  const getPosition = ({ rx, row, d }) => {
    const { cells } = game.seq;
    // how to translate abstract to real position
    const sf = scaleFactor();
    // select the correct left/right cell to start from
    const start = cells[row];
    // real vertical position based on current row
    const y = start.y + start.h / 2;
    // real current position, scaled and offset
    const x = start.x + rx * sf;
    return { x, y, w: d, h: d };
  };

  const drawFoe = (foe) => {
    const { ctx } = game.canvas;
    const { x, y, w } = foe.x == null ? getPosition(foe) : foe;
    // draw the core
    ctx.beginPath();
    // ctx.roundRect(x, y, w, h, w);
    ctx.arc(x, y, w, 0, 2 * Math.PI, false);
    // ctx.fillStyle = `hsla(42,100%,50%,.85)`;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, w);
    gradient.addColorStop(0, "hsla(0,0%,0%,1)");
    gradient.addColorStop(0.75, "hsla(0,0%,0%,0)");
    ctx.fillStyle = gradient;
    ctx.fill();
    // ctx.lineWidth = 3;
    // ctx.strokeStyle = `hsla(27,100%,50%,.85)`;
    // ctx.stroke();
    // draw each particle orbiting core
    foe.particles.forEach((particle) => {
      particle.x = x;
      particle.y = y;
      drawParticle(particle);
    });
  };

  const drawParticle = ({ x, y, w, h, tilt, angle, t, hue }) => {
    const { ctx } = game.canvas;
    ctx.lineWidth = 2;
    ctx.strokeStyle = `hsla(${hue},100%,50%,1)`;
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, tilt, angle, angle + t);
    ctx.stroke();
  };

  const onLogic = ({ tick }) => {
    // update every foe particle
    foes.forEach((foe) => {
      foe.particles.forEach((particle) => {
        particle.angle += tick * 30;
        particle.tilt -= tick * 3;
      });
    });
    // update every spark particle
    sparks = sparks.flatMap((spark) => {
      // rotate
      spark.angle += tick * 30;
      spark.tilt -= tick * 3;
      // get bigger
      spark.w *= 1.2;
      spark.h *= 1.2;
      // decrement time
      spark.t -= tick;
      // remove it when it expires
      return spark.t > 0 ? spark : [];
    });
    // don't do anything else while paused
    if (game.state.paused) {
      return;
    }
    // decrement the countdown without emitting events
    game.state.countdown -= tick;
    // check for completion
    if (game.state.countdown <= 0) {
      game.pause();
      // expire remaining foes
      let score = game.state.levelscore;
      foes.forEach((foe) => {
        sparks.push(...foe.particles);
        score += 100;
      });
      foes = [];
      game.set("levelscore", score);
      game.emit("level_completed");
      return;
    }
    // apply motion
    foes = foes.flatMap((foe) => {
      // check collisions
      checkCollisions(foe);
      // handle impact
      if (foe.collision) {
        game.emit("foe_collision", foe.collision);
        // move the particles to sparks array to track explosion
        sparks.push(...foe.particles);
        return []; // remove it
      }
      if (foe.hold > 0) {
        foe.hold -= tick;
      } else {
        foe.rx += foe.v * tick;
      }
      // has the foe passed thru the entire row
      if (foe.v > 0 ? foe.rx > RIGHT : foe.rx < LEFT) {
        // emit event for sound/fx
        game.emit("foe_expire", foe);
        let score = game.state.levelscore;
        game.set("levelscore", score + 100);
        return []; // remove it
      }
      return foe;
    });
    // check for spawn
    shouldSpawn(tick);
  };

  const onPaint = () => {
    // draw every foe
    foes.forEach(drawFoe);
    // every explosion spark
    sparks.forEach(drawParticle);
    // do last, so overlays are top layer
    game.overlay.render();
  };

  let config = {
    // sec to play before spawns
    intro: 3,
    // sec between spawns
    delay: 1,
    // sec to hold after spawn before motion
    hold: 1,
    // most spawned foes allowed at same time
    limit: 1,
    // 0-1000 how fast the foes should move
    speed: 200,
    // sec to survive in order to pass level
    countdown: 60,
  };

  const setup = (options) => {
    foes = [];
    config = { ...config, ...options };
    game.set("levelscore", 0);
    game.set("countdown", config.countdown);
    game.on("loop_logic", onLogic);
    game.on("loop_paint", onPaint);
  };

  const teardown = () => {
    game.off("loop_logic", onLogic);
    game.off("loop_paint", onPaint);
  };

  return {
    name: "foes",
    setup,
    teardown,
    drawFoe,
    makeParticle,
  };
}

export default pluginFoes;
