export default function pluginLocalStore(opts = {}) {
  const game = this;
  const { name = "Gloop", initial = {}, keys=[] } = opts;
  // unique set of state keys that should be re/stored
  const lookup = new Set(["", ...keys]);
  // JSON replacer/reviver function to limit state keys
  const replacer = (key, value) => lookup.has(key) ? value : undefined;
  // read state from local storage on initialization
  try {
    game.set(JSON.parse(localStorage.getItem(name), replacer));
  } catch (ex) {
    console.log(ex);
    game.set(initial);
  }
  // write local storage on every state change
  game.on("state_change", () => {
    localStorage.setItem(name, JSON.stringify(game.get(), replacer));
  });
}
