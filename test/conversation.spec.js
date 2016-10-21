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

/* eslint-disable no-unused-vars */

'use strict';

var assert = require('assert');
var sinon = require('sinon');
var watson = require('watson-developer-cloud');
var conversation_factory = require('../conversation');

describe('conversation service', function () {
  var service_config;

  beforeEach(function () {
    service_config = {
      url: 'http://a.url',
      username: 'user',
      password: 'pass',
      version_date: '2016-07-11',
      version: 'v1',
      workspace_id: 'a6402fe8-5103-47ab-8722-5ebda9cd7363'
    };
  });

  describe('factory', function () {
    var watson_mock;

    beforeEach(function () {
      watson_mock = sinon.mock(watson);
    });

    afterEach(function () {
      watson_mock.restore();
    });

    it('Creates watson conversation using config params', function () {
      var watson_conversation = watson_mock.expects('conversation');
      watson_conversation.once().withExactArgs({
        url: service_config.url,
        username: service_config.username,
        password: service_config.password,
        version_date: service_config.version_date,
        version: service_config.version
      });

      conversation_factory(service_config);

      watson_conversation.verify();
    });
  });

  describe('message()', function () {
    var result, err;
    var dummy_watson_conversation = {
      message: function (payload, callback) {
        callback(err, result);
      }
    };

    var message_spy, conversation;
    beforeEach(function () {
      err = null;
      result = null;

      sinon.stub(watson, 'conversation').returns(dummy_watson_conversation);
      message_spy = sinon.spy(dummy_watson_conversation, 'message');

      conversation = conversation_factory(service_config);
    });

    afterEach(function () {
      watson.conversation.restore();
      message_spy.restore();
    });

    it('Passes supplied text and context in payload', function (done) {
      err = {};
      var ctx = {
        conversation_id: 'df8ec57a-cd89-4d4f-af89-a58af58f974b'
      };
      conversation.message('some text', ctx, function (e, r) {
        assert(message_spy.calledOnce);
        assert(message_spy.calledWith({
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
      err = {};
      conversation.message('some text', {}, 'new_workspace', function (e, r) {
        assert(message_spy.calledOnce);
        assert(message_spy.calledWith({
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

    it('Returns error if no workspace id', function (done) {
      service_config.workspace_id = null;
      conversation = conversation_factory(service_config);
      conversation.message('some text', {}, function (e, r) {

        assert(e);
        assert(!r);

        assert(!message_spy.called);
        assert(e.message.match(/Cannot converse without a valid workspace id/i));

        done();
      });
    });

    it('On null context passes empty context in payload', function (done) {
      err = {};
      conversation.message('some text', null, function (e, r) {
        assert(message_spy.calledOnce);
        assert(message_spy.calledWith({
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

    it('Passes results to callback when no error', function (done) {
      result = {
        output: {
          text: ['Which room would you like to paint?']
        }
      };
      conversation.message('some text', {}, function (e, r) {
        assert(message_spy.calledOnce);

        assert(!e, 'Error should be null');
        assert(r, 'Result should not be null');
        assert.deepStrictEqual(r, result);

        done();
      });
    });

    it('Passes error to callback when error', function (done) {
      err = {
        message: 'an error'
      };
      conversation.message('some text', {}, function (e, r) {
        assert(message_spy.calledOnce);

        assert(e, 'Error should not be null');
        assert(!r, 'Result should be null');
        assert.deepStrictEqual(e, err);

        done();
      });
    });

    it('Passes error to callback when error within results', function (done) {
      result = {
        output: {
          error: {
            message: 'an error'
          }
        }
      };
      conversation.message('some text', {}, function (e, r) {
        assert(message_spy.calledOnce);
        assert(e, 'Error should not be null');
        assert(!r);
        assert.deepStrictEqual(e.innerError, result.output.error);

        done();
      });
    });
  });
});