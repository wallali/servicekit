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

const ConversationV1 = require('watson-developer-cloud/conversation/v1');
const debug = require('debug')('servicekit:conversation');
const noop = () => 0;

exports = module.exports = create;
exports.newConversation = _newConversation;

//--

/**
 * Helper creates a new instance of the watson service.
 */
function _newConversation(config) {
  return new ConversationV1({
    username: config.username,
    password: config.password,
    version_date: config.version_date
  });
}

/** 
 * The conversation service wrapper factory.
 * @param {Object} config Configuration for the dialog service.
 * @param {string} config.username 
 * @param {string} config.password 
 * @param {string} [config.version_date] Defaults to 2017-02-03.
 * @param {string} [config.workspace_id] Workspace Id for dialog service.
 * @param {string} [config.userTimezone] A supported timezone string (https://www.ibm.com/watson/developercloud/doc/conversation/supported-timezones.html) 
 * @return {Function}
 */
function create(config) {
  config.version_date = config.version_date || ConversationV1.VERSION_DATE_2017_02_03;

  var watsonConverse = exports.newConversation(config);

  return message;

  //--

  function message(text, context, workspaceId, cb) {
    if (typeof (workspaceId) === 'function') {
      cb = workspaceId;
      workspaceId = config.workspace_id;
    }

    if (!cb) cb = noop;

    if (!workspaceId) {
      return process.nextTick(() => cb(new Error('A valid workspace id is required.')));
    }

    debug('Using workspace id %s', workspaceId);

    var ctx = context || {};

    if (config.userTimezone && !ctx.timezone) {
      ctx.timezone = config.userTimezone;
      debug('Setting timezone in context', config.userTimezone);
    }

    var payload = {
      workspace_id: workspaceId,
      input: {
        text: text
      },
      alternate_intents: false,
      context: ctx
    };

    process.nextTick(() =>
      watsonConverse.message(payload, callback));

    return {
      with: payloadExtender
    };

    function payloadExtender(intents, entities, output) {
      if (intents) {
        payload.intents = intents;
      }

      if (entities) {
        payload.entities = entities;
      }

      if (output) {
        payload.output = output;
      }
    }

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
