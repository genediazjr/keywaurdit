/*!
 * keywaurdit test script
 *
 * Copyright 2014, LetsBlumIt Corp.
 * Released under the MIT license
 */

// NodeJS
if (typeof assert === 'undefined') {
  var keywaurdit = require('../lib/keywaurdit'),
    chai = require('chai'),
    assert = chai.assert;
}

var DEFAULTS = {
    language: 'en',
    minLength: 2,
    maxLength: 50,
    hideCount: false
  },
  ERRORS = {
    invalidCode: 'language must be a valid iso 639-1 code',
    invalidOption: 'option must be a string',
    invalidOptions: 'option must be a JSON object',
    invalidNoOption: 'option does not exist',
    invalidLanguage: 'language must be a string',
    invalidCallback: 'callback must be a function (undefined allowed for set functions)',
    invalidStopword: 'stopwords must be an array string',
    invalidStopwords: 'stopwords must be an object containing an add or remove property with an array value',
    invalidHideCount: 'hideCount must be a boolean',
    invalidMinLength: 'minLength must be lower than or equal to maxLength',
    invalidMaxLength: 'maxLength must be greater than or equal to minLength',
    invalidLengths: 'minLength or maxLength must be an integer above -1',
    invalidPreset: 'no stopword preset for that language',
    invalidData: 'data must be a string'
  },
  loadedPreset = keywaurdit.getAllPresetsSync(),
  stopwordCount = 0,
  presetCount = 0,
  presetLang;

for (presetLang in loadedPreset) {
  if (loadedPreset.hasOwnProperty(presetLang)) {
    stopwordCount += loadedPreset[presetLang].length;
    presetCount++;
  }
}

describe('Keywaurdit v' + keywaurdit.version + ' (' +
presetCount + ' languages and ' +
stopwordCount + ' stopwords loaded)', function () {

  beforeEach(function () {
    keywaurdit.resetAllStopwords();
    keywaurdit.resetOptions();
    keywaurdit._resetPresets();
  });

  describe('Setup Stopwords', function () {

    describe('_resetPresets(callback)', function () {

      it('must reset the stopword presets', function (done) {
        assert.doesNotThrow(
          function () {
            keywaurdit._resetPresets();
          }
        );
        keywaurdit.getAllPresets(function (err, presets) {
          if (err) {
            throw new Error(err);
          }
          assert.deepEqual(
            presets,
            {}
          );
        });
        keywaurdit._resetPresets(function () {
          done();
        });
      });
    });

    describe('_loadPresets(presets)', function () {

      it('must not include invalid iso 639-1 code', function () {
        keywaurdit._loadPresets();
        keywaurdit.getAllPresets(function (err, presets) {
          assert.deepEqual(
            presets,
            {}
          );
        });
        keywaurdit._loadPresets(1);
        keywaurdit.getAllPresets(function (err, presets) {
          assert.deepEqual(
            presets,
            {}
          );
        });
        keywaurdit._loadPresets('a');
        keywaurdit.getAllPresets(function (err, presets) {
          assert.deepEqual(
            presets,
            {}
          );
        });
        keywaurdit._loadPresets({as: ['aaaaaaaaaaaaaaaa']});
        keywaurdit.getAllPresets(function (err, presets) {
          assert.deepEqual(
            presets,
            {as: ['aaaaaaaaaaaaaaaa']}
          );
        });
      });

      it('must set unique, lowercased and string only stopwords', function () {
        keywaurdit._loadPresets({
          as: ['A', 'a', 1, [], {}, keywaurdit],
          zh: ['b', 'B']
        });
        keywaurdit.getAllPresets(function (err, presets) {
          assert.deepEqual(
            presets, {
              as: ['a'],
              zh: ['b']
            }
          );
        });
      });
    });

    describe('getAllPresets(callback)', function () {

      it('must throw if argument is not a function', function () {
        assert.throws(
          function () {
            keywaurdit.getAllPresets();
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.getAllPresets(1);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.getAllPresets({});
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.getAllPresets('');
          },
          ERRORS.invalidCallback
        );
      });

      it('must return all presets', function (done) {
        keywaurdit._loadPresets({
          as: ['A', 'a', 1, [], {}, keywaurdit],
          zh: ['b', 'B']
        });
        keywaurdit.getAllPresets(function (err, presets) {
          assert.deepEqual(
            presets, {
              as: ['a'],
              zh: ['b']
            }
          );
          done();
        });
      });
    });

    describe('getAllPresetsSync()', function () {

      it('must return all presets', function () {
        keywaurdit._loadPresets({
          as: ['A', 'a', 1, [], {}, keywaurdit],
          zh: ['b', 'B']
        });
        assert.deepEqual(
          keywaurdit.getAllPresetsSync(),
          {
            as: ['a'],
            zh: ['b']
          }
        );
      });
    });

    describe('getPresets(language, callback)', function () {

      it('must throw if first argument is not a string', function () {
        assert.throws(
          function () {
            keywaurdit.getPresets();
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.getPresets(1);
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.getPresets([]);
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.getPresets({});
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.getPresets(keywaurdit);
          },
          ERRORS.invalidLanguage
        );
      });

      it('must throw if last argument is not a function', function () {
        assert.throws(
          function () {
            keywaurdit.getPresets('');
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.getPresets('', 1);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.getPresets('', []);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.getPresets('', {});
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.getPresets('', '');
          },
          ERRORS.invalidCallback
        );
      });

      it('must error if language code is not an iso 639-1 code', function (done) {
        keywaurdit.getPresets('xx', function (err, presets) {
          assert.equal(
            err,
            ERRORS.invalidCode
          );
          assert.strictEqual(
            presets,
            undefined
          );
          done();
        });
      });

      it('must return language presets', function (done) {
        keywaurdit._loadPresets({en: ['a']});
        keywaurdit.getPresets('en', function (err, presets) {
          assert.deepEqual(
            presets,
            ['a']
          );
          done();
        });
      });
    });

    describe('getPresetsSync(language)', function () {

      it('must throw if argument is not a string', function () {
        assert.throws(
          function () {
            keywaurdit.getPresetsSync();
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.getPresetsSync(1);
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.getPresetsSync([]);
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.getPresetsSync({});
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.getPresetsSync(keywaurdit);
          },
          ERRORS.invalidLanguage
        );
      });

      it('must throw if language code is not an iso 639-1 code', function () {
        assert.throws(
          function () {
            keywaurdit.getPresetsSync('xx');
          },
          ERRORS.invalidCode
        );
      });

      it('must return language presets', function () {
        keywaurdit._loadPresets({en: ['a']});
        assert.deepEqual(
          keywaurdit.getPresetsSync('en'),
          ['a']
        );
      });
    });

    describe('resetAllStopwords()', function () {

      it('must empty all stopwords', function (done) {
        keywaurdit.setStopwords('en', {add: ['a']}, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.getStopwords('en', function (err, stopwords) {
          assert.deepEqual(
            stopwords,
            ['a']
          );
        });
        keywaurdit.resetAllStopwords(function () {
          done();
        });
        keywaurdit.getAllStopwords(function (err, stopwords) {
          if (err) {
            throw new Error(err);
          }
          assert.deepEqual(
            stopwords,
            {}
          );
        });
      });
    });

    describe('resetStopwords(language, callback)', function () {

      it('must throw if first argument is not a string', function () {
        assert.throws(
          function () {
            keywaurdit.resetStopwords();
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.resetStopwords(1);
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.resetStopwords([]);
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.resetStopwords({});
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.resetStopwords(keywaurdit);
          },
          ERRORS.invalidLanguage
        );
      });

      it('must throw if last argument is not a function or undefined', function () {
        assert.throws(
          function () {
            keywaurdit.resetStopwords('', 1);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.resetStopwords('', '');
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.resetStopwords('', []);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.resetStopwords('', {});
          },
          ERRORS.invalidCallback
        );
        assert.doesNotThrow(
          function () {
            keywaurdit.resetStopwords('');
          }
        );
      });

      it('must error if language code is not an iso 639-1 code', function (done) {
        keywaurdit.resetStopwords('xx', function (err) {
          assert.equal(
            err,
            ERRORS.invalidCode
          );
          done();
        });
      });

      it('must empty the stopwords of the language', function (done) {
        keywaurdit.setStopwords('en', {add: ['a']}, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.getStopwords('en', function (err, stopwords) {
          assert.deepEqual(
            stopwords,
            ['a']
          );
        });
        keywaurdit.resetStopwords('en');
        keywaurdit.getAllStopwords(function (err, stopwords) {
          if (err) {
            throw new Error(err);
          }
          assert.deepEqual(
            stopwords,
            {}
          );
          done();
        });
      });
    });

    describe('resetStopwordsSync(language)', function () {

      it('must throw if first argument is not a string', function () {
        assert.throws(
          function () {
            keywaurdit.resetStopwordsSync();
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.resetStopwordsSync(1);
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.resetStopwordsSync([]);
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.resetStopwordsSync({});
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.resetStopwordsSync(keywaurdit);
          },
          ERRORS.invalidLanguage
        );
      });

      it('must throw if language code is not an iso 639-1 code', function () {
        assert.throws(
          function () {
            keywaurdit.resetStopwordsSync('xx');
          },
          ERRORS.invalidCode
        );
      });

      it('must empty the stopwords of the language', function () {
        keywaurdit.setStopwords('en', {add: ['a']}, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.getStopwords('en', function (err, stopwords) {
          assert.deepEqual(
            stopwords,
            ['a']
          );
        });
        keywaurdit.resetStopwordsSync('en');
        keywaurdit.getAllStopwords(function (err, stopwords) {
          if (err) {
            throw new Error(err);
          }
          assert.deepEqual(
            stopwords,
            {}
          );
        });
      });
    });

    describe('getAllStopwords(callback)', function () {

      it('must throw if argument is not a function', function () {
        assert.throws(
          function () {
            keywaurdit.getAllStopwords();
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.getAllStopwords([]);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.getAllStopwords({});
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.getAllStopwords(1);
          },
          ERRORS.invalidCallback
        );
        assert.doesNotThrow(
          function () {
            keywaurdit.getAllStopwords(keywaurdit);
          }
        );
      });

      it('must return all stopwords', function (done) {
        keywaurdit.setStopwords('en', {add: ['a']}, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.setStopwords('zh', {add: ['使']}, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.getAllStopwords(function (err, stopwords) {
          if (err) {
            throw new Error(err);
          }
          assert.deepEqual(
            stopwords,
            {en: ['a'], zh: ['使']}
          );
          done();
        });
      });
    });

    describe('getAllStopwordsSync()', function () {

      it('must return all stopwords', function () {
        keywaurdit.setStopwordsSync('en', {add: ['a']});
        keywaurdit.setStopwordsSync('zh', {add: ['使']});
        assert.deepEqual(
          keywaurdit.getAllStopwordsSync(),
          {en: ['a'], zh: ['使']}
        );
      });
    });

    describe('getStopwords(language, callback)', function () {

      it('must throw if first argument is not a string', function () {
        assert.throws(
          function () {
            keywaurdit.getStopwords();
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.getStopwords(1);
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.getStopwords([]);
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.getStopwords({});
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.getStopwords(keywaurdit);
          },
          ERRORS.invalidLanguage
        );
      });

      it('must throw if last argument is not a function', function () {
        assert.throws(
          function () {
            keywaurdit.getStopwords('a', {});
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.getStopwords('a', []);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.getStopwords('a', 1);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.getStopwords('a');
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.getStopwords(String(function () {
              return 'a';
            }));
          },
          ERRORS.invalidCallback
        );
      });

      it('must error if language code is not an iso 639-1 code', function (done) {
        keywaurdit.getStopwords('xx', function (err, stopwords) {
          assert.equal(
            err,
            ERRORS.invalidCode
          );
          assert.equal(
            stopwords,
            null
          );
          done();
        });
      });

      it('must return stopwords of the language code (case insensitive)', function (done) {
        keywaurdit.setStopwords('en', {add: ['a']}, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.getStopwords('EN', function (err, stopwords) {
          if (err) {
            throw new Error(err);
          }
          assert.deepEqual(['a'], stopwords);
        });
        keywaurdit.getStopwords('zh', function (err, stopwords) {
          if (err) {
            throw new Error(err);
          }
          assert.deepEqual([], stopwords);
          done();
        });
      });
    });

    describe('getStopwordsSync(language)', function () {

      it('must throw if argument is not a string', function () {
        assert.throws(
          function () {
            keywaurdit.getStopwordsSync();
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.getStopwordsSync(1);
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.getStopwordsSync([]);
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.getStopwordsSync({});
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.getStopwordsSync(keywaurdit);
          },
          ERRORS.invalidLanguage
        );
      });

      it('must throw if language code is not an iso 639-1 code', function () {
        assert.throws(
          function () {
            keywaurdit.getStopwordsSync('xx');
          },
          ERRORS.invalidCode
        );
      });

      it('must return stopwords of the language code (case insensitive)', function () {
        keywaurdit.setStopwordsSync('en', {add: ['a']});
        assert.deepEqual(
          keywaurdit.getStopwordsSync('EN'),
          ['a']
        );
        assert.deepEqual(
          keywaurdit.getStopwordsSync('zh'),
          []
        );
      });
    });

    describe('setStopwords(language, stopwords, callback)', function () {

      it('must throw if first argument is not a string', function () {
        assert.throws(
          function () {
            keywaurdit.setStopwords();
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.setStopwords(1);
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.setStopwords([]);
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.setStopwords({});
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.setStopwords(keywaurdit);
          },
          ERRORS.invalidLanguage
        );
        assert.doesNotThrow(
          function () {
            keywaurdit.setStopwords('');
          }
        );
      });

      it('must throw if last argument is not a function or undefined', function () {
        assert.throws(
          function () {
            keywaurdit.setStopwords('en', {add: []}, 1);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.setStopwords('en', {add: []}, '');
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.setStopwords('en', {add: []}, []);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.setStopwords('en', {add: []}, {});
          },
          ERRORS.invalidCallback
        );
        assert.doesNotThrow(
          function () {
            keywaurdit.setStopwords('en', {add: []});
          }
        );
      });

      it('must error if stopwords is not a function or an object with an add or remove property containing an array', function (done) {
        keywaurdit.setStopwords('en', 1, function (err) {
          assert.equal(
            err,
            ERRORS.invalidStopwords
          );
        });
        keywaurdit.setStopwords('en', '', function (err) {
          assert.equal(
            err,
            ERRORS.invalidStopwords
          );
        });
        keywaurdit.setStopwords('en', {test: ''}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidStopwords
          );
        });
        keywaurdit.setStopwords('en', {add: ''}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidStopwords
          );
        });
        keywaurdit.setStopwords('en', keywaurdit, function (err) {
          assert.equal(
            err,
            ERRORS.invalidStopwords
          );
          done();
        });
      });

      it('must error if language code is not an iso 639-1 code', function (done) {
        keywaurdit.setStopwords('xx', {add: []}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidCode
          );
          done();
        });
      });

      it('must error if preset is empty for the specified language', function (done) {
        keywaurdit.setStopwords('as', function (err) {
          assert.equal(
            err,
            ERRORS.invalidPreset
          );
          done();
        });
      });

      it('must set the stopwords unique on the language lowercased and string filtered', function (done) {
        keywaurdit.setStopwords('en', {add: ['A', 'a', 1, {}, [], keywaurdit]}, function (err) {
          if (err) {
            throw new Error(err);
          }
          keywaurdit.getStopwords('en', function (err, stopwords) {
            if (err) {
              throw new Error(err);
            }
            assert.deepEqual(
              stopwords,
              ['a']
            );
            done();
          });
        });
      });

      it('must use the preset if no stopwords are provided', function (done) {
        keywaurdit._loadPresets(loadedPreset);
        keywaurdit.setStopwords('en', function (err) {
          if (err) {
            throw new Error(err);
          }
          keywaurdit.getStopwords('en', function (err, stopwords) {
            if (err) {
              throw new Error(err);
            }
            assert.deepEqual(
              stopwords,
              loadedPreset.en
            );
            done();
          });
        });
      });
    });

    describe('setStopwordsSync(language, stopwords)', function () {

      it('must throw if first argument is not a string', function () {
        assert.throws(
          function () {
            keywaurdit.setStopwordsSync();
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.setStopwordsSync(1);
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.setStopwordsSync([]);
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.setStopwordsSync({});
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.setStopwordsSync(keywaurdit);
          },
          ERRORS.invalidLanguage
        );
      });

      it('must throw if stopwords is not an object with an add or remove property containing an array', function () {
        assert.throws(
          function () {
            keywaurdit.setStopwordsSync('en', 1);
          },
          ERRORS.invalidStopwords
        );
        assert.throws(
          function () {
            keywaurdit.setStopwordsSync('en', '');
          },
          ERRORS.invalidStopwords
        );
        assert.throws(
          function () {
            keywaurdit.setStopwordsSync('en', {});
          },
          ERRORS.invalidStopwords
        );
        assert.throws(
          function () {
            keywaurdit.setStopwordsSync('en', {test: 'test'});
          },
          ERRORS.invalidStopwords
        );
        assert.throws(
          function () {
            keywaurdit.setStopwordsSync('en', {add: 'test'});
          },
          ERRORS.invalidStopwords
        );
      });

      it('must throw if language code is not an iso 639-1 code', function () {
        assert.throws(
          function () {
            keywaurdit.setStopwordsSync('xx', {add: []});
          },
          ERRORS.invalidCode
        );
      });

      it('must throw if preset is empty for the specified language', function () {
        assert.throws(
          function () {
            // as of this writing, the 'as' code currently does not have preset stopwords
            keywaurdit.setStopwordsSync('as');
          },
          ERRORS.invalidPreset
        );
      });

      it('must set the stopwords unique on the language lowercased and string filtered', function () {
        keywaurdit.setStopwordsSync('en', {add: ['A', 1, {}, [], keywaurdit]});
        assert.deepEqual(
          keywaurdit.getStopwordsSync('en'),
          ['a']
        );
      });

      it('must use the preset if no stopwords are provided', function () {
        keywaurdit._loadPresets(loadedPreset);
        keywaurdit.setStopwordsSync('en');
        assert.deepEqual(
          keywaurdit.getStopwordsSync('en'),
          loadedPreset.en
        );
      });
    });

  });

  describe('Setup Options', function () {

    describe('resetOptions()', function () {

      it('must set options to default', function () {
        var testOptions = {
          language: 'ce',
          minLength: 6,
          maxLength: 60,
          hideCount: true
        };
        keywaurdit.setOptions(testOptions, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.getOptions(function (err, options) {
          if (err) {
            throw new Error(err);
          }
          assert.deepEqual(
            options,
            testOptions
          );
        });
        keywaurdit.resetOptions();
        keywaurdit.getOptions(function (err, options) {
          if (err) {
            throw new Error(err);
          }
          assert.deepEqual(
            options,
            DEFAULTS
          );
        });
      });
    });

    describe('getOptions(callback)', function () {

      it('must throw if argument is not a function', function () {
        assert.throws(
          function () {
            keywaurdit.getOptions();
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.getOptions(1);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.getOptions([]);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.getOptions('en');
          },
          ERRORS.invalidCallback
        );
      });

      it('must return all current options', function (done) {
        var testOptions = {
          language: 'zh',
          minLength: 3,
          maxLength: 30,
          hideCount: true
        };
        keywaurdit.setOptions(testOptions, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.getOptions(function (err, options) {
          if (err) {
            throw new Error(err);
          }
          assert.deepEqual(
            options,
            testOptions
          );
          done();
        });
      });
    });

    describe('getOptionsSync()', function () {

      it('must return all current options', function () {
        var testOptions = {
          language: 'as',
          minLength: 4,
          maxLength: 40,
          hideCount: true
        };
        keywaurdit.setOptionsSync(testOptions);
        assert.deepEqual(
          keywaurdit.getOptionsSync(),
          testOptions
        );
      });
    });

    describe('getOption(option, callback)', function () {

      it('must throw if first argument is not a string', function () {
        assert.throws(
          function () {
            keywaurdit.getOption();
          },
          ERRORS.invalidOption
        );
        assert.throws(
          function () {
            keywaurdit.getOption(1);
          },
          ERRORS.invalidOption
        );
        assert.throws(
          function () {
            keywaurdit.getOption([]);
          },
          ERRORS.invalidOption
        );
        assert.throws(
          function () {
            keywaurdit.getOption({});
          },
          ERRORS.invalidOption
        );
        assert.throws(
          function () {
            keywaurdit.getOption(keywaurdit);
          },
          ERRORS.invalidOption
        );
      });

      it('must throw if last argument is not a function', function () {
        assert.throws(
          function () {
            keywaurdit.getOption('');
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.getOption('', 1);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.getOption('', []);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.getOption('', 'en');
          },
          ERRORS.invalidCallback
        );
      });

      it('must error if option is not valid', function (done) {
        keywaurdit.getOption('test', function (err) {
          assert.equal(
            err,
            ERRORS.invalidNoOption
          );
          done();
        });
      });

      it('must return value of option', function (done) {
        keywaurdit.setOption('language', 'ka', function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.getOption('language', function (err, language) {
          assert.equal(
            language,
            'ka'
          );
          done();
        });
      });
    });

    describe('getOptionSync(option)', function () {

      it('must throw if first argument is not a string', function () {
        assert.throws(
          function () {
            keywaurdit.getOptionSync();
          },
          ERRORS.invalidOption
        );
        assert.throws(
          function () {
            keywaurdit.getOptionSync(1);
          },
          ERRORS.invalidOption
        );
        assert.throws(
          function () {
            keywaurdit.getOptionSync([]);
          },
          ERRORS.invalidOption
        );
        assert.throws(
          function () {
            keywaurdit.getOptionSync({});
          },
          ERRORS.invalidOption
        );
        assert.throws(
          function () {
            keywaurdit.getOptionSync(keywaurdit);
          },
          ERRORS.invalidOption
        );
      });

      it('must throw if option is not valid', function () {
        assert.throws(
          function () {
            keywaurdit.getOptionSync('test');
          },
          ERRORS.invalidNoOption
        );
      });

      it('must return value of option', function () {
        keywaurdit.setOptionSync('language', 'ka');
        assert.equal(
          keywaurdit.getOptionSync('language'),
          'ka'
        );
      });
    });

    describe('setOption(option, value, callback)', function () {

      it('must throw if first argument is not a string', function () {
        assert.throws(
          function () {
            keywaurdit.setOption();
          },
          ERRORS.invalidOption
        );
        assert.throws(
          function () {
            keywaurdit.setOption(1);
          },
          ERRORS.invalidOption
        );
        assert.throws(
          function () {
            keywaurdit.setOption([]);
          },
          ERRORS.invalidOption
        );
        assert.throws(
          function () {
            keywaurdit.setOption({});
          },
          ERRORS.invalidOption
        );
        assert.throws(
          function () {
            keywaurdit.setOption(keywaurdit);
          },
          ERRORS.invalidOption
        );
      });

      it('must throw if last argument is not a function or undefined', function () {
        assert.doesNotThrow(
          function () {
            keywaurdit.setOption('', '');
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.setOption('', '', 1);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.setOption('', '', []);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.setOption('', '', {});
          },
          ERRORS.invalidCallback
        );
      });

      it('must error if option is not valid', function (done) {
        keywaurdit.setOption('test', '', function (err) {
          assert.equal(
            err,
            ERRORS.invalidNoOption
          );
          done();
        });
      });

      it('must error if hideCount value is not a boolean', function (done) {
        keywaurdit.setOption('hideCount', '', function (err) {
          assert.equal(
            err,
            ERRORS.invalidHideCount
          );
        });
        keywaurdit.setOption('hideCount', 1, function (err) {
          assert.equal(
            err,
            ERRORS.invalidHideCount
          );
        });
        keywaurdit.setOption('hideCount', {}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidHideCount
          );
        });
        keywaurdit.setOption('hideCount', [], function (err) {
          assert.equal(
            err,
            ERRORS.invalidHideCount
          );
        });
        keywaurdit.setOption('hideCount', keywaurdit, function (err) {
          assert.equal(
            err,
            ERRORS.invalidHideCount
          );
          done();
        });
      });

      it('must error if language value is not a string', function (done) {
        keywaurdit.setOption('language', 1, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLanguage
          );
        });
        keywaurdit.setOption('language', {}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLanguage
          );
        });
        keywaurdit.setOption('language', [], function (err) {
          assert.equal(
            err,
            ERRORS.invalidLanguage
          );
        });
        keywaurdit.setOption('language', keywaurdit, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLanguage
          );
          done();
        });
      });

      it('must error if language value is not an iso 639-1 code', function (done) {
        keywaurdit.setOption('language', 'xx', function (err) {
          assert.equal(
            err,
            ERRORS.invalidCode
          );
          done();
        });
      });

      it('must error if minLenght value is not a non-negative integer', function (done) {
        keywaurdit.setOption('minLength', '', function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.setOption('minLength', -1, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.setOption('minLength', 1.1, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.setOption('minLength', [], function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.setOption('minLength', {}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.setOption('minLength', keywaurdit, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
          done();
        });
      });

      it('must error if minLength is greater than the maxLength', function (done) {
        keywaurdit.setOption('maxLength', 50, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.setOption('minLength', 60, function (err) {
          assert.equal(
            err,
            ERRORS.invalidMinLength
          );
          done();
        });
      });

      it('must error if maxLength value is not a non-negative integer', function (done) {
        keywaurdit.setOption('maxLength', '', function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.setOption('maxLength', -1, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.setOption('maxLength', 1.1, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.setOption('maxLength', [], function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.setOption('maxLength', {}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.setOption('maxLength', keywaurdit, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
          done();
        });
      });

      it('must error if maxLength is less than the minLength', function (done) {
        keywaurdit.setOption('minLength', 10, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.setOption('maxLength', 1, function (err) {
          assert.equal(
            err,
            ERRORS.invalidMaxLength
          );
          done();
        });
      });

      it('must set the hideCount value', function (done) {
        keywaurdit.setOption('hideCount', true, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.getOption('hideCount', function (err, value) {
          if (err) {
            throw new Error(err);
          }
          assert.equal(
            value,
            true
          );
          done();
        });
      });

      it('must set the language value', function (done) {
        keywaurdit.setOption('language', 'tt', function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.getOption('language', function (err, value) {
          if (err) {
            throw new Error(err);
          }
          assert.equal(
            value,
            'tt'
          );
          done();
        });
      });

      it('must set the minLength value', function (done) {
        keywaurdit.setOption('minLength', 1, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.getOption('minLength', function (err, value) {
          if (err) {
            throw new Error(err);
          }
          assert.equal(
            value,
            1
          );
          done();
        });
      });

      it('must set the maxLength value', function (done) {
        keywaurdit.setOption('maxLength', 2, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.getOption('maxLength', function (err, value) {
          if (err) {
            throw new Error(err);
          }
          assert.equal(
            value,
            2
          );
          done();
        });
      });
    });

    describe('setOptionSync(option, value)', function () {

      it('must throw if first argument is not a string', function () {
        assert.throws(
          function () {
            keywaurdit.setOptionSync();
          },
          ERRORS.invalidOption
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync(1);
          },
          ERRORS.invalidOption
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync([]);
          },
          ERRORS.invalidOption
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync({});
          },
          ERRORS.invalidOption
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync(keywaurdit);
          },
          ERRORS.invalidOption
        );
      });

      it('must throw if option is not valid', function () {
        assert.throws(
          function () {
            keywaurdit.setOptionSync('test', '');
          },
          ERRORS.invalidNoOption
        );
      });

      it('must throw if hideCount value is not a boolean', function () {
        assert.throws(
          function () {
            keywaurdit.setOptionSync('hideCount', '');
          },
          ERRORS.invalidHideCount
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync('hideCount', 1);
          },
          ERRORS.invalidHideCount
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync('hideCount', {});
          },
          ERRORS.invalidHideCount
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync('hideCount', []);
          },
          ERRORS.invalidHideCount
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync('hideCount', keywaurdit);
          },
          ERRORS.invalidHideCount
        );
      });

      it('must throw if language value is not a string', function () {
        assert.throws(
          function () {
            keywaurdit.setOptionSync('language', 1);
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync('language', []);
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync('language', {});
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync('language', keywaurdit);
          },
          ERRORS.invalidLanguage
        );
      });

      it('must throw if language value is not an iso 639-1 code', function () {
        assert.throws(
          function () {
            keywaurdit.setOptionSync('language', 'xx');
          },
          ERRORS.invalidCode
        );
      });

      it('must throw if minLenght value is not a non-negative integer', function () {
        assert.throws(
          function () {
            keywaurdit.setOptionSync('minLength', '');
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync('minLength', -1);
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync('minLength', 1.1);
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync('minLength', []);
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync('minLength', {});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync('minLength', keywaurdit);
          },
          ERRORS.invalidLengths
        );
      });

      it('must throw if minLength is less than the maxLength', function () {
        keywaurdit.setOptionSync('maxLength', 50);
        assert.throws(
          function () {
            keywaurdit.setOptionSync('minLength', 60);
          },
          ERRORS.invalidMinLength
        );
      });

      it('must throw if maxLength value is not a non-negative integer', function () {
        assert.throws(
          function () {
            keywaurdit.setOptionSync('maxLength', '');
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync('maxLength', -1);
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync('maxLength', 1.1);
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync('maxLength', []);
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync('maxLength', {});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.setOptionSync('maxLength', keywaurdit);
          },
          ERRORS.invalidLengths
        );
      });

      it('must throw if maxLength is less than the minLength', function () {
        keywaurdit.setOptionSync('minLength', 10);
        assert.throws(
          function () {
            keywaurdit.setOptionSync('maxLength', 1);
          },
          ERRORS.invalidMaxLength
        );
      });

      it('must set the hideCount value', function () {
        keywaurdit.setOptionSync('hideCount', true);
        assert.equal(
          keywaurdit.getOptionSync('hideCount'),
          true
        );
      });

      it('must set the language value', function () {
        keywaurdit.setOptionSync('language', 'tt');
        assert.equal(
          keywaurdit.getOptionSync('language'),
          'tt'
        );
      });

      it('must set the minLength value', function () {
        keywaurdit.setOptionSync('minLength', 1);
        assert.equal(
          keywaurdit.getOptionSync('minLength'),
          1
        );
      });

      it('must set the maxLength value', function () {
        keywaurdit.setOptionSync('maxLength', 2);
        assert.equal(
          keywaurdit.getOptionSync('maxLength'),
          2
        );
      });
    });

    describe('setOptions(options, callback)', function () {

      it('must throw if first argument is not a JSON object', function () {
        assert.throws(
          function () {
            keywaurdit.setOptions('');
          },
          ERRORS.invalidOptions
        );
        assert.throws(
          function () {
            keywaurdit.setOptions([]);
          },
          ERRORS.invalidOptions
        );
        assert.throws(
          function () {
            keywaurdit.setOptions(1);
          },
          ERRORS.invalidOptions
        );
      });

      it('must throw if last argument is not a function or undefined', function () {
        assert.doesNotThrow(
          function () {
            keywaurdit.setOptions({});
          }
        );
        assert.throws(
          function () {
            keywaurdit.setOptions({}, 1);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.setOptions({}, '');
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.setOptions({}, []);
          },
          ERRORS.invalidCallback
        );
      });

      it('must error if option is not valid', function (done) {
        keywaurdit.setOptions({test: 'test'}, function (err) {
          assert.equal(
            err,
            'test ' + ERRORS.invalidNoOption
          );
          done();
        });
      });

      it('must error if hideCount value is not a boolean', function (done) {
        keywaurdit.setOptions({hideCount: ''}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidHideCount
          );
        });
        keywaurdit.setOptions({hideCount: 1}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidHideCount
          );
        });
        keywaurdit.setOptions({hideCount: {}}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidHideCount
          );
        });
        keywaurdit.setOptions({hideCount: []}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidHideCount
          );
        });
        keywaurdit.setOptions({hideCount: keywaurdit}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidHideCount
          );
          done();
        });
      });

      it('must error if language value is not a string', function (done) {
        keywaurdit.setOptions({language: 1}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLanguage
          );
        });
        keywaurdit.setOptions({language: {}}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLanguage
          );
        });
        keywaurdit.setOptions({language: []}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLanguage
          );
        });
        keywaurdit.setOptions({language: keywaurdit}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLanguage
          );
          done();
        });
      });

      it('must error if language value is not an iso 639-1 code', function (done) {
        keywaurdit.setOptions({language: 'xx'}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidCode
          );
          done();
        });
      });

      it('must error if minLength value is not a non-negative integer', function (done) {
        keywaurdit.setOptions({minLength: ''}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.setOptions({minLength: -1}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.setOptions({minLength: 1.1}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.setOptions({minLength: []}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.setOptions({minLength: {}}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.setOptions({minLength: keywaurdit}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
          done();
        });
      });

      it('must error if minLength is greater than the maxLength', function (done) {
        keywaurdit.setOptions({maxLength: 50}, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.setOptions({minLength: 60}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidMinLength
          );
          done();
        });
      });

      it('must error if maxLength value is not a non-negative integer', function (done) {
        keywaurdit.setOptions({maxLength: ''}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.setOptions({maxLength: -1}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.setOptions({maxLength: 1.1}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.setOptions({maxLength: []}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.setOptions({maxLength: {}}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.setOptions({maxLength: keywaurdit}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
          done();
        });
      });

      it('must error if maxLength is less than the minLength', function (done) {
        keywaurdit.setOptions({minLength: 10}, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.setOptions({maxLength: 1}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidMaxLength
          );
          done();
        });
      });

      it('must set the hideCount value', function (done) {
        keywaurdit.setOptions({hideCount: true}, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.getOption('hideCount', function (err, value) {
          if (err) {
            throw new Error(err);
          }
          assert.equal(
            value,
            true
          );
          done();
        });
      });

      it('must set the language value', function (done) {
        keywaurdit.setOptions({language: 'tt'}, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.getOption('language', function (err, value) {
          if (err) {
            throw new Error(err);
          }
          assert.equal(
            value,
            'tt'
          );
          done();
        });
      });

      it('must set the minLength value', function (done) {
        keywaurdit.setOptions({minLength: 1}, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.getOption('minLength', function (err, value) {
          if (err) {
            throw new Error(err);
          }
          assert.equal(
            value,
            1
          );
          done();
        });
      });

      it('must set the maxLength value', function (done) {
        keywaurdit.setOptions({maxLength: 2}, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.getOption('maxLength', function (err, value) {
          if (err) {
            throw new Error(err);
          }
          assert.equal(
            value,
            2
          );
          done();
        });
      });
    });

    describe('setOptionsSync(options)', function () {

      it('must throw if first argument is not a JSON object', function () {
        assert.throws(
          function () {
            keywaurdit.setOptionsSync('');
          },
          ERRORS.invalidOptions
        );
        assert.throws(
          function () {
            keywaurdit.setOptionsSync([]);
          },
          ERRORS.invalidOptions
        );
        assert.throws(
          function () {
            keywaurdit.setOptionsSync(1);
          },
          ERRORS.invalidOptions
        );
      });

      it('must throw if option is not valid', function () {
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({test: 'test'});
          },
          'test ' + ERRORS.invalidNoOption
        );
      });

      it('must throw if hideCount value is not a boolean', function () {
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({hideCount: ''});
          },
          ERRORS.invalidHideCount
        );
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({hideCount: 1});
          },
          ERRORS.invalidHideCount
        );
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({hideCount: {}});
          },
          ERRORS.invalidHideCount
        );
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({hideCount: []});
          },
          ERRORS.invalidHideCount
        );
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({hideCount: keywaurdit});
          },
          ERRORS.invalidHideCount
        );
      });

      it('must throw if language value is not a string', function () {
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({language: 1});
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({language: {}});
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({language: []});
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({language: keywaurdit});
          },
          ERRORS.invalidLanguage
        );
      });

      it('must throw if language value is not an iso 639-1 code', function () {
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({language: 'xx'});
          },
          ERRORS.invalidCode
        );
      });

      it('must throw if minLength value is not a non-negative integer', function () {
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({minLength: ''});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({minLength: -1});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({minLength: 1.1});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({minLength: []});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({minLength: {}});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({minLength: keywaurdit});
          },
          ERRORS.invalidLengths
        );
      });

      it('must throw if minLength is greater than the maxLength', function () {
        keywaurdit.setOptionsSync({maxLength: 50});
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({minLength: 60});
          },
          ERRORS.invalidMinLength
        );
      });

      it('must throw if maxLength value is not a non-negative integer', function () {
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({maxLength: ''});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({maxLength: -1});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({maxLength: 1.1});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({maxLength: []});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({maxLength: {}});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({maxLength: keywaurdit});
          },
          ERRORS.invalidLengths
        );
      });

      it('must throw if maxLength is less than the minLength', function () {
        keywaurdit.setOptionsSync({minLength: 10});
        assert.throws(
          function () {
            keywaurdit.setOptionsSync({maxLength: 1});
          },
          ERRORS.invalidMaxLength
        );
      });

      it('must set the hideCount value', function () {
        keywaurdit.setOptionsSync({hideCount: true});
        assert.equal(
          keywaurdit.getOptionSync('hideCount'),
          true
        );
      });

      it('must set the language value', function () {
        keywaurdit.setOptionsSync({language: 'tt'});
        assert.equal(
          keywaurdit.getOptionSync('language'),
          'tt'
        );
      });

      it('must set the minLength value', function () {
        keywaurdit.setOptionsSync({minLength: 1});
        assert.equal(
          keywaurdit.getOptionSync('minLength'),
          1
        );
      });

      it('must set the maxLength value', function () {
        keywaurdit.setOptionsSync({maxLength: 2});
        assert.equal(
          keywaurdit.getOptionSync('maxLength'),
          2
        );
      });
    });

  });

  describe('Audit Text', function () {

    describe('auditText(data, options, callback)', function () {

      it('must throw if first argument is not a string', function () {
        assert.throws(
          function () {
            keywaurdit.auditText();
          },
          ERRORS.invalidData
        );
        assert.throws(
          function () {
            keywaurdit.auditText(1);
          },
          ERRORS.invalidData
        );
        assert.throws(
          function () {
            keywaurdit.auditText({});
          },
          ERRORS.invalidData
        );
        assert.throws(
          function () {
            keywaurdit.auditText([]);
          },
          ERRORS.invalidData
        );
        assert.throws(
          function () {
            keywaurdit.auditText(keywaurdit);
          },
          ERRORS.invalidData
        );
      });

      it('must throw if last argument is not a function', function () {
        assert.throws(
          function () {
            keywaurdit.auditText('', '');
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.auditText('', 1);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.auditText('', {});
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.auditText('', []);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.auditText('', '', '');
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.auditText('', '', 1);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.auditText('', '', []);
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.auditText('', '', {});
          },
          ERRORS.invalidCallback
        );
        assert.throws(
          function () {
            keywaurdit.auditText('', {}, {});
          },
          ERRORS.invalidCallback
        );
      });

      it('must error if option is not a JSON object or undefined', function () {
        keywaurdit.auditText('', '', function (err) {
          assert.equal(
            err,
            ERRORS.invalidOptions
          );
        });
        keywaurdit.auditText('', 1, function (err) {
          assert.equal(
            err,
            ERRORS.invalidOptions
          );
        });
        keywaurdit.auditText('', [], function (err) {
          assert.equal(
            err,
            ERRORS.invalidOptions
          );
        });
        keywaurdit.auditText('', {}, function (err) {
          assert.equal(
            err,
            null
          );
        });
      });

      it('must error if option is not valid', function () {
        keywaurdit.auditText('', {test: 'test'}, function (err) {
          assert.equal(
            err,
            'test ' + ERRORS.invalidNoOption
          );
        });
      });

      it('must error if hideCount option is not a boolean', function (done) {
        keywaurdit.auditText('', {hideCount: ''}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidHideCount
          );
        });
        keywaurdit.auditText('', {hideCount: 1}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidHideCount
          );
        });
        keywaurdit.auditText('', {hideCount: {}}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidHideCount
          );
        });
        keywaurdit.auditText('', {hideCount: []}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidHideCount
          );
        });
        keywaurdit.auditText('', {hideCount: keywaurdit}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidHideCount
          );
          done();
        });
      });

      it('must error if language option is not a string', function (done) {
        keywaurdit.auditText('', {language: 1}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLanguage
          );
        });
        keywaurdit.auditText('', {language: {}}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLanguage
          );
        });
        keywaurdit.auditText('', {language: []}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLanguage
          );
        });
        keywaurdit.auditText('', {language: keywaurdit}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLanguage
          );
          done();
        });
      });

      it('must error if language value is not an iso 639-1 code', function (done) {
        keywaurdit.auditText('', {language: 'xx'}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidCode
          );
          done();
        });
      });

      it('must error if minLength value is not a non-negative integer', function (done) {
        keywaurdit.auditText('', {minLength: ''}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.auditText('', {minLength: -1}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.auditText('', {minLength: 1.1}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.auditText('', {minLength: []}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.auditText('', {minLength: {}}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.auditText('', {minLength: keywaurdit}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
          done();
        });
      });

      it('must error if minLength is greater than the maxLength', function (done) {
        keywaurdit.setOptions({maxLength: 50}, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.auditText('', {minLength: 60}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidMinLength
          );
          done();
        });
      });

      it('must error if maxLength value is not a non-negative integer', function (done) {
        keywaurdit.auditText('', {maxLength: ''}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.auditText('', {maxLength: -1}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.auditText('', {maxLength: 1.1}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.auditText('', {maxLength: []}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.auditText('', {maxLength: {}}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
        });
        keywaurdit.auditText('', {maxLength: keywaurdit}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidLengths
          );
          done();
        });
      });

      it('must error if maxLength is less than the minLength', function (done) {
        keywaurdit.setOptions({minLength: 10}, function (err) {
          if (err) {
            throw new Error(err);
          }
        });
        keywaurdit.auditText('', {maxLength: 1}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidMaxLength
          );
          done();
        });
      });

      it('must error if stopwords is not an array', function (done) {
        keywaurdit.auditText('', {stopwords: 1}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidStopword
          );
        });
        keywaurdit.auditText('', {stopwords: ''}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidStopword
          );
        });
        keywaurdit.auditText('', {stopwords: {}}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidStopword
          );
        });
        keywaurdit.auditText('', {stopwords: keywaurdit}, function (err) {
          assert.equal(
            err,
            ERRORS.invalidStopword
          );
          done();
        });
      });

      it('must set hideCount for the task', function (done) {
        keywaurdit.auditText('sample text', {hideCount: true}, function (err, keywords) {
          if (err) {
            throw new Error(err);
          }
          assert.deepEqual(
            keywords,
            ['sample', 'text']
          );
        });
        keywaurdit.auditText('sample text', {hideCount: false}, function (err, keywords) {
          if (err) {
            throw new Error(err);
          }
          assert.deepEqual(
            keywords,
            {sample: 1, text: 1}
          );
          done();
        });
      });

      it('must set language for the task', function (done) {
        keywaurdit._loadPresets(loadedPreset);
        keywaurdit.setStopwords('en', function (err) {
          if (err) {
            throw new Error(err);
          }
          keywaurdit.setOption('language', 'zh', function (err) {
            if (err) {
              throw new Error(err);
            }
            keywaurdit.auditText('this is a sample', {language: 'en'}, function (err, keywords) {
              if (err) {
                throw new Error(err);
              }
              assert.deepEqual(
                keywords,
                {sample: 1}
              );
              assert.equal(
                keywaurdit.getOptionSync('language'),
                'zh'
              );
              done();
            });
          });
        });
      });

      it('must set minLength for the task', function (done) {
        keywaurdit.auditText('this is a sample', {minLength: 5}, function (err, keywords) {
          if (err) {
            throw new Error(err);
          }
          assert.deepEqual(
            keywords,
            {sample: 1}
          );
          done();
        });
      });

      it('must set no minLength if zero', function (done) {
        keywaurdit.auditText('thiz is a sample', {minLength: 0}, function (err, keywords) {
          if (err) {
            throw new Error(err);
          }
          assert.deepEqual(
            keywords,
            {thiz: 1, is: 1, a: 1, sample: 1}
          );
          done();
        });
      });

      it('must set maxLength for the task', function (done) {
        keywaurdit.auditText('thiz sample is zuper loooooooooong', {maxLength: 4}, function (err, keywords) {
          if (err) {
            throw new Error(err);
          }
          assert.deepEqual(
            keywords,
            {thiz: 1, is: 1}
          );
          done();
        });
      });

      it('must set no maxLength if zero', function (done) {
        keywaurdit.auditText('thiz sample is zuper loooooooooong', {maxLength: 0}, function (err, keywords) {
          if (err) {
            throw new Error(err);
          }
          assert.deepEqual(
            keywords,
            {thiz: 1, is: 1, zuper: 1, sample: 1, loooooooooong: 1}
          );
          done();
        });
      });

      it('must set stopwords for the task', function (done) {
        keywaurdit.auditText('thiz sample is zuper loooooooooong', {stopwords: ['loooooooooong']}, function (err, keywords) {
          if (err) {
            throw new Error(err);
          }
          assert.deepEqual(
            keywords,
            {thiz: 1, is: 1, zuper: 1, sample: 1}
          );
          done();
        });
      });

      it('must audit text keywords', function (done) {
        keywaurdit._loadPresets(loadedPreset);
        keywaurdit.setStopwords('en', function (err) {
          if (err) {
            throw new Error(err);
          }
          keywaurdit.auditText('this is a sample sample is is', {hideCount: false}, function (err, keywords) {
            if (err) {
              throw new Error(err);
            }
            assert.deepEqual(
              keywords,
              {sample: 2}
            );
            done();
          });
        });
      });
    });

    describe('auditTextSync(data, options)', function () {

      it('must throw if first argument is not a string', function () {
        assert.throws(
          function () {
            keywaurdit.auditTextSync();
          },
          ERRORS.invalidData
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync(1);
          },
          ERRORS.invalidData
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync({});
          },
          ERRORS.invalidData
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync([]);
          },
          ERRORS.invalidData
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync(keywaurdit);
          },
          ERRORS.invalidData
        );
      });

      it('must throw if option is not a JSON object or undefined', function () {
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', '');
          },
          ERRORS.invalidOptions
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', 1);
          },
          ERRORS.invalidOptions
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', []);
          },
          ERRORS.invalidOptions
        );
        assert.doesNotThrow(
          function () {
            keywaurdit.auditTextSync('', {});
          },
          ERRORS.invalidOptions
        );
        assert.doesNotThrow(
          function () {
            keywaurdit.auditTextSync('');
          }
        );
      });

      it('must error if option is not valid', function () {
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {test: 'test'});
          },
          ERRORS.invalidNoOption
        );
      });

      it('must error if hideCount option is not a boolean', function () {
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {hideCount: ''});
          },
          ERRORS.invalidHideCount
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {hideCount: 1});
          },
          ERRORS.invalidHideCount
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {hideCount: {}});
          },
          ERRORS.invalidHideCount
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {hideCount: []});
          },
          ERRORS.invalidHideCount
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {hideCount: keywaurdit});
          },
          ERRORS.invalidHideCount
        );
      });

      it('must error if language option is not a string', function () {
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {language: 1});
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {language: {}});
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {language: []});
          },
          ERRORS.invalidLanguage
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {language: keywaurdit});
          },
          ERRORS.invalidLanguage
        );
      });

      it('must error if language value is not an iso 639-1 code', function () {
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {language: 'xx'});
          },
          ERRORS.invalidCode
        );
      });

      it('must error if minLength value is not a non-negative integer', function () {
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {minLength: ''});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {minLength: -1});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {minLength: 1.1});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {minLength: []});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {minLength: {}});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {minLength: keywaurdit});
          },
          ERRORS.invalidLengths
        );
      });

      it('must error if minLength is greater than the maxLength', function () {
        keywaurdit.setOptionsSync({maxLength: 50});
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {minLength: 60});
          },
          ERRORS.invalidMinLength
        );
      });

      it('must error if maxLength value is not a non-negative integer', function () {
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {maxLength: ''});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {maxLength: -1});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {maxLength: 1.1});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {maxLength: []});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {maxLength: {}});
          },
          ERRORS.invalidLengths
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {maxLength: keywaurdit});
          },
          ERRORS.invalidLengths
        );
      });

      it('must error if maxLength is less than the minLength', function () {
        keywaurdit.setOptionsSync({minLength: 10});
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {maxLength: 1});
          },
          ERRORS.invalidMaxLength
        );
      });

      it('must error if stopwords is not an array', function () {
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {stopwords: 1});
          },
          ERRORS.invalidStopword
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {stopwords: ''});
          },
          ERRORS.invalidStopword
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {stopwords: {}});
          },
          ERRORS.invalidStopword
        );
        assert.throws(
          function () {
            keywaurdit.auditTextSync('', {stopwords: keywaurdit});
          },
          ERRORS.invalidStopword
        );
      });

      it('must set hideCount for the task', function () {
        assert.deepEqual(
          keywaurdit.auditTextSync('sample text', {hideCount: true}),
          ['sample', 'text']
        );
        assert.deepEqual(
          keywaurdit.auditTextSync('sample text', {hideCount: false}),
          {sample: 1, text: 1}
        );
      });

      it('must set language for the task', function () {
        keywaurdit._loadPresets(loadedPreset);
        keywaurdit.setStopwordsSync('en');
        keywaurdit.setOptionSync('language', 'zh');
        assert.deepEqual(
          keywaurdit.auditTextSync('this is a sample', {language: 'en'}),
          {sample: 1}
        );
        assert.equal(
          keywaurdit.getOptionSync('language'),
          'zh'
        );
      });

      it('must set minLength for the task', function () {
        assert.deepEqual(
          keywaurdit.auditTextSync('this is a sample', {minLength: 5}),
          {sample: 1}
        );
      });

      it('must set no minLength if zero', function () {
        assert.deepEqual(
          keywaurdit.auditTextSync('thiz is a sample', {minLength: 0}),
          {thiz: 1, is: 1, a: 1, sample: 1}
        );
      });

      it('must set maxLength for the task', function () {
        assert.deepEqual(
          keywaurdit.auditTextSync('thiz sample is zuper loooooooooong', {maxLength: 4}),
          {thiz: 1, is: 1}
        );
      });

      it('must set no maxLength if zero', function () {
        assert.deepEqual(
          keywaurdit.auditTextSync('thiz sample is zuper loooooooooong', {maxLength: 0}),
          {thiz: 1, is: 1, zuper: 1, sample: 1, loooooooooong: 1}
        );
      });

      it('must set stopwords for the task', function () {
        assert.deepEqual(
          keywaurdit.auditTextSync('thiz sample is zuper loooooooooong', {stopwords: ['loooooooooong']}),
          {thiz: 1, is: 1, zuper: 1, sample: 1}
        );
      });

      it('must audit text keywords', function () {
        keywaurdit._loadPresets(loadedPreset);
        keywaurdit.setStopwordsSync('en');
        assert.deepEqual(
          keywaurdit.auditTextSync('this is a sample sample is is', {hideCount: false}),
          {sample: 2}
        );
      });
    });
  });

});
