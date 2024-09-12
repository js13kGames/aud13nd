import parseCount from "../count";
import parseTones from "../tones";

function audioParseNote(str) {
  return {
    input: str,
    tones: parseTones(str),
    count: parseCount(str),
  };
}

export default audioParseNote;
