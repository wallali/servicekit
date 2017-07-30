/**
 * Copyright (c) 2017 Ali Lokhandwala <ali@huestones.co.uk>. All Rights Reserved.
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

/** @module recast/analyse */

'use strict';

const clientFactory = require('./callrecast');
const debug = require('debug')('servicekit:recast');

exports = module.exports = create;

//--

/**
 * The recast text analysis service factory.
 * @param {Object} config Configuration for the recast service.
 * @param {string} config.requestToken A REQUEST_TOKEN for the recast.ai API
 * @param {string} [config.language] The language to use for all requests with this client, use '<?' to detect it on first attempt and remember the detected for subsequent attempts
 * @return {Function} The recast text analysis service
 */
function create(config) {

  var client = clientFactory(config, '/request');

  return analyse;

  //--

  function analyse(msg, language, cb) {

    if (typeof (language) === 'function') {
      cb = language;
      language = null;
    }

    var options = {};

    var lang;

    if (config.language && config.language !== '<?') {
      lang = config.language;
    }

    if (language) {
      lang = language;
    }

    options.language = lang;

    debug('Using language', options.language);

    return callClient();

    //--

    function callClient() {
      client(msg, options, function (err, res) {
        if (err) return cb(err);

        if (config.language && config.language === '<?') {
          config.language = res.language;
          debug('Saving detected language for subsequent calls', config.language);
        }

        return cb(null, res);
      });
    }

  }
}
