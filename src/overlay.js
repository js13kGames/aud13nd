// show informational overlay message
function pluginOverlay() {
  const game = this;
  let title = null;
  let messages = [];
  let buttonText = null;
  let onChange = null;

  // common layout properties
  const props = { p: 2, r: 3, s: 1, hue: 105 };

  game.on("clock_resume", () => {
    game.set("overlayVisible", false);
  });

  game.on("scene_enter", ({ name }) => {
    if (game.get("newgame") === true) {
      game.set("overlayVisible", true);
      title = "How to Play";
      messages = [
        "Click or drag around the grid to select",
        "a note (row) for each beat (column). Enjoy",
        "the sounds and avoid obstacles to survive.",
      ];
      buttonText = "Let's Go!";
      onChange = () => {
        game.set("newgame", false);
        game.resume();
      };
    } else if (/^Level/.test(name)) {
      game.set("overlayVisible", true);
      title = name;
      messages = [];
      buttonText = "Begin";
      onChange = () => game.resume();
    }
  });

  game.on("level_failed", () => {
    game.set("overlayVisible", true);
    title = "Level Failed";
    messages = [];
    buttonText = "Try Again";
    onChange = () => game.scene.set("resume");
  });

  game.on("level_completed", () => {
    const { scene, nextLevel } = game.state;
    game.set("overlayVisible", true);
    // update total score
    const { totalscore, levelscore, highscore } = game.state;
    const bonus = game.seq.getBonusCount() * 50;
    const score = totalscore + levelscore + bonus;
    game.set("totalscore", score);
    game.set("levelscore", 0);
    title = `${scene} Complete`;
    messages = [`Level +${levelscore}`, `Bonus +${bonus}`, `Total ${score}`];

    // update high score
    if (score > highscore) {
      messages.push("New High Score!");
      game.set("highscore", score);
    }
    game.set("resume", nextLevel);
    buttonText = `Next: ${nextLevel}`;
    onChange = () => game.scene.set(nextLevel);
  });

  game.on("sequencer_unlocked", () => {
    game.set("overlayVisible", true);
    game.set("unlocked", true);
    title = "Amazing Work!";
    messages = [
      "You unlocked the sequencer!",
      "Have fun making music..."
    ];
    buttonText = "Play Sequencer";
    onChange = () => {
      game.scene.set("sequencer");
    }
  });

  const render = () => {
    if (game.get("overlayVisible") === true) {
      const { ctx, drawButton } = game.canvas;
      const { viewport } = game.state;
      // layout dimensions
      const w = 500;
      const h = 400;
      const x = viewport.w / 2 - w / 2;
      const y = viewport.h / 2 - h / 2;
      // gradient fill
      ctx.globalAlpha = 1;
      const gradient = ctx.createLinearGradient(x, y, w, h);
      gradient.addColorStop(0, "rgba(21,23,27,.75)");
      gradient.addColorStop(1, "rgba(29,30,34,.75)");
      ctx.fillStyle = gradient;
      // shadow
      ctx.shadowColor = "rgba(0,0,0,.75)";
      ctx.shadowBlur = 25;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 12.5;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 25);
      ctx.fill();
      ctx.shadowColor = null;
      ctx.shadowBlur = null;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      // title text
      ctx.fillStyle = `rgba(255,255,255,.75)`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.font = `24px monospace`;
      ctx.fillText(title, x + w / 2, y + h / 4, w);
      ctx.font = `14px monospace`;
      messages.forEach((line, n) => {
        ctx.fillText(line, x + w / 2, y + h / 2 + n * 20, w);
      });
      drawButton({
        x: x + w / 2 - 100,
        y: y + (h * 3) / 4,
        w: 200,
        h: 60,
        f: 16,
        ...props,
        value: buttonText,
        on: false,
        onChange,
      });
    }
  };

  return {
    name: "overlay",
    render,
  };
}

export default pluginOverlay;
