(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.terra = {})));
}(this, (function (exports) { 'use strict';

  /**
   * SceneMode Class
   * @alias SceneMode
   * @constructor
   */
  console.log('p');
  class SceneMode {
      get quadTree() {
          return this._quadTree;
      }
      move() {
          console.log("roaming the earth...");
      }
  }

  exports.SceneMode = SceneMode;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
