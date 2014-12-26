/*!
 * stopwords compiler
 *
 * Copyright 2014, LetsBlumIt Corp.
 * Released under the MIT license
 */
'use strict';

var fs = require('fs'),
  path = require('path'),
  lazy = require('lazy.js'),
  rawDir = __dirname + '/raw/',
  outFile = path.resolve(__dirname, '../lib/stopwords.js'),
  template = fs.readFileSync(__dirname + '/template.js', 'utf8'),
  stopwords = {}, langStopwords, stopwords, unique, tabbed;

//list files per languages in raw dir
lazy(fs.readdirSync(rawDir)).each(function (langDir) {

  // set stopwords container
  langStopwords = [];

  try {

    // read each file in language dir
    lazy(fs.readdirSync(rawDir + langDir)).each(function (file) {

      // process each line in the file
      lazy(fs.readFileSync(rawDir + langDir + '/' + file, 'utf8')
          .replace(/\r/g, '')                     // strip CRs
          .replace(/^\uFEFF/g, '')                // strip BOMs
          .split('\n')                            // split per line
      ).uniq().each(function (stopword) {         // unique words only
          stopword = stopword.trim()              // remove whitespaces
            .toLowerCase();                       // convert lowercase
          if (stopword !== '') {                  // filter empty strings
            tabbed = stopword.split('\t');        // split tabbed words
            if (tabbed.length > 1) {

              // process tabbed lines
              lazy(tabbed).uniq().each(function (tabbedWord) {
                tabbedWord = tabbedWord.trim();

                if (tabbedWord !== '') {
                  // add to language stopwords array
                  langStopwords.push(tabbedWord);
                }
              });

            } else {
              // add to language stopwords array
              langStopwords.push(stopword);
            }
          }
        });
    });

    // set unique container
    unique = [];

    // filter unique stopwords
    lazy(langStopwords).uniq().each(function (x) {
      unique.push(x);
    });

    stopwords[langDir] = unique.sort();

  } catch (err) {
    console.log('found non directory in raw: ' + langDir);
  }
});

fs.writeFileSync(outFile,
  template.replace('{replaceme: 0}',       // replace template
    JSON.stringify(stopwords, null, 2)),   // sorted pretty json print
  {flags: 'w'});                           // overwrite
