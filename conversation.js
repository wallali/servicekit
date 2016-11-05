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

const watson = require('watson-developer-cloud');
const debug = require('debug')('servicekit:conversation');
const deprecate = require('deprecate');
const noop = function () {};

exports = module.exports = create;

//--

/** 
 * The conversation service wrapper factory.
 * @param {Object} config Configuration for the dialog service.
 * @param {string} config.url 
 * @param {string} config.username 
 * @param {string} config.password 
 * @param {string} config.version_date 
 * @param {string} config.version 
 * @param {string} [config.workspace_id] Workspace Id for dialog service.
 * @return {Function}
 */
function create(config) {
  var watsonConverse = watson.conversation({
    url: config.url,
    username: config.username || '<username>',
    password: config.password || '<password>',
    version_date: config.version_date,
    version: config.version
  });

  message.message = function (text, context, workspaceId, cb) {
    deprecate('The .message() operation is deprecated since version 0.2.1. Instead you should use the parent directly. It has the same signature.');
    return message(text, context, workspaceId, cb);
  };

  return message;

  //--

  function message(text, context, workspaceId, cb) {
    if (typeof (workspaceId) === 'function') {
      cb = workspaceId;
      workspaceId = config.workspace_id;
      debug('Using workspace id from config', workspaceId);
    }

    if (!cb) cb = noop;

    if (!workspaceId) {
      return process.nextTick(() => cb(new Error('A valid workspace id is required.')));
    }

    var ctx = context || {};

    var payload = {
      workspace_id: workspaceId,
      input: {
        text: text
      },
      alternate_intents: false,
      context: ctx
    };

    watsonConverse.message(payload, callback);

    //--

    function callback(err, result) {
      if (!err && result.output.error) {
        err = new Error('Watson result errored. See innerError for details.');
        err.innerError = result.output.error;
      }

      if (err) return cb(err);

      debug('Conversation result:', result);

      cb(null, result);
    }
  }
}
