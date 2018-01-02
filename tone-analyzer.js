/**
 * Copyright (c) 2016 Ali Lokhandwala <ali@huestones.co.uk>. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @module watson/tone-analyzer */

'use strict';

const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
const debug = require('debug')('servicekit:tone-analyzer');
const noop = () => 0;

exports = module.exports = create;
exports.newAnalyzer = _newTA;

//--

/**
 * Helper creates a new instance of the watson service.
 * @private
 */
function _newTA(config) {
  return new ToneAnalyzerV3({
    username: config.username,
    password: config.password,
    version: 'v3',
    version_date: config.version_date
  });
}

/** 
 * The tone analyzer service factory.
 * @param {Object} config Configuration for the service.
 * @param {string} config.username 
 * @param {string} config.password  
 * @param {string} [config.version_date] Defaults to 2017-09-21.
 * @param {boolean} [config.sentences] Enable or disable sentence level analysis. Default true.
 * @param {string} [config.content_type] Input content type and charset. Default 'text/plain;charset=utf-8'
 * @return {Function} The tone analyzer service
 */
function create(config) {
  config.version_date = config.version_date || '2017-09-21';
  config.content_type = config.content_type || 'text/plain;charset=utf-8';

  var tone_analyzer = exports.newAnalyzer(config);

  return tone;

  //--

  function tone(text, sentences, content_language, cb) {

    if (typeof (content_language) === 'function') {
      cb = content_language;
      content_language = 'en';
    }

    if (typeof (sentences) === 'function') {
      cb = sentences;
      sentences = config.sentences;
      content_language = 'en';
    }

    if (typeof (sentences) === 'string') {
      content_language = sentences;
      sentences = config.sentences;
    }

    if (!cb) cb = noop;

    var parameters = {
      tone_input: text,
      sentences: sentences === false ? false : true,
      content_type: config.content_type,
      content_language: content_language
    };

    debug('tone analyzer parameters', parameters);

    tone_analyzer.tone(parameters, function (err, tone) {
      if (err) return cb(err);

      debug('tone analyzer result', tone);
      cb(null, tone);
    });
  }
}
