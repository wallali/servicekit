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

'use strict';

const request = require('request');
const noop = function () {};
const debug = require('debug')('servicekit:bingspell');

exports = module.exports = create;

exports.mode = {
  proof: 'proof',
  spell: 'spell'
};

Object.freeze(exports.mode);

//--

/** 
 * Spell Check API service factory.
 * @param {Object} config Configuration for the Spell Check API.
 * @param {string} config.subscriptionKey Spell Check API subscription key.
 * @param {string} [config.mode] Mode of spellcheck, default Spell.
 * @param {string} [config.apiVersion] default v5.0
 * @param {string} [config.language] default en-us
 * @param {Function} [config.correct] The correction function used to correct text.
 * @return {Function}
 */
function create(config) {

  var apiVersion = config.apiVersion || 'v5.0';
  var mode = config.mode || exports.mode.spell;
  var language = config.language || 'en-us';
  var correct = config.correct || replace;

  return spellcheck;

  //--

  function spellcheck(text, precontext, postcontext, cb) {
    if (typeof (precontext) === 'function') {
      cb = precontext;
      precontext = postcontext = '';
    }

    if (typeof (postcontext) === 'function') {
      cb = postcontext;
      postcontext = '';
    }

    if (!cb) cb = noop;

    let options = {
      url: 'https://api.cognitive.microsoft.com/bing/' + apiVersion + '/spellcheck',
      method: 'GET',
      json: true,
      qs: {
        text: text,
        mode: mode,
        mkt: language,
        preContextText: precontext,
        postContextText: postcontext
      },
      headers: {
        'Ocp-Apim-Subscription-Key': config.subscriptionKey
      }
    };

    request.get(options, handleResponse);

    //--

    function handleResponse(error, response, body) {
      if (error) return cb(error);

      if (response.statusCode !== 200) {
        let err = new Error('Unexpected response status ' + response.statusCode);

        if (body) {
          debug(body);

          if (body.message) {
            err.message = body.message;
          }

          if (body.errors && body.errors.length > 0) {
            err.message = body.errors[0].message;
            err.errors = body.errors;
          }
        }

        return cb(err);
      }

      debug(body);
      cb(null, correct(text, body));
    }
  }
}

function replace(text, corrections) {
  var tokens = corrections.flaggedTokens;
  if (!tokens || tokens.length === 0) {
    return text;
  }

  tokens.forEach(function (token) {
    text = text.replace(token.token, token.suggestions[0].suggestion);
  });

  return text;
}
