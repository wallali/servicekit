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
const debug = require('debug')('servicekit:wit');

/** 
 * The wit service factory.
 * @param {Object} config Configuration for the wit service.
 * @param {string} config.accessToken Wit access token for your app.
 * @param {string} [config.apiVersion]
 * @param {string} [config.userTimezone] Canonical timezone (http://joda-time.sourceforge.net/timezones.html) 
 * @return {Function}
 */
module.exports = function create(config) {

  var apiVersion = config.apiVersion || '20160516';

  var message = function (text, context, cb) {
    if (typeof (context) === 'function') {
      cb = context;
      context = {};
    }

    if (!cb) cb = noop;

    var ctx = context || {};

    if (config.userTimezone && !ctx.timezone && !ctx.reference_time) {
      ctx.timezone = config.userTimezone;
      debug('Setting timezone in context', config.userTimezone);
    }

    var handleResponse = function (error, response, body) {
      if (error) return cb(error);

      if (response.statusCode !== 200) {
        let err = new Error('Unexpected response status ' + response.statusCode);
        if (body && body.error) {
          err.message = body.error;
        }
        return cb(err);
      }

      cb(null, body);
    };

    let options = {
      url: 'https://api.wit.ai/message',
      method: 'GET',
      json: true,
      qs: {
        v: apiVersion,
        q: text,
        context: JSON.stringify(ctx)
      },
      headers: {
        'Accept': 'application/vnd.wit.' + apiVersion + '+json'
      }
    };

    request.get(options, handleResponse).auth(null, null, true, config.accessToken);
  };

  return {
    message: message
  };
};
