import parseSong from "./Gloop/util/audio/parse/song";

function pluginSequencer() {
  const game = this;

  const instruments = ["lead", "bass", "kick", "snare", "hat"];

  const onStart = () => {
    // reset each instrument timing
    instruments.forEach((key) => {
      const instrument = game.state[key];
      instrument.time = game.audio.ctx.currentTime;
      instrument.next = -1;
    });
  };

  // sound scheduler
  const onLogic = () => {
    if (game.state.paused) {
      return;
    }
    scheduleSounds(game.state.lead, game.audio.playLead);
    scheduleSounds(game.state.bass, game.audio.playBass);
    scheduleSounds(game.state.kick, game.audio.playKick);
    scheduleSounds(game.state.snare, game.audio.playSnare);
    scheduleSounds(game.state.hat, game.audio.playHat);
  };

  const LOOKAHEAD = 0.05; // 50 ms
  const scheduleSounds = (instrument, play) => {
    const { tempo } = game.state;
    const { currentTime } = game.audio.ctx;
    let { rows, cols, notes, next, time, killed, params } = instrument;
    // check for upcoming notes to schedule
    while (time <= currentTime + LOOKAHEAD) {
      // next starts at -1
      const n = next % cols.length;
      const duration = next < 0 ? 0.5 : cols[n] * (60 / tempo);
      const tones = next < 0 ? [0] : rows[notes[n]];
      // only make sound when column is not destroyed
      if (next > -1 && killed.has(n) !== true) {
        tones?.forEach((frequency) => {
          play(time, frequency, duration, params);
        });
      }
      // move to next beat event
      time += duration;
      next += 1;
    }
    instrument.time = time;
    instrument.next = next;
  };

  // keep track of the location of rendered cells
  let cells = [];

  // common layout properties
  const props = { p: 2, r: 4, s: 2, hue: 105 };

  // draw the sequencer grid
  const onPaint = () => {
    const { clear, drawContainer } = game.canvas;
    const { viewport } = game.state;

    // clear the canvas
    clear();

    const { padding = 50 } = layout;

    game.audio.renderAnalyzers({
      x: 0,
      y: 0,
      ...viewport,
      ...props,
      s: 2,
      alpha: 0.75,
    });

    // draw bounding box
    const container = drawContainer({
      x: 0,
      y: 0,
      w: viewport.w,
      h: viewport.h,
      p: padding,
      r: 25,
    });
    if (layout.stats !== false) {
      renderStats({
        x: viewport.w / 2,
        y: container.y + container.h - 60,
        w: container.w,
        h: 50,
        p: 0,
      });
    }

    const ctrlHeight = 120 + padding + padding;
    const controls =
      layout.controls !== true
        ? { x: 0, y: 0, w: 0, h: 0 }
        : game.controls.render({
            x: container.x,
            y: container.y + container.h - ctrlHeight,
            w: container.w,
            h: ctrlHeight,
            p: padding,
            props,
          });

    // reset grid cells
    cells = game.seq.cells = [];

    // figure out the ideal row height based on all defined instruments
    let totalRows = 0;
    let totalGaps = 0;
    instruments.forEach((key) => {
      const { rows } = game.state[key];
      totalRows += rows.length;
      totalGaps += rows.length ? padding : 0;
    });
    const totalHeight = container.h - controls.h - totalGaps - padding;
    const rowHeight = totalHeight / totalRows;
    // keep track of layout coords moving through instruments
    let offsetY = container.y + padding;
    let height = 0;
    // layout each instrument
    instruments.forEach((key) => {
      height = rowHeight * game.state[key].rows.length;
      renderInstrumentGrid(key, {
        x: container.x,
        y: offsetY,
        w: container.w,
        h: height,
        p: padding,
      });
      offsetY += height ? height + padding : 0;
    });
  };

  const renderStats = ({ x, y, w, h, p }) => {
    // offset dimensions by padding
    x += p;
    y += p;
    w -= p + p;
    h -= p + p;
    const { ctx } = game.canvas;
    ctx.fillStyle = `rgba(255,255,255,.75)`;
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.font = "18px monospace";
    ctx.letterSpacing = "1px";
    ctx.textRendering = "optimizeLegibility";
    const { scene, totalscore, levelscore, countdown } = game.state;
    const score = totalscore + levelscore;
    const stats = [scene, `Time ${Math.round(countdown)}`, `Score ${score}`];
    ctx.fillText(stats.join(" • "), x, y, w);
  };

  // render the layout grid of a single instrument
  const renderInstrumentGrid = (key, { x, y, w, h, p }) => {
    // early exit when not visible
    if (h === 0) {
      return;
    }
    // offset horizontal dimensions by padding
    x += p;
    w -= p + p;
    const { ctx, drawBox } = game.canvas;
    const { rows, cols, duration, notes, next, killed } = game.state[key];
    // current cell dimensions
    const beatWidth = w / duration;
    // const cellWidth = w / beats.length;
    const cellHeight = h / rows.length;
    const len = cols.length;
    // current beat is the one before next
    const beat = next < 1 ? 0 : (next - 1) % len;
    // draw every column
    for (let col = 0, dx = 0; col < cols.length; col++) {
      let cellWidth = cols[col] * beatWidth;
      // fill in whole column of current beat
      if (beat === col) {
        ctx.fillStyle = "rgba(255,255,255,.75)";
        ctx.fillRect(x + dx, y + h + props.p, cellWidth, 10);
      }
      // column note index
      const note = notes[col] % rows.length;
      // draw every row
      for (let row = 0; row < rows.length; row++) {
        const dy = row * cellHeight;
        const cell = {
          key,
          row,
          col,
          x: x + dx,
          y: y + dy,
          w: cellWidth,
          h: cellHeight,
          ...props,
          on: false,
          dead: killed.has(col),
          curr: beat === col,
        };
        // track for clicks and collisions
        cells.push(cell);
        // draw un/selected grid cell
        cell.on = note === row && !cell.dead;
        drawBox(cell);
      }

      dx += cellWidth;
    }
    // dimensions for layout
    return { x, y, w, h: h + p };
  };

  // set up notes and beats for an instrument [key]
  const loadSong = (key, song, params = {}) => {
    let duration = 0;
    let cols = [];
    let rows = [];
    let lookup = {};
    let notes = [];
    // everything empty unless the song exists
    if (song) {
      // split and parse each not of the song
      parseSong(song).forEach(({ count, tones, input }) => {
        // notes converted to count of beats
        cols.push(count);
        duration += count;
        // strip duration off the input, for lookup
        const note = input.replace(/(?:\*\d+)?(?:\/\d+)?\.*$/g, "");
        // not in lookup yet
        if (lookup[note] == null) {
          lookup[note] = rows.push(tones) - 1;
        }
        notes.push(lookup[note]);
      });
    }
    // store the instrument config in state, silently
    game.set(key, {
      // type of instrument
      key,
      // beats in each column
      cols,
      // sum of all beats
      duration,
      // note frequencies in each row
      rows,
      // selected row index for each column
      notes,
      // index number of the next beat to play
      next: -1,
      // audio clock to play the next note
      time: 0,
      // keep track of which cols have been hit
      killed: new Map(),
      // optional audio parameters
      params: { ...defaults[key], ...params },
    });
  };

  // update the selected "notes" for an instrument
  const setSelected = (key, row, col) => {
    let { notes, rows } = game.state[key];
    if (rows[row] !== null) {
      notes[col] = row;
    }
  };

  // default params for each instrument
  const defaults = {
    lead: {
      gain: 0.5,
      wave: "sine",
      attack: 0.25,
      decay: 0.25,
      sustain: 0.8,
      release: 0.5,
    },
    bass: {
      gain: 0.5,
      wave: "sawtooth",
      attack: 0.1,
      decay: 0.25,
      sustain: 0.8,
      release: 0.75,
    },
    kick: {
      gain: 0.5,
    },
    snare: {
      gain: 0.5,
    },
    hat: {
      gain: 0.5,
    },
  };

  // final controls
  game.set("volume", 1);
  game.set("tempo", 120);

  // params are used to configure the audio components
  const setParams = (key, params) => {
    const instrument = game.state[key];
    Object.assign(instrument.params, params);
    game.set(key, { ...instrument });
  };

  const onCollision = ({ key, col }) => {
    const { cols, killed } = game.state[key];
    killed.set(col, true);
    if (killed.size >= cols.length) {
      // level failed
      game.pause();
      game.emit("level_failed");
    }
  };

  // score bonus points for instrument columns not destroyed
  const getBonusCount = (key = "lead") => {
    const { cols, killed } = game.state[key];
    return cols.length - killed.size;
  };

  const getRandomRow = (key = "lead") => {
    const { notes, killed } = game.state[key];
    let row = null;
    do {
      // target selected to prevent overloading only few rows
      const col = Math.floor(game.random(notes.length));
      // skip if the col is destroyed
      if (killed.has(col) !== true) {
        row = notes[col];
      }
      // until a valid row is found
    } while (row == null);
    return row;
  };

  let layout = {};
  return {
    name: "seq",
    setup: (features) => {
      // set layout
      layout = { ...features };
      // bind game event handlers
      game.on("loop_logic", onLogic);
      game.on("clock_resume", onStart);
      game.on("loop_paint", onPaint);
      game.on("foe_collision", onCollision);
      // initialize instruments
      loadSong("lead", "C D E F G A B C");
      loadSong("bass", "");
      loadSong("kick", "");
      loadSong("snare", "");
      loadSong("hat", "");
    },
    teardown: () => {
      // unbind game event handlers
      game.off("loop_logic", onLogic);
      game.off("clock_resume", onStart);
      game.off("loop_paint", onPaint);
      game.off("foe_collision", onCollision);
    },
    setSelected,
    setParams,
    cells,
    getRandomRow,
    getBonusCount,
    loadSong,
  };
}

export default pluginSequencer;
