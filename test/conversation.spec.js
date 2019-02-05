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

const assert = require('assert');
const sinon = require('sinon');
const conversation_factory = require('../conversation');

describe('conversation service', function () {
  var service_config;
  var fake_conversation;
  var conversation_result;

  beforeEach(function () {
    service_config = {
      username: 'user',
      password: 'pass',
      workspace_id: 'a6402fe8-5103-47ab-8722-5ebda9cd7363',
      iam_apikey: 'api_key'
    };
    conversation_result = { output: {} };

    fake_conversation = {
      message: sinon.stub()
    };

    fake_conversation.message.callsArgWith(1, null, conversation_result);
  });

  afterEach(function () {
    fake_conversation.message.reset();
  });

  describe('factory', function () {
    beforeEach(function () {
      sinon.spy(conversation_factory, 'newConversation');
    });

    afterEach(function () {
      conversation_factory.newConversation.restore();
    });

    it('Creates watson conversation using config params', function () {
      service_config.version_date = 'a date';
      service_config.headers = {
        'X-Watson-Metadata': 'customer_id=abc'
      };
      conversation_factory(service_config);

      assert(conversation_factory.newConversation.calledOnce);
      assert.strictEqual(conversation_factory.newConversation.args[0][0].username, service_config.username);
      assert.strictEqual(conversation_factory.newConversation.args[0][0].password, service_config.password);
      assert.strictEqual(conversation_factory.newConversation.args[0][0].iam_apikey, service_config.iam_apikey);
      assert.strictEqual(conversation_factory.newConversation.args[0][0].version_date, 'a date');
      assert.deepStrictEqual(conversation_factory.newConversation.args[0][0].headers, {'X-Watson-Metadata': 'customer_id=abc'});

    });

    it('Creates watson conversation using config params and default version date', function () {
      conversation_factory(service_config);

      assert(conversation_factory.newConversation.calledOnce);
      assert.strictEqual(conversation_factory.newConversation.args[0][0].username, service_config.username);
      assert.strictEqual(conversation_factory.newConversation.args[0][0].password, service_config.password);
      assert.strictEqual(conversation_factory.newConversation.args[0][0].version_date, '2017-02-27');
      assert.strictEqual(conversation_factory.newConversation.args[0][0].use_unauthenticated, false);
      assert.deepStrictEqual(conversation_factory.newConversation.args[0][0].headers, {});

    });
  });

  describe('message()', function () {

    conversation_factory.newConversation = () => fake_conversation;

    var message, conversation;

    beforeEach(function () {

      message = fake_conversation.message;

      conversation = conversation_factory(service_config);
    });

    it('Passes supplied text and context in payload', function (done) {
      var ctx = {
        conversation_id: 'df8ec57a-cd89-4d4f-af89-a58af58f974b'
      };
      conversation('some text', ctx, function () {
        assert(message.calledOnce);
        assert(message.calledWith({
          workspace_id: service_config.workspace_id,
          input: {
            text: 'some text'
          },
          alternate_intents: false,
          context: ctx
        }));

        done();
      });
    });

    it('Passes supplied workspace_id in payload', function (done) {
      conversation('some text', {}, 'new_workspace', function () {
        assert(message.calledOnce);
        assert(message.calledWith({
          workspace_id: 'new_workspace',
          input: {
            text: 'some text'
          },
          alternate_intents: false,
          context: {}
        }));

        done();
      });
    });

    it('Adds intents to message', function (done) {
      conversation('some text', null, function () {
        assert(message.calledOnce);
        assert(message.calledWith({
          workspace_id: service_config.workspace_id,
          input: {
            text: 'some text'
          },
          alternate_intents: false,
          context: {},
          intents: ['one', 'two']
        }));

        done();
      }).with(['one', 'two']);
    });

    it('Adds entities to message', function (done) {
      conversation('some text', null, function () {
        assert(message.calledOnce);
        assert(message.calledWith({
          workspace_id: service_config.workspace_id,
          input: {
            text: 'some text'
          },
          alternate_intents: false,
          context: {},
          entities: ['one', 'two']
        }));

        done();
      }).with(null, ['one', 'two']);
    });

    it('Adds output to message', function (done) {
      conversation('some text', null, function () {
        assert(message.calledOnce);
        assert(message.calledWith({
          workspace_id: service_config.workspace_id,
          input: {
            text: 'some text'
          },
          alternate_intents: false,
          context: {},
          output: { text: 'output' }
        }));

        done();
      }).with(null, null, { text: 'output' });
    });

    it('Switches on alternate_intents in the payload when requested', function (done) {
      conversation('some text', null, function () {
        assert(message.calledOnce);
        assert(message.calledWith({
          workspace_id: service_config.workspace_id,
          input: {
            text: 'some text'
          },
          alternate_intents: true,
          context: {}
        }));

        done();
      }).allIntents();
    });

    it('Allows multiple payload extension chaining', function (done) {
      conversation('some text', null, function () {
        assert(message.calledOnce);
        assert(message.calledWith({
          workspace_id: service_config.workspace_id,
          input: {
            text: 'some text'
          },
          alternate_intents: true,
          context: {},
          output: { text: 'output' }
        }));

        done();
      })
        .with(null, null, { text: 'output' })
        .allIntents();
    });

    it('Returns error if no workspace id', function (done) {
      service_config.workspace_id = null;
      conversation = conversation_factory(service_config);
      conversation('some text', {}, function (e, r) {

        assert(e);
        assert(!r);

        assert(!message.called);
        assert(e.message.match(/A valid workspace id is required/i));

        done();
      });
    });

    it('On null context passes empty context in payload', function (done) {
      conversation('some text', null, function () {
        assert(message.calledOnce);
        assert(message.calledWith({
          workspace_id: service_config.workspace_id,
          input: {
            text: 'some text'
          },
          alternate_intents: false,
          context: {}
        }));

        done();
      });
    });

    it('Passes config all_intents in payload', function (done) {
      service_config.all_intents = true;
      conversation = conversation_factory(service_config);
      conversation('some text', {}, 'new_workspace', function () {
        assert(message.calledOnce);
        assert(message.calledWith({
          workspace_id: 'new_workspace',
          input: {
            text: 'some text'
          },
          alternate_intents: true,
          context: {}
        }));

        done();
      });
    });

    it('Adds config timezone to context', function (done) {
      service_config.userTimezone = 'Europe/London';
      conversation = conversation_factory(service_config);
      conversation('some text', {}, function () {
        assert(message.calledOnce);
        assert(message.calledWith({
          workspace_id: service_config.workspace_id,
          input: {
            text: 'some text'
          },
          alternate_intents: false,
          context: {
            timezone: 'Europe/London'
          }
        }));

        done();
      });
    });

    it('Ignores config timezone if context timezone supplied', function (done) {
      service_config.userTimezone = 'Europe/London';
      conversation = conversation_factory(service_config);
      conversation('some text', { timezone: 'Etc/GMT' }, function () {
        assert(message.calledOnce);
        assert(message.calledWith({
          workspace_id: service_config.workspace_id,
          input: {
            text: 'some text'
          },
          alternate_intents: false,
          context: {
            timezone: 'Etc/GMT'
          }
        }));

        done();
      });
    });

    it('Passes results to callback when no error', function (done) {
      conversation_result.output = {
        text: ['Which room would you like to paint?']
      };
      conversation('some text', {}, function (e, r) {
        assert(message.calledOnce);

        assert(!e, 'Error should be null');
        assert(r, 'Result should not be null');
        assert.deepStrictEqual(r, conversation_result);

        done();
      });
    });

    it('Passes error to callback when error', function (done) {
      var err = {
        message: 'an error'
      };
      message.callsArgWith(1, err);
      conversation('some text', {}, function (e, r) {
        assert(message.calledOnce);

        assert(e, 'Error should not be null');
        assert(!r, 'Result should be null');
        assert.deepStrictEqual(e, err);

        done();
      });
    });

    it('Passes error to callback when error within results', function (done) {
      conversation_result.output = {
        error: {
          message: 'an error'
        }
      };
      conversation('some text', {}, function (e, r) {
        assert(message.calledOnce);
        assert(e, 'Error should not be null');
        assert(!r);
        assert.deepStrictEqual(e.innerError, conversation_result.output.error);

        done();
      });
    });

  });
});
