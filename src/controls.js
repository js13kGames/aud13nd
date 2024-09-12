// sequencer controls to show/modify audio params
function pluginControls() {
  const game = this;

  const { drawSlider, drawButton, drawLabel } = game.canvas;
  const { setParams } = game.seq;

  const render = ({ x, y, w, h, p, props }) => {
    // offset dimensions by padding
    x += p;
    y += p;
    w -= p + p;
    h -= p + p;

    const key = "lead";
    const { volume, tempo } = game.state;
    const instrument = game.state[key];
    const { attack, decay, sustain, release, wave } = instrument.params;

    // draw controls
    drawSlider({
      label: "ATT",
      x: x + 0 * 40,
      y: y,
      w: 40,
      h: h,
      ...props,
      value: attack,
      min: 0.00001,
      max: 1,
      onChange: (v) => setParams(key, { attack: parseFloat(v) }),
    });

    drawSlider({
      label: "DEC",
      x: x + 1 * 40,
      y: y,
      w: 40,
      h: h,
      ...props,
      value: decay,
      min: 0.00001,
      max: 1,
      onChange: (v) => setParams(key, { decay: parseFloat(v) }),
    });

    drawSlider({
      label: "SUS",
      x: x + 2 * 40,
      y: y,
      w: 40,
      h: h,
      ...props,
      value: sustain,
      min: 0.00001,
      max: 1,
      onChange: (v) => setParams(key, { sustain: parseFloat(v) }),
    });

    drawSlider({
      label: "REL",
      x: x + 3 * 40,
      y: y,
      w: 40,
      h: h,
      ...props,
      value: release,
      min: 0.00001,
      max: 1,
      onChange: (v) => setParams(key, { release: parseFloat(v) }),
    });

    drawButton({
      x: x + 4 * 40,
      y: y,
      w: 40,
      h: 30,
      ...props,
      value: "SAW",
      on: wave == "sawtooth",
      onChange: () => setParams(key, { wave: "sawtooth" }),
    });

    drawButton({
      x: x + 4 * 40,
      y: y + 30,
      w: 40,
      h: 30,
      ...props,
      value: "SIN",
      on: wave == "sine",
      onChange: () => setParams(key, { wave: "sine" }),
    });

    drawButton({
      x: x + 4 * 40,
      y: y + 60,
      w: 40,
      h: 30,
      ...props,
      value: "SQU",
      on: wave == "square",
      onChange: () => setParams(key, { wave: "square" }),
    });

    drawButton({
      x: x + 4 * 40,
      y: y + 90,
      w: 40,
      h: 30,
      ...props,
      value: "TRI",
      on: wave == "triangle",
      onChange: () => setParams(key, { wave: "triangle" }),
    });

    drawLabel({
      value: "WAVE",
      x: x + 4 * 40 + 20,
      y: y + 120 + props.p,
      w: 40,
    });

    game.audio.renderAnalyzers({
      x: x + 5 * 40,
      y: y,
      w: w - 5 * 40 - 3 * 60 - 6 * 40,
      h: h,
      ...props,
      alpha: 1,
    });

    drawSlider({
      label: "LEAD",
      x: x + w - 3 * 60 - 6 * 40,
      y: y,
      w: 40,
      h: h,
      ...props,
      value: game.state.lead.params.gain,
      min: 0.00001,
      max: 1,
      onChange: (v) => setParams("lead", { gain: parseFloat(v) }),
    });

    drawSlider({
      label: "BASS",
      x: x + w - 3 * 60 - 5 * 40,
      y: y,
      w: 40,
      h: h,
      ...props,
      value: game.state.bass.params.gain,
      min: 0.00001,
      max: 1,
      onChange: (v) => setParams("bass", { gain: parseFloat(v) }),
    });

    drawSlider({
      label: "KICK",
      x: x + w - 3 * 60 - 4 * 40,
      y: y,
      w: 40,
      h: h,
      ...props,
      value: game.state.kick.params.gain,
      min: 0.00001,
      max: 1,
      onChange: (v) => setParams("kick", { gain: parseFloat(v) }),
    });

    drawSlider({
      label: "SNARE",
      x: x + w - 3 * 60 - 3 * 40,
      y: y,
      w: 40,
      h: h,
      ...props,
      value: game.state.snare.params.gain,
      min: 0.00001,
      max: 1,
      onChange: (v) => setParams("snare", { gain: parseFloat(v) }),
    });

    drawSlider({
      label: "HATS",
      x: x + w - 3 * 60 - 2 * 40,
      y: y,
      w: 40,
      h: h,
      ...props,
      value: game.state.hat.params.gain,
      min: 0.00001,
      max: 1,
      onChange: (v) => setParams("hat", { gain: parseFloat(v) }),
    });

    drawButton({
      x: x + w - 3 * 60 - 1 * 40,
      y: y,
      w: 40,
      h: 30,
      ...props,
      value: "240",
      on: tempo == 240,
      onChange: () => game.set("tempo", 240),
    });

    drawButton({
      x: x + w - 3 * 60 - 1 * 40,
      y: y + 30,
      w: 40,
      h: 30,
      ...props,
      value: "180",
      on: tempo == 180,
      onChange: () => game.set("tempo", 180),
    });

    drawButton({
      x: x + w - 3 * 60 - 1 * 40,
      y: y + 60,
      w: 40,
      h: 30,
      ...props,
      value: "120",
      on: tempo == 120,
      onChange: () => game.set("tempo", 120),
    });

    drawButton({
      x: x + w - 3 * 60 - 1 * 40,
      y: y + 90,
      w: 40,
      h: 30,
      ...props,
      value: "60",
      on: tempo == 60,
      onChange: () => game.set("tempo", 60),
    });

    drawLabel({
      value: "BPM",
      x: x + w - 3 * 60 - 1 * 40 + 20,
      y: y + 120 + props.p,
      w: 40,
    });

    drawSlider({
      label: "VOLUME",
      x: x + w - 3 * 60,
      y: y,
      w: 60,
      h: h,
      ...props,
      value: volume,
      min: 0.00001,
      max: 2,
      onChange: (v) => game.set("volume", parseFloat(v)),
    });

    drawButton({
      x: x + w - 2 * 60,
      y: y,
      w: 120,
      h: 120,
      f: 16,
      ...props,
      value: game.state.paused ? "PLAY" : "PAUSE",
      on: !game.state.paused,
      onChange: () => {
        if (game.state.paused) {
          game.resume();
        } else {
          game.pause();
        }
      },
    });
    // dimensions for layout
    return { x, y, w, h: h + p };
  };

  return {
    name: "controls",
    render,
  };
}

export default pluginControls;
