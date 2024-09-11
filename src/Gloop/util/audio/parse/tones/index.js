// <chord/pitches><duration> -- E4F#3*1/4.
const PATTERN_NOTE = /^((?:[A-GR][#b]*(?:-1|[0-9])?)+)(?:\*\d+)?(?:\/\d+)?\.*$/;
const PATTERN_PITCHES = /(?:([A-GR][#b]*)(-1|[0-9])?)/g;

// tuning standard 440 Hz
const A4 = 440;

function audioParseTones(str) {
  // parse the notation
  const [ok, pitches] = PATTERN_NOTE.exec(str) || [];
  if (!ok) {
    throw new Error(`InvalidAudioNote: ${JSON.stringify(str)}`);
  }
  const list = pitches.split(PATTERN_PITCHES);
  const output = [];
  for (let i = 1; i < list.length; i += 3) {
    const idx = PITCHES[list[i]];
    if (idx == null) {
      throw new Error(`InvalidAudioNote: ${JSON.stringify(str)}`);
    }
    const octave = parseInt(list[i + 1] || 4, 10);
    // convert pitch index number and octave to midi note number
    const midi = idx + (octave + 1) * 12;
    // convert midi note number to frequency in Hz
    const freq = idx < 0 ? 0 : A4 * Math.pow(2, (midi - 69) / 12);
    output.push(freq);
  }
  return output;
}

// midi index numbers and enharmonic equivalents for each pitch
const PITCHES = { R: -1 }; // rest
PITCHES["B#"] = PITCHES["Dbb"] = PITCHES["C"] = 0;
PITCHES["C#"] = PITCHES["B##"] = PITCHES["Db"] = 1;
PITCHES["C##"] = PITCHES["Ebb"] = PITCHES["D"] = 2;
PITCHES["D#"] = PITCHES["Fbb"] = PITCHES["Eb"] = 3;
PITCHES["Fb"] = PITCHES["D##"] = PITCHES["E"] = 4;
PITCHES["E#"] = PITCHES["Gbb"] = PITCHES["F"] = 5;
PITCHES["F#"] = PITCHES["E##"] = PITCHES["Gb"] = 6;
PITCHES["F##"] = PITCHES["Abb"] = PITCHES["G"] = 7;
PITCHES["G#"] = PITCHES["Ab"] = 8;
PITCHES["G##"] = PITCHES["Bbb"] = PITCHES["A"] = 9;
PITCHES["A#"] = PITCHES["Bb"] = 10;
PITCHES["Cb"] = PITCHES["A##"] = PITCHES["B"] = 11;

export default audioParseTones;
