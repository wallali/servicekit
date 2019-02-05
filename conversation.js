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

/** @module watson/assistant */

'use strict';

const AssistantV1 = require('watson-developer-cloud/assistant/v1');
const debug = require('debug')('servicekit:conversation');
const noop = () => 0;

exports = module.exports = create;
exports.newConversation = _newConversation;

//--

/**
 * Helper creates a new instance of the watson service.
 * @private
 * @returns {AssistantV1}
 */
function _newConversation(config) {
  return new AssistantV1({
    url: config.url,
    username: config.username,
    password: config.password,
    iam_apikey: config.iam_apikey,
    iam_access_token: config.iam_access_token,
    iam_url: config.iam_url,
    version: config.version_date,
    use_unauthenticated: config.use_unauthenticated,
    headers: config.headers
  });
}

/**
 * Construct a AssistantV1 object.
 * @param {Object} options - Options for the service.
 * @param {string} options.version - The API version date to use with the service, in "YYYY-MM-DD" format. Whenever the API is changed in a backwards incompatible way, a new minor version of the API is released. The service uses the API version for the date you specify, or the most recent version before that date. Note that you should not programmatically specify the current date at runtime, in case the API has been updated since your application's release. Instead, specify a version date that is compatible with your application, and don't change it until your application is ready for a later version.
 * @param {string} [options.version_date] - The API version date to use with the service, in "YYYY-MM-DD" format. Whenever the API is changed in a backwards incompatible way, a new minor version of the API is released. The service uses the API version for the date you specify, or the most recent version before that date. Note that you should not programmatically specify the current date at runtime, in case the API has been updated since your application's release. Instead, specify a version date that is compatible with your application, and don't change it until your application is ready for a later version.
 * @param {string} [options.url] - The base url to use when contacting the service (e.g. 'https://gateway.watsonplatform.net/assistant/api'). The base url may differ between Bluemix regions.
 * @param {string} [options.username] - The username used to authenticate with the service. Username and password credentials are only required to run your application locally or outside of Bluemix. When running on Bluemix, the credentials will be automatically loaded from the `VCAP_SERVICES` environment variable.
 * @param {string} [options.password] - The password used to authenticate with the service. Username and password credentials are only required to run your application locally or outside of Bluemix. When running on Bluemix, the credentials will be automatically loaded from the `VCAP_SERVICES` environment variable.
 * @param {string} [options.iam_apikey] - An API key that can be used to request IAM tokens.
 * @param {string} [options.iam_access_token] - An IAM access token fully managed by the application.
 * @param {string} [options.iam_url] -An optional URL for the IAM service API.
 * @param {boolean} [options.use_unauthenticated] - Set to `true` to avoid including an authorization header. This option may be useful for requests that are proxied.
 * @param {Object} [options.headers] - Default headers that shall be included with every request to the service.
 * @param {string} [config.workspace_id] Workspace Id for dialog service.
 * @param {string} [config.userTimezone] A supported timezone string (https://www.ibm.com/watson/developercloud/doc/conversation/supported-timezones.html)
 * @param {string} [config.all_intents] Set to true to return all intents with their corresponding confidences. Otherwise returns only the top most confident intent. Default false.
 */
function create(config) {
  config.version_date = config.version || config.version_date || '2017-02-27';
  config.headers = config.headers || {};
  config.use_unauthenticated = config.use_unauthenticated || false;

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
      alternate_intents: config.all_intents || false,
      context: ctx
    };

    process.nextTick(() =>
      watsonConverse.message(payload, callback));

    var modifiers =  {
      with: payloadExtender,
      allIntents: allIntents
    };

    return modifiers;

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

      return modifiers;
    }

    function allIntents() {
      payload.alternate_intents = true;

      return modifiers;
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
