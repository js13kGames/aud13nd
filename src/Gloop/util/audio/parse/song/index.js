import parseNote from "../note";

function audioParseSong (input){
  return input
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map(parseNote);
}

export default audioParseSong;
