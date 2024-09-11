import parseCount from "./index";

describe("audio/parse/count", () => {
  test.each([
    ["R", 4, "whole"],
    ["R.", 6, "dotted whole"],
    ["R..", 7, "double dotted whole"],
    ["R/1", 4, "whole"],
    ["R*1/1", 4, "whole"],
    ["R/2", 2, "half"],
    ["R/4", 1, "quarter"],
    ["R/8", 0.5, "eighth"],
    ["R/8.", 0.75, "dotted eighth"],
    ["R*3/16", 0.75, "dotted eighth"],
    ["R/16", 0.25, "sixteenth"],
    ["R/32", 0.125, "thirty-second"],
    ["R/64", 0.0625, "sixty-fourth"],
    ["R*2", 8, "two whole"],
    ["R*2/1", 8, "two whole"],
    ["R*2/3", 2.66667, "two-thirds"],
  ])("input '%s' should be %s beats (%s)", (input, beats) => {
    const count = parseCount(input);
    expect(count).toBeCloseTo(beats);
  });
});
