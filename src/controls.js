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

    // left to right
    let dx = 0;
    const width = 40;

    // top to bottom
    let dy = 0;
    const height = 30;

    // right to left
    let dxr = 0;

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
      });

      // waveform buttons
      dy = 0;
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
      });

      drawLabel({
        value: "WAVE",
        x: x + dx + 20,
        y: y + dy + props.p,
        w: width,
      });

      dx += width + width/2;
    })

    // run control
    dxr += 120;
    drawButton({
      x: x + w - dxr,
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

    // final gain
    dxr += 60;
    drawSlider({
      label: "VOLUME",
      x: x + w - dxr,
      y: y,
      w: 60,
      h: h,
      ...props,
      value: volume,
      min: 0.00001,
      max: 2,
      onChange: (v) => game.set("volume", parseFloat(v)),
    });

    // tempo
    dxr += width;
    dy = 0;
    [240, 180, 120, 60].forEach(bpm => {
      drawButton({
        x: x + w - dxr,
        y: y + dy,
        w: width,
        h: height,
        ...props,
        value: bpm,
        on: tempo == bpm,
        onChange: () => game.set("tempo", bpm),
      });
      dy += height;
    });

    drawLabel({
      value: "BPM",
      x: x + w - dxr + 20,
      y: y + dy + props.p,
      w: width,
    });

    // instrument gains
    dxr += width/2;
    ["lead","bass","kick","snare","hat"].reverse().forEach(key => {
      dxr += width;
      drawSlider({
        label: key.toUpperCase(),
        x: x + w - dxr,
        y: y,
        w: width,
        h: h,
        ...props,
        value: game.state[key].params.gain,
        min: 0.00001,
        max: 1,
        onChange: (v) => setParams(key, { gain: parseFloat(v) }),
      });
    });

    // fill the center with audio graph
    game.audio.renderAnalyzers({
      x: x + dx,
      y: y,
      w: w - dx - dxr - width/2,
      h: h,
      ...props,
      alpha: 1,
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
