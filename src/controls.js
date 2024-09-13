import getTitlePixels from "./title";

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
    const mode = game.state.scene === "sequencer" ? "jam" : "game";
    if (mode === "jam"){
      renderSeqPanel({ x, y, w, h, p, props });
    }
    if (mode === "game"){
      renderGamePanel({ x, y, w, h, p, props });
    }
    // dimensions for layout
    return { x, y, w, h: h + p };
  };

  const renderGamePanel = ({ x, y, w, h, p, props }) => {
    const { ctx } = game.canvas;

    // audio graph
    game.audio.renderAnalyzers({ x, y, w, h, ...props });

    // level - time - score
    ctx.fillStyle = `rgba(255,255,255,.75)`;
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.font = "18px monospace";
    ctx.letterSpacing = "1px";
    ctx.textRendering = "optimizeLegibility";
    const { scene, totalscore, levelscore, countdown } = game.state;
    const score = totalscore + levelscore;
    const stats = [scene, `Time ${Math.round(countdown)}`, `Score ${score}`];
    ctx.fillText(stats.join(" • "), x + w/2, y, w);

    // aud13nd
    renderTitle({ x, y, w, h });
  };

  const renderTitle = ({ x, y, w, h }) => {
    const { ctx } = game.canvas;
    ctx.textBaseline = "bottom";
    ctx.textAlign = "center";
    ctx.font = "36px monospace";
    ctx.letterSpacing = "12px";
    ctx.textRendering = "optimizeLegibility";
    ctx.fillStyle = `hsla(120,100%,50%,.3)`;
    ctx.fillText("AUD  ND", x + w/2, y + h + 7, w);
    ctx.fillStyle = `hsla(120,100%,50%,.6)`;
    ctx.fillText("   13  ", x + w/2, y + h + 7, w);
    ctx.letterSpacing = "0px";
  }

  const renderSeqPanel = ({ x, y, w, h, p, props }) => {

    const { volume, tempo } = game.state;

    let dx = 0;
    const width = 40;

    // give envelope controls for two main instruments
    ["lead","bass"].forEach(key => {

      // ADSR controls
      ["attack","decay","sustain","release"].forEach(param => {
        drawSlider({
          label: param.substring(0, 3).toUpperCase(),
          x: x + dx,
          y: y,
          w: width,
          h: h,
          ...props,
          value: game.state[key].params[param],
          min: 0.00001,
          max: 1,
          onChange: (v) => setParams(key, { [param]: parseFloat(v) }),
        });
        dx += width;
      })

      let dy = 0;
      let height = 30;

      // waveform buttons
      const { wave } = game.state[key].params;
      ["sawtooth","sine","square","triangle"].forEach(value => {
        drawButton({
          x: x + dx,
          y: y + dy,
          w: width,
          h: height,
          ...props,
          value: value.substring(0,3).toUpperCase(),
          on: wave == value,
          onChange: () => setParams(key, { wave: value }),
        });
        dy += height;
      })

      drawLabel({
        value: "WAVE",
        x: x + dx + 20,
        y: y + dy + props.p,
        w: width,
      });

      dx += width + width/2;
    })

    game.audio.renderAnalyzers({
      x: x + dx,
      y: y,
      w: w - dx - 3 * 60 - 6 * 40,
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

    // aud13nd
    renderTitle({ x, y, w, h });
  };

  return {
    name: "controls",
    render
  };
}

export default pluginControls;
