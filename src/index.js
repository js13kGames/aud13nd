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
  keys: ["resume", "highscore", "totalscore"],
  initial: { resume: "", highscore: 0, totalscore:0 }
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
    kick: true,
    snare: true,
    hat: true,
    stats: false,
    padding: 50
  });
  game.seq.loadSong("lead", songs.chords);
  game.seq.loadSong("kick","C7/4 D7/4 E7/4 F7/4 G7/4 A7/4 B7/4");
  game.seq.loadSong("snare","C7/4 D7/4 E7/4 F7/4 G7/4 A7/4 B7/4");
  game.seq.loadSong("hat","C7/4 D7/4 E7/4 F7/4 G7/4 A7/4 B7/4");
  // scene teardown
  return () => {
    game.seq.teardown();
  };
});

game.scene.create("resume", () => {
  game.scene.set(game.get("resume") || "mainmenu");
});

game.scene.create("Level 1", () => {
  game.set("nextLevel", "Level 2");
  game.seq.setup();
  game.foes.setup({
    intro: 2,
    delay: 2,
    hold: 2,
    limit: 1,
    speed: 100,
    countdown: 20
  });

  game.seq.loadSong("lead", songs.twinkle, {
    wave: "sine",
    attack: 0.1,
    decay: 0.1,
    sustain: 0.9,
    release: 0.25,
  });

  // game.seq.loadSong("kick",`
  //   E3/4 E3/4 E3/4 E3/4
  //   E3/4 E3/4 E3/4 E3/4
  // `);

  // scene teardown
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 2", () => {
  game.set("nextLevel", "Level 3");
  game.seq.setup();
  game.foes.setup({
    intro: 4,
    delay: 2,
    hold: 2,
    limit: 1,
    speed: 100,
    countdown: 30
  });
  game.seq.loadSong("lead", songs.cmajor,{
    // waveform
    wave: "sine",
    // envelope
    attack: 0.1,
    decay: 0.1,
    sustain: 0.9,
    release: 0.25,
  });
  // scene teardown
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 3", () => {
  game.set("nextLevel", "Level 4");
  game.seq.setup();
  game.foes.setup({
    intro: 4,
    delay: 2,
    hold: 2,
    limit: 2,
    speed: 150,
    countdown: 45
  });
  game.seq.loadSong("lead", songs.cmajor, {
    // waveform
    wave: "square",
    // envelope
    attack: 0.1,
    decay: 0.1,
    sustain: 0.9,
    release: 0.25,
  });
  // scene teardown
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 4", () => {
  game.set("nextLevel", "Level 5");
  game.seq.setup();
  game.foes.setup({
    intro: 20,
    delay: 2,
    hold: 2,
    limit: 2,
    speed: 150,
    countdown: 45
  });
  game.seq.loadSong("lead", songs.mario, {
    // waveform
    wave: "square",
    // envelope
    attack: 0.1,
    decay: 0.1,
    sustain: 0.9,
    release: 0.25,
  });
  // game.seq.loadSong("kick",`
  //   E3/4 E3/4 E3/4 E3/4
  //   E3/4 E3/4 E3/4 E3/4
  // `);
  // scene teardown
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 5", () => {
  game.set("nextLevel", "Level 6");
  game.seq.setup();
  game.foes.setup();
  // game.seq.setParams();
  // game.seq.setNotes();
  // game.seq.setBeats();
  // game.seq.setSelected();
  // scene teardown
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 6", () => {
  game.set("nextLevel", "Level 7");
  game.seq.setup();
  game.foes.setup();
  // game.seq.setParams();
  // game.seq.setNotes();
  // game.seq.setBeats();
  // game.seq.setSelected();
  // scene teardown
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 7", () => {
  game.set("nextLevel", "Level 8");
  game.seq.setup();
  game.foes.setup();
  // game.seq.setParams();
  // game.seq.setNotes();
  // game.seq.setBeats();
  // game.seq.setSelected();
  // scene teardown
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 8", () => {
  game.set("nextLevel", "Level 9");
  game.seq.setup();
  game.foes.setup();
  // game.seq.setParams();
  // game.seq.setNotes();
  // game.seq.setBeats();
  // game.seq.setSelected();
  // scene teardown
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 9", () => {
  game.set("nextLevel", "Level 10");
  game.seq.setup();
  game.foes.setup();
  // game.seq.setParams();
  // game.seq.setNotes();
  // game.seq.setBeats();
  // game.seq.setSelected();
  // scene teardown
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 10", () => {
  game.set("nextLevel", "Level 11");
  game.seq.setup();
  game.foes.setup();
  // game.seq.setParams();
  // game.seq.setNotes();
  // game.seq.setBeats();
  // game.seq.setSelected();
  // scene teardown
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 11", () => {
  game.set("nextLevel", "Level 12");
  game.seq.setup();
  game.foes.setup();
  // game.seq.setParams();
  // game.seq.setNotes();
  // game.seq.setBeats();
  // game.seq.setSelected();
  // scene teardown
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 12", () => {
  game.set("nextLevel", "Level 13");
  game.seq.setup();
  game.foes.setup();
  // game.seq.setParams();
  // game.seq.setNotes();
  // game.seq.setBeats();
  // game.seq.setSelected();
  // scene teardown
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

game.scene.create("Level 13", () => {
  game.seq.setup();
  game.foes.setup();
  // game.seq.setParams();
  // game.seq.setNotes();
  // game.seq.setBeats();
  // game.seq.setSelected();
  // scene teardown
  return () => {
    game.seq.teardown();
    game.foes.teardown();
  };
});

// run it
game.scene.set("mainmenu");
game.start();
game.pause();


/* chords *
"Ab4C5Eb5","Bb4Db5F5","Eb4G4Bb4Db5","F4Ab4C5",
"Ab3C4Eb4","Bb3Db4F4","Eb3G3Bb3Db4","F3Ab3C4",
*/

