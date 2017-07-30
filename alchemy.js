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

/** @module ibm/alchemy */

'use strict';

const inspect = require('util').inspect;
const AlchemyLanguageV1 = require('watson-developer-cloud/alchemy-language/v1');
const _ = require('lodash');
const debug = require('debug')('servicekit:alchemy');
const noop = function () {};

const deprecate = _.once(() => console.warn('WARNING!! Alchemy Language service has been deprecated as of April 7, 2017 and will remain supported till Mar 7, 2018.'));

exports = module.exports = create;
exports.newAlchemy = _newAlchemy;

//--

/**
 * Helper creates a new instance of the alchemy service.
 * @private
 */
function _newAlchemy(config) {
  return new AlchemyLanguageV1({
    api_key: config.apikey
  });
}

/**
 * The alchemy service factory.
 * @deprecated Alchemy Language service has been deprecated as of April 7, 2017
 * @param {Object} config Configuration for the service.
 * @param {string} config.apikey.
 * @param {string} config.extract Comma seperated list of fields to extract.
 * @param {string} [config.language] Language to supply to alchemy.
 * @param {boolean} [config.ignore_unsupported_lang] Ignore errors from alchemy if the relate to the input language being unsupported.
 * @return {Object} The alchemy service.
 */
function create(config) {
  deprecate();

  var alchemy_language = exports.newAlchemy(config);

  var parameters = {
    text: '',
    extract: config.extract,
    url: 'https://www.ibm.com/us-en/',
    outputMode: 'json'
  };

  if (config.language) {
    parameters.language = config.language;
  }

  var ignore_unsupported_lang = config.ignore_unsupported_lang || false;

  return {
    extract: extract
  };

  //--

  function extract(text, cb) {
    if (!cb) cb = noop;

    parameters.anchorDate = new Date().toISOString()
      .replace(/T/, ' ').replace(/\..+/, '');

    parameters.text = text;

    doCombined(parameters, function (err, res) {
      if (err) {
        if (ignore_unsupported_lang && err.code && err.statusInfo &&
          err.code === 400 && err.statusInfo.match(/unsupported-text-language/i)) {
          debug('Ignored Alchemy error %d - %s for input %s', err.code, err.statusInfo, text);
          res = {};
        } else {
          return cb(err);
        }
      }

      debug(inspect(res, false, 10));
      cb(null, res);
    });
  }

  function doCombined(parameters, doneCombined) {
    alchemy_language.combined(parameters, function (err, res) {
      if (err) return doneCombined(err);

      doneCombined(null, _.omit(res, ['status', 'usage']));
    });
  }
}
