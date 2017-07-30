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

/** @module wit/message */

'use strict';

const noop = function () {};
const cw = require('./callwit');

exports = module.exports = create;

//--

/** 
 * The wit message service factory.
 * @param {Object} config Configuration for the wit service.
 * @param {string} config.accessToken Wit access token for your app.
 * @param {string} [config.apiVersion]
 * @param {string} [config.userTimezone] Canonical timezone (http://joda-time.sourceforge.net/timezones.html) 
 * @return {Function} The wit message service
 */
function create(config) {

  var callwit = cw(config, '/message', 'GET');
  
  return message;

  //--

  function message(text, context, cb) {
    if (typeof (context) === 'function') {
      cb = context;
      context = {};
    }

    if (!cb) cb = noop;

    var ctx = context || {};

    var qs = { q: text };

    callwit(ctx, qs, cb);
  }
}
