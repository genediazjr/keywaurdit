/*!
 * keywaurdit stopwords preset
 * https://github.com/letsblumit/keywaurdit
 *
 * Copyright 2014, LetsBlumIt Corp.
 * Released under the MIT license
 */

(function () {
  'use strict';

  var keywaurditStopwords = {replaceme: 0};

  /**
   * Export module
   */

  // to AMD or RequireJS
  if (typeof define !== 'undefined' &&
    define.amd) {
    define([], function () {
      // TODO: load preset stopwords
      return keywaurditStopwords;
    });

    // to NodeJS
  } else if (typeof module !== 'undefined' &&
    module.exports) {
    module.exports = keywaurditStopwords;

    // to Browser
  } else {
    this.keywaurditStopwords = keywaurditStopwords;

    if (this.keywaurdit !== undefined) {
      this.keywaurdit._loadPresets(keywaurditStopwords);
    }
  }

}.call(this));
