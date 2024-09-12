import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import html from "./tasks/rollup-plugin-html-string.js";
// import html from "@rollup/plugin-html";

export default {
  output: {
    format: "iife",
  },
  plugins: [
    nodeResolve(),
    terser(),
    html({
      include: ["**/*.html"],
      minifier: {
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        removeComments: true,
        removeEmptyAttributes: true,
        minifyCSS: true,
        minifyJS: true,
      },
    }),
  ],
};
