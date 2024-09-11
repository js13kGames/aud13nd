import parseSong from "./Gloop/util/audio/parse/song";
import makeRandom from "./Gloop/util/makeRandom";

function pluginSequencer() {
  const game = this;

  // on/off control of the sequencer
  let isRunning = false;

  const start = () => {
    const delay = 1;
    const { currentTime } = game.audio.ctx;
    // reset each instrument timing
    ["lead","bass","kick","snare","hat"].forEach(key => {
      const instrument = game.state[key];
      instrument.time = currentTime + delay;
      instrument.next = 0;
    });
    isRunning = true;
  };

  const stop = () => {
    isRunning = false;
  };

  // sound scheduler
  const onLogic = () => {
    if (!isRunning || game.state.paused) {
      return;
    }
    scheduleSounds(game.state.lead, game.audio.playLead);
    // scheduleSounds(game.state.bass, game.audio.playBass);
    scheduleSounds(game.state.kick, game.audio.playKick);
    scheduleSounds(game.state.snare, game.audio.playSnare);
    scheduleSounds(game.state.hat, game.audio.playHat);
  };

  const scheduleSounds = (instrument, play) => {
    const { tempo, lookAhead } = game.state.params;
    const { currentTime } = game.audio.ctx;
    let { rows, cols, notes, next, time, killed } = instrument;
    // check for upcoming notes to schedule
    while (time <= currentTime + lookAhead) {
      const duration = cols[next] * (60 / tempo);
      const tones = rows[notes[next]];
      // only make sound when column is not destroyed
      if (killed.has(next) !== true){
        tones?.forEach((frequency) => {
          play(time, frequency, duration);
        });
      }
      // move to next beat event
      time += duration;
      next = (next + 1) % cols.length;
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
    if (!isRunning) {
      return;
    }
    const { clear, drawContainer } = game.canvas;
    const { viewport } = game.state;

    // clear the canvas
    clear();

    const { padding=100 } = layout;

    game.audio.renderAnalyzers({
      x: 0,
      y: 0,
      ...viewport,
      ...props,
      s: 2,
      alpha: .75
    });

    // draw bounding box
    const container = drawContainer({
      x: 0,
      y: 0,
      w: viewport.w,
      h: viewport.h,
      p: 100,
      r: 25,
    });
    if ( layout.stats !== false){
      renderStats({
        x: viewport.w/2,
        y: container.y + container.h - 60,
        w: container.w,
        h: 50,
        p: 0,
      });
    }

    const ctrlHeight = 120 + padding + padding;
    const controls = (
      layout.controls !== true ?
      { x:0, y:0, w:0, h:0 } :
      game.controls.render({
        x: container.x,
        y: container.y + container.h - ctrlHeight,
        w: container.w,
        h: ctrlHeight,
        p: padding,
        props
      })
    );

    // reset grid cells
    cells = game.seq.cells = [];


    const percHeight = 60;
    const kick = (
      layout.kick !== true ?
      { x:0, y:0, w:0, h:0 } :
      renderInstrumentGrid("kick", {
        x: container.x,
        y: controls.y - 3 * percHeight - padding,
        w: container.w,
        h: percHeight,
        p: 10
      })
    );
    const snare = (
      layout.snare !== true ?
      { x:0, y:0, w:0, h:0 } :
      renderInstrumentGrid("snare", {
        x: container.x,
        y: controls.y - 2 * percHeight - padding,
        w: container.w,
        h: percHeight,
        p: 10
      })
    );
    const hat = (
      layout.hat !== true ?
      { x:0, y:0, w:0, h:0 } :
      renderInstrumentGrid("hat", {
        x: container.x,
        y: controls.y - 1 * percHeight - padding,
        w: container.w,
        h: percHeight,
        p: 10
      })
    );

    const grid = renderInstrumentGrid("lead", {
      x: container.x,
      y: container.y,
      w: container.w,
      h: container.h - controls.h - kick.h - snare.h - hat.h - padding,
      p: padding
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
    const stats = [scene, `Time ${Math.round(countdown)}`, `Score ${score}` ];
    ctx.fillText(stats.join(" • "), x, y, w);
  };

  // render the layout grid of a single instrument
  const renderInstrumentGrid = (key, { x, y, w, h, p }) => {
    // offset dimensions by padding
    x += p;
    y += p;
    w -= p + p;
    h -= p + p;
    const { ctx, drawBox } = game.canvas;
    const { rows, cols, duration, notes, next, killed } = game.state[key];
    // current cell dimensions
    const beatWidth = w / duration;
    // const cellWidth = w / beats.length;
    const cellHeight = h / rows.length;
    const len = cols.length;
    const beat = (next + len - 1) % len;
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
          curr: beat === col
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
  const loadSong = (key, song) => {
    let duration = 0;
    let cols = [];
    let rows = [];
    let lookup = {};
    let notes = [];
    // everything empty unless the song exists
    if (song){
      // split and parse each not of the song
      parseSong(song).forEach(({ count, tones, input }) => {
        // notes converted to count of beats
        cols.push(count);
        duration += count;
        // strip duration off the input, for lookup
        const note = input.replace(/(?:\*\d+)?(?:\/\d+)?\.*$/g,"");
        // not in lookup yet
        if (lookup[note] == null){
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
      next: 0,
      // audio clock to play the next note
      time: 0,
      // keep track of which cols have been hit
      killed: new Map()
    });
  };

  // update the selected "notes" for an instrument
  const setSelected = (key, row, col) => {
    let { notes, rows } = game.state[key];
    if (rows[row] !== null) {
      notes[col] = row;
    }
  };

  // params are used to configure the audio components
  game.set("params", {});
  let random = makeRandom();
  const setParams = (...args) => {
    const params = game.get("params");
    // set default values
    if (args.length === 0) {
      game.set("params", {
        // beats per minute
        tempo: 120,
        // secs ahead to schedule audio
        lookAhead: 0.05,
        // amplitude
        volume: 1,
        // waveform
        wave: "sawtooth",
        // envelope
        attack: 0.25,
        decay: 0.25,
        sustain: 0.8,
        release: 0.5,
        // gains
        note: 0.5,
        kick: 0.5,
        snare: 0.5,
        hat: 0.5
      });
    }
    // merge in passed object
    else if (args.length === 1) {
      game.set("params", { ...params, ...args[0] });
    }
    // set a param value
    else {
      let [key, val] = args;
      game.set("params", { ...params, [key]: val });
    }
  };

  const onCollision = ({ key, col }) => {
    const { cols, killed } = game.state[key];
    killed.set(col, true);
    if (killed.size >= cols.length){
      // level failed
      game.pause();
      game.emit("level_failed");
    }
  };

  // score bonus points for instrument columns not destroyed
  const getBonusCount = (key="lead") => {
    const { cols, killed } = game.state[key];
    return cols.length - killed.size;
  };

  const getRandomRow = (key="lead") => {
    const { notes, killed } = game.state[key];
    let row = null;
    do {
      // target selected to prevent overloading only few rows
      const col = Math.floor(random(notes.length));
      // skip if the col is destroyed
      if (killed.has(col) !== true){
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
      game.on("clock_resume", start);
      game.on("loop_paint", onPaint);
      game.on("foe_collision", onCollision);
      setParams();
      // initialize instruments
      loadSong("lead","R/1");
      loadSong("bass","R/1");
      loadSong("kick","R/1");
      loadSong("snare","R/1");
      loadSong("hat","R/1");
    },
    teardown: () => {
      // unbind game event handlers
      game.off("loop_logic", onLogic);
      game.off("clock_resume", start);
      game.off("loop_paint", onPaint);
      game.off("foe_collision", onCollision);
    },
    start,
    stop,
    setSelected,
    setParams,
    cells,
    getRandomRow,
    getBonusCount,
    random,
    loadSong
  };
}

export default pluginSequencer;
