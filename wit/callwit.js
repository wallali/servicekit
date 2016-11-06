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
const debug = require('debug')('servicekit:wit');

exports = module.exports = create;

//--

/** 
 * The wit service factory.
 * @param {Object} config Configuration for the wit service.
 * @param {string} config.accessToken Wit access token for your app.
 * @param {string} [config.apiVersion]
 * @param {string} [config.userTimezone] Canonical timezone (http://joda-time.sourceforge.net/timezones.html) 
 * @return {Function}
 */
function create(config, operation, method) {

  const wit_endpoint = 'https://api.wit.ai';

  var apiVersion = config.apiVersion || '20160516';
  
  return callwit;

  //--

  /**
   * @param {Object} ctx The conversation context
   * @param {Object} qs The query string params
   * @param {Function} cb Callback
   */
  function callwit(ctx, qs, cb) {

    if (config.userTimezone && !ctx.timezone && !ctx.reference_time) {
      ctx.timezone = config.userTimezone;
      debug('Setting timezone in context', config.userTimezone);
    }

    qs.v = apiVersion;

    let options = {
      url: wit_endpoint + operation,
      method: method,
      json: true,
      qs: qs,
      headers: {
        'Accept': 'application/vnd.wit.' + apiVersion + '+json'
      }
    };

    if (method === 'GET') {
      qs.context = JSON.stringify(ctx);
    } else {
      options.body = ctx;
    }

    request(options, handleResponse).auth(null, null, true, config.accessToken);

    //--

    function handleResponse(error, response, body) {
      if (error) return cb(error);

      if (response.statusCode !== 200) {
        let err = new Error('Unexpected response status ' + response.statusCode);
        if (body && body.error) {
          err.message = body.error;
        }
        return cb(err);
      }

      cb(null, body);
    }
  }
}
