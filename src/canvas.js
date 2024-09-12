import $ from "./Gloop/util/$dom";

function pluginCanvas() {
  const game = this;

  // create/insert the canvas element
  const canvas = document.createElement("canvas");
  const $canvas = $(canvas).appendTo(document.body);

  // canvas drawing context
  const ctx = canvas.getContext("2d");

  // detect clicks
  $canvas.on("click", ev => {
    const { offsetX, offsetY } = ev;
    // check buttons
    buttons.forEach(button => {
      const { x, y, w, h, onChange } = button;
      if (offsetX > x && offsetX < x + w){
        if (offsetY > y && offsetY < y + h){
          onChange();
          return;
        }
      }
    });
    // block interactions
    if (!game.state.overlayVisible){
      // check grid cells
      game.seq.cells.forEach(cell => {
        const { key, row, col, x, y, w, h } = cell;
        if (offsetX > x && offsetX < x + w){
          if (offsetY > y && offsetY < y + h){
            game.seq.setSelected(key, row, col);
            return;
          }
        }
      });
    }

  });

  // detect mouse dragging
  const dragging = {};
  $canvas.on("mousedown", ev => {
    // block interactions
    if (game.state.overlayVisible){
      return;
    }
    const { offsetX, offsetY } = ev;
    // check grid cells
    game.seq.cells.forEach(cell => {
      const { key, x, y, w, h } = cell;
      if (offsetX > x && offsetX < x + w){
        if (offsetY > y && offsetY < y + h){
          dragging.type = `cell/${key}`;
          dragging.target = cell;
          return;
        }
      }
    });
    // check sliders
    sliders.forEach(slider => {
      const { x, y, w, h } = slider;
      if (offsetX > x && offsetX < x + w){
        if (offsetY > y && offsetY < y + h){
          dragging.type = "slider";
          dragging.target = slider;
          return;
        }
      }
    });
  });

  $canvas.on("mousemove", ev => {
    const { offsetX, offsetY } = ev;
    // select each dragged over grid cell
    if (dragging.type?.indexOf("cell") === 0){
      game.seq.cells.forEach(cell => {
        const { key, row, col, x, y, w, h } = cell;
        if (offsetX > x && offsetX < x + w){
          if (offsetY > y && offsetY < y + h){
            game.seq.setSelected(key, row, col);
            return;
          }
        }
      });
    }
    // move the active slider up/down
    if (dragging.type === "slider"){
      const { y, h, min, max, onChange } = dragging.target;
      let pct = 1 - Math.min(1, Math.max(0, (offsetY - y) / h));
      let value = pct * (max - min) + min;
      onChange(value);
    }
  });

  $canvas.on("mouseup", ev => {
    dragging.type = null;
    dragging.target = null;
  });

  // todo: detect touch dragging

  // resize canvas when screen is resized
  game.on("viewport_resize", ({ w, h }) => {
    canvas.width = w;
    canvas.height = h;
  });

  const clear = () => {
    const { w, h } = game.state.viewport;
    ctx.clearRect(0, 0, w, h);
    // empty interactive target positions
    sliders = [];
    buttons = [];
  };

  const drawContainer = ({ x, y, w, h, r=10, c1, c2, p=50 }) => {
    // offset dimensions by padding
    x += p;
    y += p;
    w -= p + p;
    h -= p + p;
    // gradient fill
    const gradient = ctx.createLinearGradient(x+w/2, y, x+w/2, h);
    gradient.addColorStop(0, c1 ?? "rgba(40,46,51,.95)");
    gradient.addColorStop(1, c2 ?? "rgba(29,30,34,.95)");
    ctx.fillStyle = gradient;
    // stroke
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#494C52";
    // shadow
    // ctx.shadowColor = "rgba(0,0,0,.5)";
    // ctx.shadowBlur = 25;
    // ctx.shadowOffsetX = 2.5;
    // ctx.shadowOffsetY = 12.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.stroke();
    ctx.fill();
    // remove shadow
    ctx.shadowColor = null;
    ctx.shadowBlur = null;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    // dimensions for layout
    return { x, y, w, h };
  };

  let sliders = [];
  const drawSlider = (config={}) => {
    let { label, x, y, w, h, value, min, max, p, r, s, hue, sat, lum } = config;
    sliders.push(config);
    drawBox({ x, y, w, h, p, r, s, hue, sat, lum });
    // label below
    drawLabel({ value: label, x: x + w/2, y: y + h + p, w });
    // convert the value to y distance
    h -= 10;
    let v = h - h * ((value - min) / (max - min));
    drawBox({
      x,
      y: y + v,
      w,
      h: 10,
      p,
      r: 1,
      s,
      hue,
      sat,
      lum,
      on: true
    });
  }

  let buttons = [];
  const drawButton = (config={}) => {
    let { x, y, w, h, value, on, p, r, s, hue, sat, lum, f=8 } = config;
    buttons.push(config);
    drawBox({ x, y, w, h, on, p, r, s, hue, sat, lum });
    ctx.fillStyle = on === true ? `rgba(0,0,0,.75)` : `rgba(255,255,255,.75)`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = `${f}px monospace`;
    ctx.fillText(value, x + w / 2, y + 2 + h / 2, w);
  }

  const drawLabel = ({ value, x, y, w, f=9 }) => {
    ctx.fillStyle = `rgba(255,255,255,.75)`;
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.font = `${f}px monospace`;
    ctx.letterSpacing = "1px";
    ctx.textRendering = "optimizeLegibility";
    ctx.fillText(value, x, y, w);
  };

  // generic drawing of rounded box element
  const drawBox = (config={}) => {
    let {
      x, // num | horiz pos
      y, // num | vert pos
      w, // num | width
      h, // num | height
      p=2, // num | padding
      r=4, // num | corder radius
      s=1, // num | stroke width
      hue=120, // num | 0-360 color hue
      sat=100, // num | 0-100 color saturation
      lum=50, // num | 0-100 color luminosity
      on, // bool | on/off
      dead, // bool | has it been destroyed
      curr, // bool | in the current beat
    } = config;
    // styles/colors
    let fill, stroke;
    if (dead === true){ // destroyed
      fill = `hsla(${hue},0%,${lum}%,.15)`;
      stroke = `hsla(${hue},0%,${lum}%,.3)`;
    }
    else if (on === true){ // selected
      fill = `hsla(${hue},${sat}%,${lum}%,.75)`;
      stroke = `hsla(${hue},${sat}%,${lum}%,.9)`;
    }
    else if (curr === true){ // current beat
      fill = `hsla(${hue},${sat}%,${lum}%,.35)`;
      stroke = `hsla(${hue},${sat}%,${lum}%,.5)`;
    }
    else { // unselected
      fill = `hsla(${hue},${sat}%,${lum}%,.15)`;
      stroke = `hsla(${hue},${sat}%,${lum}%,.3)`;
    }

    // let alpha = on === true ? .85 : .15;
    // let sat = dead === true ? "10%" : "100%";
    // let lum = curr === true ? "75%" : "50%";
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(x + p, y + p, w - p - p, h - p - p, r ?? 4);
    ctx.fill();
    ctx.lineWidth = s ?? 1;
    // alpha = on === true ? 1 : .25;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }

  return {
    name: "canvas",
    ctx,
    $canvas,
    // backgrounds
    clear,
    drawContainer,
    // layout
    drawBox,
    drawLabel,
    // controls
    drawSlider,
    drawButton,
  }
}

export default pluginCanvas;
