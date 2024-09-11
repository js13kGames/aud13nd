/**
 * https://github.com/hyhappy/rollup-plugin-string-html/blob/master/index.js
 * The published plugin wasn't working for me, so I copied it and made some minor changes
 *
 * Support for import of html files as strings into the js file.
 */

import { createFilter } from "@rollup/pluginutils";
import { minify } from "html-minifier";

function html(opts = {}) {
  if (!opts.include) {
    opts.include = '**/*.html'
  }

  const filter = createFilter(opts.include, opts.exclude);

  return {
    name: "string-html",

    transform(code, id) {
      if (filter(id)) {
        const { minifier = {} } = opts
        if (minifier) {
          code = minify(code, {
            collapseWhitespace: true,
            removeComments: true,
            removeEmptyAttributes: true,
            minifyCSS: true,
            minifyJS: true,
            ...minifier
          })
        }
        return {
          code: `export default ${JSON.stringify(code)};`,
          map: { mappings: "" }
        };
      }
    }
  };
}

export default html;
