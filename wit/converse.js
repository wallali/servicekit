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

/** @module wit/converse */

'use strict';

const _ = require('lodash');
const noop = () => 0;
const cw = require('./callwit');

const deprecate = _.once(() => console.warn('WARNING!! Wit.ai will stop serving requests to the /converse endpoint on February 1st 2018. See: https://wit.ai/blog/2017/07/27/sunsetting-stories'));

exports = module.exports = create;

//--

/**
 * The wit converse service factory.
 * @deprecated Wit.ai will stop serving requests to the /converse endpoint on February 1st 2018
 * @param {Object} config Configuration for the wit service.
 * @param {string} config.accessToken Wit access token for your app.
 * @param {string} [config.apiVersion]
 * @param {string} [config.userTimezone] Canonical timezone (http://joda-time.sourceforge.net/timezones.html)
 * @return {Function} The wit converse service
 */
function create(config) {
  deprecate();

  const callwit = cw(config, '/converse', 'POST');

  return converse;

  //--

  function converse(text, sessionId, context, reset, cb) {

    if (typeof (context) === 'function') {
      cb = context;
      context = {};
    }

    if (typeof (reset) === 'function') {
      cb = reset;
      reset = false;
    }

    if (!cb) cb = noop;

    var ctx = context || {};

    var qs = {
      session_id: sessionId
    };

    if (text) {
      qs.q = text;
    }

    if (reset) {
      qs.reset = 'true';
    }

    callwit(ctx, qs, cb);
  }
}
