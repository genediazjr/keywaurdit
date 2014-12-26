/*!
 * keywaurdit
 * https://github.com/letsblumit/keywaurdit
 *
 * Copyright 2014, LetsBlumIt Corp.
 * Released under the MIT license
 */

(function () {
  'use strict';

  var keywaurdit,
    _toString = Object.prototype.toString,
    _expressions = new RegExp(/(;|:|,|\.|\t|\r\n|\n|\r|^\uFEFF)/gm),
    _stopwords = {
      current: {},
      presets: {}
    },
    _options = {
      current: {},
      DEFAULTS: {
        language: 'en',
        minLength: 2,
        maxLength: 50,
        hideCount: false
      }
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
    ISO6391 = [
      'ab', 'aa', 'af', 'ak', 'sq', 'am', 'ar', 'an', 'hy', 'as', 'av', 'ae', 'ay', 'az', 'bm', 'ba', 'eu', 'be', 'bn', 'bh', 'bi', 'bs', 'br',
      'bg', 'my', 'ca', 'ch', 'ce', 'ny', 'zh', 'cv', 'kw', 'co', 'cr', 'hr', 'cs', 'da', 'dv', 'nl', 'dz', 'en', 'eo', 'et', 'ee', 'fo', 'fj',
      'fi', 'fr', 'ff', 'gl', 'ka', 'de', 'el', 'gn', 'gu', 'ht', 'ha', 'he', 'hz', 'hi', 'ho', 'hu', 'ia', 'id', 'ie', 'ga', 'ig', 'ik', 'io',
      'is', 'it', 'iu', 'ja', 'jv', 'kl', 'kn', 'kr', 'ks', 'kk', 'km', 'ki', 'rw', 'ky', 'kv', 'kg', 'ko', 'ku', 'kj', 'la', 'lb', 'lg', 'li',
      'ln', 'lo', 'lt', 'lu', 'lv', 'gv', 'mk', 'mg', 'ms', 'ml', 'mt', 'mi', 'mr', 'mh', 'mn', 'na', 'nv', 'nd', 'ne', 'ng', 'nb', 'nn', 'no',
      'ii', 'nr', 'oc', 'oj', 'cu', 'om', 'or', 'os', 'pa', 'pi', 'fa', 'pl', 'ps', 'pt', 'qu', 'rm', 'rn', 'ro', 'ru', 'sa', 'sc', 'sd', 'se',
      'sm', 'sg', 'sr', 'gd', 'sn', 'si', 'sk', 'sl', 'so', 'st', 'es', 'su', 'sw', 'ss', 'sv', 'ta', 'te', 'tg', 'th', 'ti', 'bo', 'tk', 'tl',
      'tn', 'to', 'tr', 'ts', 'tt', 'tw', 'ty', 'ug', 'uk', 'ur', 'uz', 've', 'vi', 'vo', 'wa', 'cy', 'wo', 'fy', 'xh', 'yi', 'yo', 'za', 'zu'
    ],
    VERSION = '0.1.0';

  /**
   * Helper functions
   */

  function _noop() {
    return; // no operation
  }

  function _isObject(value) {
    var type = typeof value;
    return type === 'function' ||
      (value && type === 'object') ||
      false;
  }

  function _isArray(value) {
    var check = Array.isArray ||
      function (value) {
        return (value &&
          typeof value === 'object' &&
          typeof value.length === 'number' &&
          _toString.call(value) === '[object Array]') ||
          false;
      };
    return check(value);
  }

  function _isBoolean(value) {
    return (value === true ||
      value === false ||
      value &&
      typeof value === 'object' &&
      _toString.call(value) === '[object Boolean]') ||
      false;
  }

  function _isString(value) {
    return typeof value === 'string' ||
      (value &&
      typeof value === 'object' &&
      _toString.call(value) === '[object String]') ||
      false;
  }

  function _isFunction(value) {
    return typeof value === 'function' || false;
  }

  function _isNonNegativeInt(value) {
    return value === Number(value) &&
      value % 1 === 0 &&
      value > -1;
  }

  function _mergeObjects(obj1, obj2) {
    var key, obj3 = {};
    for (key in obj1) {
      if (obj1.hasOwnProperty(key)) {
        obj3[key] = obj1[key];
      }
    }
    for (key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        obj3[key] = obj2[key];
      }
    }
    return obj3;
  }

  function _arrayDiff(array1, array2) {
    return array1.filter(
      function (item) {
        return array2.indexOf(item) > 0;
      });
  }

  function _arrayUnique(array) {
    return array.reduce(function (previous, current) {
      if (previous.indexOf(current) < 0) {
        previous.push(current);
      }
      return previous;
    }, []);
  }

  function _arrayLowerCase(array) {
    return array.map(function (item) {
      return item.toLowerCase();
    });
  }

  function _addPreset(language, stopwords) {
    _stopwords.presets[language] = _arrayUnique(
      _stopwords.presets[language].concat(
        _arrayLowerCase(
          stopwords.filter(function (stopword) {
            return _isString(stopword);
          })
        )
      )
    );
  }

  /**
   * Module functions
   */

  keywaurdit = _noop;

  keywaurdit.version = VERSION;

  keywaurdit._resetPresets = function (callback) {
    _stopwords.presets = {};
    callback = callback || _noop;
    return callback();
  };

  keywaurdit._loadPresets = function (presets) {
    if (presets !== undefined && !_isFunction(presets) && !_isArray(presets) &&
      _isObject(presets)) {

      for (var language in presets) {
        if (presets.hasOwnProperty(language) &&
          ISO6391.indexOf(language) > -1) {
          if (!_stopwords.presets.hasOwnProperty(language)) {
            _stopwords.presets[language] = [];
          }
          if (_isArray(presets[language])) {
            _addPreset(language, presets[language]);
          }
        }
      }
    }
  };

  keywaurdit.getAllPresets = function (callback) {
    if (_isFunction(callback)) {
      return callback(null, _stopwords.presets);
    } else {
      throw new Error(ERRORS.invalidCallback);
    }
  };

  keywaurdit.getAllPresetsSync = function () {
    return _stopwords.presets;
  };

  keywaurdit.getPresets = function (language, callback) {
    if (_isString(language)) {
      language = language.toLowerCase();

      if (_isFunction(callback)) {
        if (ISO6391.indexOf(language) > -1) {
          return callback(null, _stopwords.presets[language] || []);
        } else {
          return callback(ERRORS.invalidCode);
        }
      } else {
        throw new Error(ERRORS.invalidCallback);
      }
    } else {
      throw new Error(ERRORS.invalidLanguage);
    }
  };

  keywaurdit.getPresetsSync = function (language) {
    if (_isString(language)) {
      language = language.toLowerCase();

      if (ISO6391.indexOf(language) > -1) {
        return _stopwords.presets[language] || [];
      } else {
        throw new Error(ERRORS.invalidCode);
      }
    } else {
      throw new Error(ERRORS.invalidLanguage);
    }
  };

  keywaurdit.resetAllStopwords = function (callback) {
    _stopwords.current = {};
    callback = callback || _noop;
    return callback();
  };

  keywaurdit.resetStopwords = function (language, callback) {
    if (_isString(language)) {
      language = language.toLowerCase();

      if (callback === undefined ||
        _isFunction(callback)) {
        callback = callback || _noop;

        if (ISO6391.indexOf(language) > -1) {
          delete _stopwords.current[language];
          return;
        } else {
          return callback(ERRORS.invalidCode);
        }
      } else {
        throw new Error(ERRORS.invalidCallback);
      }
    } else {
      throw new Error(ERRORS.invalidLanguage);
    }
  };

  keywaurdit.resetStopwordsSync = function (language) {
    if (_isString(language)) {
      language = language.toLowerCase();

      if (ISO6391.indexOf(language) > -1) {
        delete _stopwords.current[language];
        return;
      } else {
        throw new Error(ERRORS.invalidCode);
      }
    } else {
      throw new Error(ERRORS.invalidLanguage);
    }
  };

  keywaurdit.getAllStopwords = function (callback) {
    if (_isFunction(callback)) {
      return callback(null, _stopwords.current);
    } else {
      throw new Error(ERRORS.invalidCallback);
    }
  };

  keywaurdit.getAllStopwordsSync = function () {
    return _stopwords.current;
  };

  keywaurdit.getStopwords = function (language, callback) {
    if (_isString(language)) {
      language = language.toLowerCase();

      if (_isFunction(callback)) {
        if (ISO6391.indexOf(language) > -1) {
          return callback(null, _stopwords.current[language] || []);
        } else {
          return callback(ERRORS.invalidCode);
        }
      } else {
        throw new Error(ERRORS.invalidCallback);
      }
    } else {
      throw new Error(ERRORS.invalidLanguage);
    }
  };

  keywaurdit.getStopwordsSync = function (language) {
    if (_isString(language)) {
      language = language.toLowerCase();

      if (ISO6391.indexOf(language) > -1) {
        return _stopwords.current[language] || [];
      } else {
        throw new Error(ERRORS.invalidCode);
      }
    } else {
      throw new Error(ERRORS.invalidLanguage);
    }
  };

  keywaurdit.setStopwords = function (language, stopwords, callback) {
    if (_isString(language)) {
      language = language.toLowerCase();

      if (callback === undefined ||
        _isFunction(callback)) {
        callback = callback || _noop;

        if (ISO6391.indexOf(language) > -1) {
          if (_isFunction(stopwords) &&
            String(callback) === String(_noop)) {
            callback = stopwords;
            if (!_stopwords.current.hasOwnProperty(language)) {
              _stopwords.current[language] = [];
            }
            if (_stopwords.presets.hasOwnProperty(language)) {
              _stopwords.current[language] = _arrayUnique(
                _stopwords.current[language].concat(
                  _stopwords.presets[language])
              );
              return callback();
            } else {
              return callback(ERRORS.invalidPreset);
            }

          } else if (_isObject(stopwords) &&
            stopwords.hasOwnProperty('add') &&
            _isArray(stopwords.add)) {
            if (!_stopwords.current.hasOwnProperty(language)) {
              _stopwords.current[language] = [];
            }
            _stopwords.current[language] = _arrayUnique(
              _stopwords.current[language].concat(
                _arrayLowerCase(
                  stopwords.add.filter(function (stopword) {
                    return _isString(stopword);
                  })
                )
              )
            );
            return callback();

          } else if (_isObject(stopwords) &&
            stopwords.hasOwnProperty('remove') &&
            _isArray(stopwords.remove) &&
            _stopwords.hasOwnProperty(language) &&
            _stopwords.current[language].length > 0) {
            _stopwords.current[language] = _arrayDiff(
              _stopwords.current[language],
              _arrayLowerCase(stopwords.remove)
            );
            return callback();

          } else {
            return callback(ERRORS.invalidStopwords);
          }
        } else {
          return callback(ERRORS.invalidCode);
        }
      } else {
        throw new Error(ERRORS.invalidCallback);
      }
    } else {
      throw new Error(ERRORS.invalidLanguage);
    }
  };

  keywaurdit.setStopwordsSync = function (language, stopwords) {
    if (_isString(language)) {
      language = language.toLowerCase();

      if (ISO6391.indexOf(language) > -1) {
        if (stopwords === undefined) {
          if (_stopwords.presets.hasOwnProperty(language)) {
            if (!_stopwords.current.hasOwnProperty(language)) {
              _stopwords.current[language] = [];
            }
            _stopwords.current[language] = _arrayUnique(
              _stopwords.current[language].concat(
                _stopwords.presets[language])
            );
            return;
          } else {
            throw new Error(ERRORS.invalidPreset);
          }

        } else if (_isObject(stopwords) &&
          stopwords.hasOwnProperty('add') &&
          _isArray(stopwords.add)) {
          if (!_stopwords.current.hasOwnProperty(language)) {
            _stopwords.current[language] = [];
          }
          _stopwords.current[language] = _arrayUnique(
            _stopwords.current[language].concat(
              _arrayLowerCase(
                stopwords.add.filter(function (stopword) {
                  return _isString(stopword);
                })
              )
            )
          );
          return;

        } else if (_isObject(stopwords) &&
          stopwords.hasOwnProperty('remove') &&
          _isArray(stopwords.remove) &&
          _stopwords.hasOwnProperty(language) &&
          _stopwords.current[language].length > 0) {
          _stopwords.current[language] = _arrayDiff(
            _stopwords.current[language],
            _arrayLowerCase(stopwords.remove)
          );
          return;

        } else {
          throw new Error(ERRORS.invalidStopwords);
        }
      } else {
        throw new Error(ERRORS.invalidCode);
      }
    } else {
      throw new Error(ERRORS.invalidLanguage);
    }
  };

  keywaurdit.resetOptions = function (callback) {
    for (var option in _options.DEFAULTS) {
      if (_options.DEFAULTS.hasOwnProperty(option)) {
        _options.current[option] = _options.DEFAULTS[option];
      }
    }
    callback = callback || _noop;
    return callback();
  };

  keywaurdit.getOptions = function (callback) {
    if (_isFunction(callback)) {
      return callback(null, _mergeObjects(_options.DEFAULTS, _options.current));
    } else {
      throw new Error(ERRORS.invalidCallback);
    }
  };

  keywaurdit.getOptionsSync = function () {
    return _mergeObjects(_options.DEFAULTS, _options.current);
  };

  keywaurdit.getOption = function (option, callback) {
    if (_isString(option)) {
      if (_isFunction(callback)) {
        if (_options.DEFAULTS.hasOwnProperty(option)) {
          return callback(null, _mergeObjects(_options.DEFAULTS, _options.current)[option]);
        } else {
          return callback(ERRORS.invalidNoOption, null);
        }
      } else {
        throw new Error(ERRORS.invalidCallback);
      }
    } else {
      throw new Error(ERRORS.invalidOption);
    }
  };

  keywaurdit.getOptionSync = function (option) {
    if (_isString(option)) {
      if (_options.DEFAULTS.hasOwnProperty(option)) {
        return _mergeObjects(_options.DEFAULTS, _options.current)[option];
      } else {
        throw new Error(ERRORS.invalidNoOption);
      }
    } else {
      throw new Error(ERRORS.invalidOption);
    }
  };

  keywaurdit.setOption = function (option, value, callback) {
    if (_isString(option)) {
      if (callback === undefined ||
        _isFunction(callback)) {
        callback = callback || _noop;

        if (option === 'hideCount') {
          if (_isBoolean(value)) {
            _options.current.hideCount = value;
            return callback();
          } else {
            return callback(ERRORS.invalidHideCount);
          }

        } else if (option === 'language') {
          if (_isString(value)) {
            value = value.toLowerCase();
            if (ISO6391.indexOf(value) > -1) {
              _options.current.language = value;
              return callback();
            } else {
              return callback(ERRORS.invalidCode);
            }
          } else {
            return callback(ERRORS.invalidLanguage);
          }

        } else if (
          option === 'minLength' ||
          option === 'maxLength') {
          if (_isNonNegativeInt(value)) {

            if (option === 'minLength') {
              if (value === 0 || value <= _options.current.maxLength) {
                _options.current.minLength = value;
                return callback();
              } else {
                return callback(ERRORS.invalidMinLength);
              }
            } else {
              if (value === 0 || value >= _options.current.minLength) {
                _options.current.maxLength = value;
                return callback();
              } else {
                return callback(ERRORS.invalidMaxLength);
              }
            }
          } else {
            return callback(ERRORS.invalidLengths);
          }
        } else {
          return callback(ERRORS.invalidNoOption);
        }
      } else {
        throw new Error(ERRORS.invalidCallback);
      }
    } else {
      throw new Error(ERRORS.invalidOption);
    }
  };

  keywaurdit.setOptionSync = function (option, value) {
    if (_isString(option)) {

      if (option === 'hideCount') {
        if (_isBoolean(value)) {
          _options.current.hideCount = value;
          return;
        } else {
          throw new Error(ERRORS.invalidHideCount);
        }

      } else if (option === 'language') {
        if (_isString(value)) {
          value = value.toLowerCase();
          if (ISO6391.indexOf(value) > -1) {
            _options.current.language = value;
            return;
          } else {
            throw new Error(ERRORS.invalidCode);
          }
        } else {
          throw new Error(ERRORS.invalidLanguage);
        }

      } else if (
        option === 'minLength' ||
        option === 'maxLength') {
        if (_isNonNegativeInt(value)) {

          if (option === 'minLength') {
            if (value === 0 || value <= _options.current.maxLength) {
              _options.current.minLength = value;
              return;
            } else {
              throw new Error(ERRORS.invalidMinLength);
            }
          } else {
            if (value === 0 || value >= _options.current.minLength) {
              _options.current.maxLength = value;
              return;
            } else {
              throw new Error(ERRORS.invalidMaxLength);
            }
          }
        } else {
          throw new Error(ERRORS.invalidLengths);
        }
      } else {
        throw new Error(ERRORS.invalidNoOption);
      }
    } else {
      throw new Error(ERRORS.invalidOption);
    }
  };

  keywaurdit.setOptions = function (options, callback) {
    if (!_isArray(options) &&
      _isObject(options)) {
      if (callback === undefined ||
        _isFunction(callback)) {
        callback = callback || _noop;

        var option, invalidOption, callbackUncalled = true;
        for (option in options) {
          if (options.hasOwnProperty(option) && !_options.DEFAULTS.hasOwnProperty(option)) {
            invalidOption = option;
            break;
          }
        }

        if (invalidOption === undefined) {

          if (options.minLength !== undefined) {
            this.setOption('minLength', options.minLength, function (err) {
              if (err) {
                callbackUncalled = false;
                return callback(err);
              }
            });
          }
          if (options.maxLength !== undefined) {
            this.setOption('maxLength', options.maxLength, function (err) {
              if (err) {
                callbackUncalled = false;
                return callback(err);
              }
            });
          }
          if (options.language !== undefined) {
            this.setOption('language', options.language, function (err) {
              if (err) {
                callbackUncalled = false;
                return callback(err);
              }
            });
          }
          if (options.hideCount !== undefined) {
            this.setOption('hideCount', options.hideCount, function (err) {
              if (err) {
                callbackUncalled = false;
                return callback(err);
              }
            });
          }

          if (callbackUncalled) {
            return callback();
          }
        } else {
          return callback(invalidOption + ' ' + ERRORS.invalidNoOption);
        }
      } else {
        throw new Error(ERRORS.invalidCallback);
      }
    } else {
      throw new Error(ERRORS.invalidOptions);
    }
  };

  keywaurdit.setOptionsSync = function (options) {
    if (_isObject(options) && !_isArray(options)) {

      var option, invalidOption;
      for (option in options) {
        if (options.hasOwnProperty(option) && !_options.DEFAULTS.hasOwnProperty(option)) {
          invalidOption = option;
          break;
        }
      }

      if (invalidOption === undefined) {

        if (options.minLength !== undefined) {
          this.setOptionSync('minLength', options.minLength);
        }
        if (options.maxLength !== undefined) {
          this.setOptionSync('maxLength', options.maxLength);
        }
        if (options.language !== undefined) {
          this.setOptionSync('language', options.language);
        }
        if (options.hideCount !== undefined) {
          this.setOptionSync('hideCount', options.hideCount);
        }

        return;
      } else {
        throw new Error(invalidOption + ' ' + ERRORS.invalidNoOption);
      }
    } else {
      throw new Error(ERRORS.invalidOptions);
    }
  };

  keywaurdit.auditText = function (data, options, callback) {
    if (_isString(data)) {
      if (_isFunction(callback) ||
        (_isFunction(options) &&
        callback === undefined)) {

        if (_isFunction(options) &&
          callback === undefined) {
          callback = options;
        }

        if ((!_isArray(options) && !_isFunction(options) &&
          _isObject(options)) || _isFunction(options)) {

          var k,
            option,
            keyword,
            keywords,
            splitWords,
            invalidOption,
            taskMinLength,
            taskMaxLength,
            taskStopwords,
            taskOptions = _mergeObjects(_options.DEFAULTS, _options.current);

          // setup options
          if (options !== null &&
            options !== undefined) {

            for (option in options) {
              if (!_options.DEFAULTS.hasOwnProperty(option) &&
                options.hasOwnProperty(option) &&
                option !== 'stopwords') {
                invalidOption = option;
                break;
              }
            }

            if (invalidOption === undefined) {

              if (options.minLength !== undefined) {
                if (_isNonNegativeInt(options.minLength)) {
                  if (options.minLength === 0 ||
                    (options.minLength <= (options.maxLength ||
                    taskOptions.maxLength))) {
                    taskOptions.minLength = options.minLength;
                  } else {
                    return callback(ERRORS.invalidMinLength);
                  }
                } else {
                  return callback(ERRORS.invalidLengths);
                }
              }

              if (options.maxLength !== undefined) {
                if (_isNonNegativeInt(options.maxLength)) {
                  if (options.maxLength === 0 ||
                    (options.maxLength >= (options.minLength ||
                    taskOptions.minLength))) {
                    taskOptions.maxLength = options.maxLength;
                  } else {
                    return callback(ERRORS.invalidMaxLength);

                  }
                } else {
                  return callback(ERRORS.invalidLengths);
                }
              }

              if (options.language !== undefined) {
                if (_isString(options.language)) {
                  options.language = options.language.toLowerCase();
                  if (ISO6391.indexOf(options.language) > -1) {
                    taskOptions.language = options.language;
                  } else {
                    return callback(ERRORS.invalidCode);
                  }
                } else {
                  return callback(ERRORS.invalidLanguage);
                }
              }

              if (options.hideCount !== undefined) {
                if (_isBoolean(options.hideCount)) {
                  taskOptions.hideCount = options.hideCount;
                } else {
                  return callback(ERRORS.invalidHideCount);
                }
              }

            } else {
              return callback(invalidOption + ' ' + ERRORS.invalidNoOption);
            }

            taskStopwords = _stopwords.current[taskOptions.language] || [];
            if (options.hasOwnProperty('stopwords')) {
              if (_isArray(options.stopwords)) {
                taskStopwords = _arrayUnique(
                  taskStopwords.concat(
                    _arrayLowerCase(
                      options.stopwords.filter(function (stopword) {
                        return _isString(stopword);
                      })
                    )
                  )
                );
              } else {
                return callback(ERRORS.invalidStopword);
              }
            }
          }

          taskMinLength = taskOptions.minLength;
          if (taskMinLength === 0) {
            taskMinLength = Number.NEGATIVE_INFINITY;
          }

          taskMaxLength = taskOptions.maxLength;
          if (taskMaxLength === 0) {
            taskMaxLength = Number.POSITIVE_INFINITY;
          }

          taskStopwords = taskStopwords ||
          _stopwords.current[taskOptions.language] ||
          [];

          if (taskOptions.hideCount) {
            keywords = [];
          } else {
            keywords = {};
          }

          splitWords = data.toLowerCase()
            .replace(_expressions, ' ')
            .split(' ');

          for (k = 0; k < splitWords.length; k++) {
            keyword = splitWords[k].trim();
            if (keyword !== '' &&
              keyword.length >= taskMinLength &&
              keyword.length <= taskMaxLength &&
              taskStopwords.indexOf(keyword) < 0) {

              if (taskOptions.hideCount) {
                if (keywords.indexOf(keyword) === -1) {
                  keywords.push(keyword);
                }
              } else {
                if (keywords.hasOwnProperty(keyword)) {
                  keywords[keyword]++;
                } else {
                  keywords[keyword] = 1;
                }
              }
            }
          }

          return callback(null, keywords);

        } else {
          return callback(ERRORS.invalidOptions);
        }
      } else {
        throw new Error(ERRORS.invalidCallback);
      }
    } else {
      throw new Error(ERRORS.invalidData);
    }
  };

  keywaurdit.auditTextSync = function (data, options) {
    if (_isString(data)) {

      if ((!_isArray(options) && !_isFunction(options) &&
        _isObject(options)) || options === undefined) {

        var k,
          option,
          keyword,
          keywords,
          splitWords,
          invalidOption,
          taskMinLength,
          taskMaxLength,
          taskStopwords,
          taskOptions = _mergeObjects(_options.DEFAULTS, _options.current);

        // setup options
        if (options !== null &&
          options !== undefined) {

          for (option in options) {
            if (!_options.DEFAULTS.hasOwnProperty(option) &&
              options.hasOwnProperty(option) &&
              option !== 'stopwords') {
              invalidOption = option;
              break;
            }
          }

          if (invalidOption === undefined) {

            if (options.minLength !== undefined) {
              if (_isNonNegativeInt(options.minLength)) {
                if (options.minLength === 0 ||
                  (options.minLength <= (options.maxLength ||
                  taskOptions.maxLength))) {
                  taskOptions.minLength = options.minLength;
                } else {
                  throw new Error(ERRORS.invalidMinLength);
                }
              } else {
                throw new Error(ERRORS.invalidLengths);
              }
            }

            if (options.maxLength !== undefined) {
              if (_isNonNegativeInt(options.maxLength)) {
                if (options.maxLength === 0 ||
                  (options.maxLength >= (options.minLength ||
                  taskOptions.minLength))) {
                  taskOptions.maxLength = options.maxLength;
                } else {
                  throw new Error(ERRORS.invalidMaxLength);

                }
              } else {
                throw new Error(ERRORS.invalidLengths);
              }
            }

            if (options.language !== undefined) {
              if (_isString(options.language)) {
                options.language = options.language.toLowerCase();
                if (ISO6391.indexOf(options.language) > -1) {
                  taskOptions.language = options.language;
                } else {
                  throw new Error(ERRORS.invalidCode);
                }
              } else {
                throw new Error(ERRORS.invalidLanguage);
              }
            }

            if (options.hideCount !== undefined) {
              if (_isBoolean(options.hideCount)) {
                taskOptions.hideCount = options.hideCount;
              } else {
                throw new Error(ERRORS.invalidHideCount);
              }
            }

          } else {
            throw new Error(invalidOption + ' ' + ERRORS.invalidNoOption);
          }

          taskStopwords = _stopwords.current[taskOptions.language] || [];
          if (options.hasOwnProperty('stopwords')) {
            if (_isArray(options.stopwords)) {
              taskStopwords = _arrayUnique(
                taskStopwords.concat(
                  _arrayLowerCase(
                    options.stopwords.filter(function (stopword) {
                      return _isString(stopword);
                    })
                  )
                )
              );
            } else {
              throw new Error(ERRORS.invalidStopword);
            }
          }
        }

        taskMinLength = taskOptions.minLength;
        if (taskMinLength === 0) {
          taskMinLength = Number.NEGATIVE_INFINITY;
        }

        taskMaxLength = taskOptions.maxLength;
        if (taskMaxLength === 0) {
          taskMaxLength = Number.POSITIVE_INFINITY;
        }

        taskStopwords = taskStopwords ||
        _stopwords.current[taskOptions.language] ||
        [];

        if (taskOptions.hideCount) {
          keywords = [];
        } else {
          keywords = {};
        }

        splitWords = data.toLowerCase()
          .replace(_expressions, ' ')
          .split(' ');

        for (k = 0; k < splitWords.length; k++) {
          keyword = splitWords[k].trim();
          if (keyword !== '' &&
            keyword.length >= taskMinLength &&
            keyword.length <= taskMaxLength &&
            taskStopwords.indexOf(keyword) < 0) {

            if (taskOptions.hideCount) {
              if (keywords.indexOf(keyword) === -1) {
                keywords.push(keyword);
              }
            } else {
              if (keywords.hasOwnProperty(keyword)) {
                keywords[keyword]++;
              } else {
                keywords[keyword] = 1;
              }
            }
          }
        }

        return keywords;

      } else {
        throw new Error(ERRORS.invalidOptions);
      }
    } else {
      throw new Error(ERRORS.invalidData);
    }
  };

  /**
   * Export module
   */

  // to AMD or RequireJS
  if (typeof define !== 'undefined' &&
    define.amd) {
    define([], function () {
      // TODO: load preset stopwords
      return keywaurdit;
    });

    // to NodeJS
  } else if (typeof module !== 'undefined' &&
    module.exports) {
    keywaurdit._loadPresets(require('./stopwords'));
    module.exports = keywaurdit;

    // to Browser
  } else {
    keywaurdit._loadPresets(this.keywaurditStopwords);
    this.keywaurdit = keywaurdit;
  }

}.call(this));
