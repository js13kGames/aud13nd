import Gloop from "./Gloop/Gloop";
import debug from "./Gloop/plugin/debug";
import localStore from "./Gloop/plugin/localStore";
import pauseWhenHidden from "./Gloop/plugin/pauseWhenHidden";
import scene from "./Gloop/plugin/scene";
import viewport from "./Gloop/plugin/viewport";
import makeRandom from "./Gloop/util/makeRandom";
import audio from "./audio";
import canvas from "./canvas";
import controls from "./controls";
import foes from "./foes";
import menu from "./menu";
import overlay from "./overlay";
import sequencer from "./sequencer";
import songs from "./songs";

// primary game instance, with extensions
const game = new Gloop();
game.plugin(debug);
game.plugin(localStore, {
  name: "AUD13ND",
  keys: ["resume", "highscore", "totalscore", "unlocked"],
  initial: { resume: "", highscore: 0, totalscore: 0, unlocked: false },
});
game.plugin(pauseWhenHidden);
game.plugin(scene);
game.plugin(viewport);
// pseudo random numbers when seeded
game.random = makeRandom();
// local game plugins
game.plugin(audio);
game.plugin(canvas);
game.plugin(sequencer);
game.plugin(foes);
game.plugin(menu);
game.plugin(overlay);
game.plugin(controls);

game.scene.create("mainmenu", game.menu.setup);

game.scene.create("sequencer", () => {
  game.seq.setup({
    controls: true,
    stats: false,
  });
  game.seq.loadSong("lead", "");
  game.seq.loadSong("bass", songs.we_will_rock_bass);
  game.seq.loadSong("kick", songs.we_will_rock_kick);
  game.seq.loadSong("snare", songs.we_will_rock_snare);
  game.seq.loadSong("hat", "");
  return () => {
    game.seq.teardown();
  };
});

game.scene.create("resume", () => {
  game.scene.set(game.get("resume") || "mainmenu");
});

game.scene.create("Level 1", () => {
  game.seq.setup();
  game.foes.setup({
    limit: 1,
    speed: 110,
    countdown: 10,
  });
  game.set("tempo", 120);
  game.seq.loadSong("lead", songs.chords1);
  game.set("nextLevel", "Level 2");
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 2", () => {
  game.seq.setup();
  game.foes.setup({
    limit: 1,
    speed: 120,
    countdown: 20,
  });
  game.set("tempo", 120);
  game.seq.loadSong("lead", songs.twinkle, {
    wave: "sine",
    attack: 0.1,
    decay: 0.1,
    sustain: 0.9,
    release: 0.25,
  });
  game.set("nextLevel", "Level 3");
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 3", () => {
  game.seq.setup();
  game.foes.setup({
    limit: 2,
    speed: 120,
    countdown: 30,
  });
  game.set("tempo", 120);
  game.seq.loadSong("lead", songs.cmajor, {
    wave: "square",
    attack: 0.1,
    decay: 0.1,
    sustain: 0.9,
    release: 0.25,
  });
  game.set("nextLevel", "Level 4");
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 4", () => {
  game.seq.setup();
  game.foes.setup({
    limit: 2,
    speed: 130,
    countdown: 40,
  });
  game.set("tempo", 120);
  game.seq.loadSong("lead", songs.fur_elise);
  game.set("nextLevel", "Level 5");
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 5", () => {
  game.seq.setup();
  game.foes.setup({
    limit: 2,
    speed: 140,
    countdown: 50,
  });
  game.set("tempo", 120);
  game.seq.loadSong("lead", songs.chords2);
  game.seq.loadSong("kick", songs.kick4s);
  game.set("nextLevel", "Level 6");
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 6", () => {
  game.seq.setup();
  game.foes.setup({
    limit: 3,
    speed: 140,
    countdown: 60,
  });
  game.set("tempo", 120);
  game.seq.loadSong("lead", songs.we_will_rock_bass);
  game.seq.loadSong("kick", songs.we_will_rock_kick);
  game.seq.loadSong("snare", songs.we_will_rock_snare);
  game.set("nextLevel", "Level 7");
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 7", () => {
  game.seq.setup();
  game.foes.setup({
    limit: 3,
    speed: 150,
    countdown: 70,
  });
  game.set("tempo", 120);
  game.seq.loadSong("bass", songs.seven_nation);
  game.seq.loadSong("kick", songs.kick4s);
  game.set("nextLevel", "Level 8");
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 8", () => {
  game.seq.setup();
  game.foes.setup({
    limit: 4,
    speed: 150,
    countdown: 80,
  });
  game.set("tempo", 120);
  game.seq.loadSong("lead", songs.mario, {
    wave: "square",
    attack: 0.1,
    decay: 0.1,
    sustain: 0.9,
    release: 0.25,
  });
  game.set("nextLevel", "Level 9");
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 9", () => {
  game.seq.setup();
  game.foes.setup({
    limit: 4,
    speed: 150,
    countdown: 90,
  });
  game.set("tempo", 80);
  game.seq.loadSong("lead", songs.karma_lead, {
    wave: "sine",
    release: 0.9,
    decay: 0.5,
    gain: 0.5,
  });
  game.seq.loadSong("bass", songs.karma_acc, {
    wave: "sine",
    release: 0.8,
    decay: 0.4,
    gain: 0.5,
  });
  game.set("nextLevel", "Level 10");
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 10", () => {
  game.seq.setup();
  game.foes.setup({
    limit: 4,
    speed: 160,
    countdown: 100,
  });
  game.set("tempo", 160);
  game.seq.loadSong("bass", songs.lev10_bass, {
    wave: "sine",
    attack: 0.1,
    decay: 0.75,
    sustain: 0.9,
    release: 0.95,
    gain: 0.5,
  });
  game.seq.loadSong("hat", songs.lev10_hat, { gain: 1 });
  game.set("nextLevel", "Level 11");
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 11", () => {
  game.seq.setup();
  game.foes.setup({
    limit: 5,
    speed: 160,
    countdown: 110,
  });
  game.set("tempo", 120);
  game.seq.loadSong("bass", songs.lev11_bass);
  game.seq.loadSong("kick", songs.lev11_kick);
  game.set("nextLevel", "Level 12");
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 12", () => {
  game.seq.setup();
  game.foes.setup({
    limit: 5,
    speed: 160,
    countdown: 120,
  });
  game.set("tempo", 120);
  game.seq.loadSong("lead", songs.lev12_lead, {});
  game.seq.loadSong("snare", songs.lev12_snare, {});
  game.set("nextLevel", "Level 13");
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 13", () => {
  game.seq.setup();
  game.foes.setup({
    limit: 5,
    speed: 600,
    countdown: 130,
  });
  game.set("tempo", 160);
  // game.seq.loadSong("lead", songs.lev13_lead);
  game.seq.loadSong("bass", songs.lev13_bass);
  game.seq.loadSong("kick", songs.lev13_kick);
  game.seq.loadSong("snare", songs.lev13_snare);
  game.seq.loadSong("hat", songs.lev13_hat);
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

// run it
game.scene.set("mainmenu");
game.start();
game.pause();
