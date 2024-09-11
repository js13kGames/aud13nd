/**
 * VIEWPORT
 *
 * properties and methods for keeping track of overall dimensions
 */

import constants from "../../constants";

// event strings
const { VIEWPORT_RESIZE, STATE_CHANGE } = constants;

// state strings
const { VIEWPORT } = constants;

export default function plugin_viewport(options) {
  // listeners for special events
  this.on(STATE_CHANGE, ({ key, value }) => {
    if (key === VIEWPORT) {
      this.emit(VIEWPORT_RESIZE, value);
    }
  });

  // set viewport dimensions
  this.setViewport = (width, height) => {
    this.set(VIEWPORT, { w: width, h: height });
  };

  // automatically set viewport to full screen
  const fullscreen = () => {
    const { innerWidth, innerHeight } = window;
    this.setViewport(innerWidth, innerHeight);
  };
  // adjust viewport when window is resized
  window.addEventListener("orientationchange", fullscreen);
  window.addEventListener("resize", fullscreen);
  fullscreen();
}
