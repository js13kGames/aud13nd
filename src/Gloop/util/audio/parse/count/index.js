// <pitch(es)>*<dividend>/<divisor><dots> -- F#3*1/4.
const PATTERN = /^(?:[A-GR#b\-0-9]+)(?:\*(\d+))?(?:\/(\d+))?([\.•]*)$/;

// beats per whole note in 4/4 time
const BPW = 4;

// modify beats by adding half of the preceding beat for every dot
const dotify = (note, i) => note + (i ? dotify(note / 2, i - 1) : 0);

// convert to integer
const int = (n) => parseInt(n, 10);

function audioParseCount(str) {
  // parse the notation
  const [ok, ...groups] = PATTERN.exec(str) || [];
  const [dividend = 1, divisor = 1, dots = ""] = groups;
  // assert input is valid
  if (!ok) {
    throw new Error(`InvalidAudioNote: ${JSON.stringify(str)}`);
  }
  // convert duration notation to beats in 4/4 time
  return dotify((int(dividend) * BPW) / int(divisor), dots.length);
}

export default audioParseCount;
