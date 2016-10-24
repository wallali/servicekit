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

var watson = require('watson-developer-cloud');
var debug = require('debug')('servicekit:conversation');
var noop = function () {};

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
module.exports = function create(config) {
  var wtsn_conversation = watson.conversation({
    url: config.url,
    username: config.username || '<username>',
    password: config.password || '<password>',
    version_date: config.version_date,
    version: config.version
  });

  var message = function (text, context, workspaceId, cb) {
    if (typeof (workspaceId) === 'function') {
      cb = workspaceId;
      workspaceId = config.workspace_id;
      debug('Using workspace id from config', workspaceId);
    }

    if (!cb) cb = noop;

    if (!workspaceId) {
      return process.nextTick(
        function () {
          return cb(new Error('Cannot converse without a valid workspace id.'));
        }
      );
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

    var callback = function (err, result) {
      if (!err && result.output.error) {
        err = new Error('Watson result errored. See innerError for details.');
        err.innerError = result.output.error;
      }

      if (err) return cb(err);

      debug('Conversation result:', result);

      cb(null, result);
    };

    wtsn_conversation.message(payload, callback);
  };

  return {
    message: message
  };
};
