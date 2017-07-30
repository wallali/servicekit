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

'use strict';

const _ = require('lodash');
const request = require('request');

exports = module.exports = create;

//--

/**
 * The recast client factory.
 * @protected
 * @param {Object} config Configuration for the recast service.
 * @param {string} config.requestToken A REQUEST_TOKEN for the recast.ai API
 * @param {string} [config.apiVersion]
 * @return {Function} The recast client
 */
function create(config, operation) {

  const endpoint = 'https://api.recast.ai';

  const apiVersion = config.apiVersion || 'v2';

  if (!config.requestToken) {
    throw new Error('A request token is required to create the recast client');
  }

  return recastClient;

  //--

  /**
   * @param {string} text The user input
   * @param {Object} [options] Additional options added to the request body
   * @param {string} [options.language] The user input language
   * @param {string} [options.conversation_token] The conversation token for a conversation
   * @param {Object} [options.memory] Prior memory for conversation
   * @param {Function} cb Callback
   */
  function recastClient(text, options, cb) {

    if (typeof (options) === 'function') {
      cb = options;
      options = {};
    }

    if (!text || text.length > 512) {
      let err = new Error('Bad request: Parameter text is required and should be less than 512 characters');
      return process.nextTick(() => cb(err));
    }

    let reqOptions = {
      url: endpoint + '/' + apiVersion + operation,
      method: 'POST',
      json: true,
      body: _.defaults({ text: text }, options)
    };

    request(reqOptions, handleResponse).auth(null, null, true, config.requestToken);

    //--

    function handleResponse(error, response, body) {
      if (error) return cb(error);

      if (response.statusCode !== 200) {
        let err = new Error('Request failed with status ' + response.statusCode);
        return cb(err);
      }

      cb(null, body);
    }
  }
}
