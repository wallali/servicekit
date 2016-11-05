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
const nock = require('nock');
const factory = require('../bingspell');

describe('spellcheck', function () {
  before(function () {
    nock.disableNetConnect();
  });

  after(function () {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  const bingUrl = 'https://api.cognitive.microsoft.com/bing';

  var config = { subscriptionKey: '123' };
  var response = {};
  var utterance = 'thsi is soem text';

  beforeEach(function () {
    config = { subscriptionKey: '123' };
    utterance = 'thsi is soem text';
    response = {
      _type: 'SpellCheck',
      flaggedTokens: [{
          offset: 0,
          token: 'thsi',
          type: 'UnknownToken',
          suggestions: [{ suggestion: 'this', score: 1 }]
        },
        {
          offset: 8,
          token: 'soem',
          type: 'UnknownToken',
          suggestions: [{ suggestion: 'some', score: 1 }]
        }]
    };
  });

  function setSuccessScope(query) {
    let q = query || {
      text: utterance,
      mode: 'spell',
      mkt: 'en-us',
      preContextText: '',
      postContextText: ''
    };

    return nock(bingUrl)
      .get(/v\d?\.\d?\/spellcheck/)
      .query(q)
      .reply(200, response);
  }

  describe('config', function () {

    var q;

    beforeEach(function () {
      q = {
        text: utterance,
        mode: 'spell',
        mkt: 'en-us',
        preContextText: '',
        postContextText: ''
      };
    });

    it('Uses subscriptionKey from config and sets key header correctly', function (done) {
      var scope = nock(bingUrl, {
          reqheaders: {
            'Ocp-Apim-Subscription-Key': config.subscriptionKey
          }
        })
        .get(/v\d?\.\d?\/spellcheck/)
        .reply(200, response);

      var spellcheck = factory(config);
      spellcheck(utterance, function (err, resp) {
        assert(!err);
        assert(resp);
        assert(scope.isDone());

        done();
      });
    });

    it('Uses language from config', function (done) {
      config.language = 'en-gb';
      q.mkt = config.language;

      var scope = nock(bingUrl)
        .get(/v\d?\.\d?\/spellcheck/)
        .query(q)
        .reply(200, response);

      var spellcheck = factory(config);
      spellcheck(utterance, function (err, resp) {
        assert(!err);
        assert(resp);
        assert(scope.isDone());

        done();
      });
    });

    it('Uses mode from config', function (done) {
      config.mode = factory.mode.proof;
      q.mode = config.mode;

      var scope = nock(bingUrl)
        .get(/v\d?\.\d?\/spellcheck/)
        .query(q)
        .reply(200, response);

      var spellcheck = factory(config);
      spellcheck(utterance, function (err, resp) {
        assert(!err);
        assert(resp);
        assert(scope.isDone());

        done();
      });
    });

    it('Uses corrector from config', function (done) {
      config.correct = sinon.stub().returns({});

      var scope = nock(bingUrl)
        .get(/v\d?\.\d?\/spellcheck/)
        .reply(200, response);

      var spellcheck = factory(config);
      spellcheck(utterance, function (err, resp) {
        assert(!err);
        assert(resp);
        assert(scope.isDone());
        assert(config.correct.calledOnce);
        assert.deepStrictEqual(resp, {});
        done();
      });
    });

    it('Uses version from config', function (done) {
      config.apiVersion = 'v6.0';
      var scope = nock(bingUrl)
        .get(/v6\.0/)
        .reply(200, response);

      var spellcheck = factory(config);
      spellcheck(utterance, function (err, resp) {
        assert(!err);
        assert(resp);
        assert(scope.isDone());

        done();
      });
    });

  });

  describe('spellcheck', function () {

    it('Calls service and returns response', function (done) {
      var scope = setSuccessScope({
        text: utterance,
        mode: 'spell',
        mkt: 'en-us',
        preContextText: 'pre',
        postContextText: 'post'
      });

      var spellcheck = factory(config);
      spellcheck(utterance, 'pre', 'post', function (err, resp) {
        assert(!err);
        assert(resp);
        assert(scope.isDone());

        done();
      });
    });

    it('Works without optional post context', function (done) {
      var scope = setSuccessScope({
        text: utterance,
        mode: 'spell',
        mkt: 'en-us',
        preContextText: 'pre',
        postContextText: ''
      });

      var spellcheck = factory(config);
      spellcheck(utterance, 'pre', function (err, resp) {
        assert(!err);
        assert(resp);
        assert(scope.isDone());

        done();
      });
    });

    it('Works without optional pre context', function (done) {
      var scope = setSuccessScope();

      var spellcheck = factory(config);
      spellcheck(utterance, function (err, resp) {
        assert(!err);
        assert(resp);
        assert(scope.isDone());

        done();
      });
    });

    it('On error returns error', function (done) {
      var scope = nock(bingUrl)
        .get(/v\d?\.\d?\/spellcheck/)
        .replyWithError('some error');

      var spellcheck = factory(config);
      spellcheck(utterance, function (err, resp) {
        assert(err);
        assert(!resp);
        assert(scope.isDone());

        done();
      });
    });

    it('Handles error response', function (done) {
      var scope = nock(bingUrl)
        .get(/v\d?\.\d?\/spellcheck/)
        .reply(400, {});

      var spellcheck = factory(config);
      spellcheck(utterance, function (err, resp) {
        assert(err);
        assert(!resp);
        assert(scope.isDone());

        done();
      });
    });

    it('Handles error response with no body', function (done) {
      var scope = nock(bingUrl)
        .get(/v\d?\.\d?\/spellcheck/)
        .reply(400, null);

      var spellcheck = factory(config);
      spellcheck(utterance, function (err, resp) {
        assert(err);
        assert(!resp);
        assert(scope.isDone());

        done();
      });
    });

    it('Handles error response with possible explanatory message', function (done) {
      var scope = nock(bingUrl)
        .get(/v\d?\.\d?\/spellcheck/)
        .reply(400, { message: 'an explanation' });

      var spellcheck = factory(config);
      spellcheck(utterance, function (err, resp) {
        assert(err);
        assert(!resp);
        assert(scope.isDone());

        assert.strictEqual(err.message, 'an explanation');
        done();
      });
    });

    it('Handles error response with multiple errors', function (done) {
      var scope = nock(bingUrl)
        .get(/v\d?\.\d?\/spellcheck/)
        .reply(400, {
          errors: [
            { message: 'an explanation' },
            { message: 'another explanation' }
        ]
        });

      var spellcheck = factory(config);
      spellcheck(utterance, function (err, resp) {
        assert(err);
        assert(err.errors);
        assert(!resp);
        assert(scope.isDone());

        assert.strictEqual(err.message, 'an explanation');
        done();
      });
    });
  });

  describe('replace', function () {
    it('Replaces corrections into text', function (done) {
      setSuccessScope();

      var spellcheck = factory(config);
      spellcheck(utterance, function (err, resp) {
        assert(!err);
        assert(resp);

        assert.strictEqual(resp, 'this is some text');

        done();
      });
    });

    it('Works when no corrections', function (done) {
      response.flaggedTokens = [];
      setSuccessScope();

      var spellcheck = factory(config);
      spellcheck(utterance, function (err, resp) {
        assert(!err);
        assert(resp);
        assert.strictEqual(resp, utterance);

        done();
      });
    });
  });

});
