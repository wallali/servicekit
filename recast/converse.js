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

/** @module recast/converse */

'use strict';

const clientFactory = require('./callrecast');
const debug = require('debug')('servicekit:recast');

exports = module.exports = create;

//--

/**
 * The recast conversation service factory.
 * @param {Object} config Configuration for the recast service.
 * @param {string} config.requestToken A REQUEST_TOKEN for the recast.ai API
 * @param {string} [config.language] The language to use for all requests with this client, use '<?' to detect it on first attempt and remember the detected for subsequent attempts
 * @return {Function} The recast conversation service {@link recast.converse}
 */
function create(config) {

  var client = clientFactory(config, '/converse');

  return converse;

  //--

  /**
   * Converse using the react converse endpoint. Chain in language override and/or memory.
   * @memberOf recast
   * @async
   * @param {string} msg The message to converse with
   * @param {string} [conversationToken]
   * @param {function} cb callback(err, result)
   *
   * @example
   * converse('hello', cb).in('en').recall(memory)
   */
  function converse(msg, conversationToken, cb) {
    if (typeof (conversationToken) === 'function') {
      cb = conversationToken;
      conversationToken = null;
    }

    var options = {};

    if (conversationToken) {
      options.conversation_token = conversationToken;
      debug('Using conversation token', conversationToken);
    }

    if (config.language && config.language !== '<?') {
      options.language = config.language;
      debug('Using language', config.language);
    }

    const extenders = {
      in: (language) => {
        options.language = language;
        return extenders;
      },
      recall: (memory) => {
        options.memory = memory;
        return extenders;
      }
    };

    process.nextTick(() => callClient());

    return extenders;

    //--

    function callClient() {
      client(msg, options, function (err, res) {
        if (err) return cb(err);

        if (config.language && config.language === '<?') {
          config.language = res.results.language;
          debug('Saving detected language for subsequent calls', config.language);
        }

        return cb(null, res);
      });
    }

  }
}
